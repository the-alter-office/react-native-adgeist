import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, StyleSheet, Text, View } from 'react-native';
import { track } from '../analytics/eventBus';
import { flagsStore } from '../state/flags';
import type { Tier } from '../state/entitlement';
import { colors, radius, spacing } from '../theme';
import type { AdPlayOutcome, IAdCreative, IAdPlaybackHost, IAdsManager } from '../types/ads';
import type { IVideoSource } from '../types/content';
import { AdOverlay, type AdOverlayState } from './AdOverlay';
import { createAdsManager } from './ads/createAdsManager';

const AD_MEDIA_LOAD_TIMEOUT_SEC = 8;

type PlayerSurfaceProps = {
  contentId: string;
  source: IVideoSource;
  tier: Tier;
  isAdFundedUnlock: boolean;
  onAdsManagerLabel: (label: string) => void;
};

export function PlayerSurface({ contentId, source, tier, isAdFundedUnlock, onAdsManagerLabel }: PlayerSurfaceProps) {
  const contentPlayer = useVideoPlayer(source.url, (player) => {
    player.timeUpdateEventInterval = 0.5;
  });
  const adPlayer = useVideoPlayer(null, (player) => {
    player.timeUpdateEventInterval = 0.25;
  });

  const [adState, setAdState] = useState<AdOverlayState>({ kind: 'idle' });
  const [isLiveBreak, setIsLiveBreak] = useState(false);
  const managerRef = useRef<IAdsManager | null>(null);
  const resolveAdRef = useRef<((outcome: AdPlayOutcome) => void) | null>(null);
  const adTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentAdRef = useRef<IAdCreative | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const finishAd = useCallback(
    (outcome: AdPlayOutcome) => {
      try {
        if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
        adTimeoutRef.current = null;
        currentAdRef.current = null;
        adPlayer.pause();
        setAdState((prev) => (prev.kind === 'playing' ? { kind: 'idle' } : prev));
        const resolve = resolveAdRef.current;
        resolveAdRef.current = null;
        resolve?.(outcome);
      } catch (error) {
        console.error(error);
      }
    },
    [adPlayer],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      appStateRef.current = next;
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const host: IAdPlaybackHost = {
      showAdLoading: (visible) => setAdState((prev) => (prev.kind === 'playing' ? prev : visible ? { kind: 'loading' } : { kind: 'idle' })),
      playAd: (creative, position) =>
        new Promise<AdPlayOutcome>((resolve) => {
          resolveAdRef.current = resolve;
          currentAdRef.current = creative;
          adPlayer.replace({ uri: creative.mediaUrl });
          adPlayer.play();
          setIsLiveBreak(position.breakPosition === 'midroll' && source.isLive && contentPlayer.playing);
          setAdState({ kind: 'playing', creative, position });
          adTimeoutRef.current = setTimeout(() => finishAd('error'), (creative.durationSec + AD_MEDIA_LOAD_TIMEOUT_SEC) * 1000);
        }),
      stopAd: () => finishAd('aborted'),
      setContentMuted: (muted) => {
        contentPlayer.muted = muted;
      },
      pauseContent: () => contentPlayer.pause(),
      resumeContent: () => contentPlayer.play(),
      isAppActive: () => appStateRef.current === 'active',
    };

    const manager = createAdsManager({ contentId, source, host, flags: flagsStore.get(), tier, isAdFundedUnlock });
    managerRef.current = manager;
    onAdsManagerLabel(manager.label);
    let cancelled = false;

    const startPlayback = async () => {
      try {
        await manager.startPreRoll();
      } catch (error) {
        console.error(error);
      }
      if (!cancelled) contentPlayer.play();
    };
    startPlayback();

    return () => {
      cancelled = true;
      manager.dispose();
      managerRef.current = null;
      finishAd('aborted');
      contentPlayer.pause();
    };
  }, [contentId, source, tier, isAdFundedUnlock, adPlayer, contentPlayer, finishAd, onAdsManagerLabel]);

  useEventListener(contentPlayer, 'timeUpdate', ({ currentTime }) => {
    managerRef.current?.onContentTime(currentTime);
  });

  useEventListener(contentPlayer, 'playingChange', ({ isPlaying }) => {
    if (isPlaying) managerRef.current?.onFirstFrame();
    managerRef.current?.onContentPlayingChange(isPlaying);
  });

  useEventListener(adPlayer, 'playToEnd', () => finishAd('completed'));

  useEventListener(adPlayer, 'statusChange', ({ status }) => {
    if (status === 'error' && currentAdRef.current) finishAd('error');
  });

  useEventListener(adPlayer, 'timeUpdate', ({ currentTime }) => {
    const creative = currentAdRef.current;
    if (creative && currentTime >= creative.durationSec) finishAd('completed');
  });

  const handleLearnMore = useCallback((creative: IAdCreative) => {
    try {
      track('adClicked', { adId: creative.adId, advertiser: creative.advertiser });
      Alert.alert(creative.advertiser, `${creative.headline}\n\n(Dummy advertiser landing page)`);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleSkip = useCallback(() => finishAd('skipped'), [finishAd]);

  return (
    <View style={styles.frame}>
      <VideoView
        player={contentPlayer}
        style={StyleSheet.absoluteFill}
        nativeControls={adState.kind === 'idle'}
        contentFit="contain"
        allowsPictureInPicture
        testID="content-video"
      />
      {source.isLive && adState.kind === 'idle' ? (
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>● LIVE</Text>
        </View>
      ) : null}
      <AdOverlay state={adState} adPlayer={adPlayer} isLiveBreak={isLiveBreak} onSkip={handleSkip} onLearnMore={handleLearnMore} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.black },
  liveBadge: { position: 'absolute', top: spacing.sm, left: spacing.sm, backgroundColor: colors.live, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  liveText: { color: colors.text, fontSize: 11, fontWeight: '800' },
});
