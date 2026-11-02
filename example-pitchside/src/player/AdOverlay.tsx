import { useEvent } from 'expo';
import { VideoView, type VideoPlayer } from 'expo-video';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { IAdCreative, IAdPosition } from '../types/ads';

export type AdOverlayState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'playing'; creative: IAdCreative; position: IAdPosition };

type AdOverlayProps = {
  state: AdOverlayState;
  adPlayer: VideoPlayer;
  isLiveBreak: boolean;
  onSkip: () => void;
  onLearnMore: (creative: IAdCreative) => void;
};

export function AdOverlay({ state, adPlayer, isLiveBreak, onSkip, onLearnMore }: AdOverlayProps) {
  const { currentTime } = useEvent(adPlayer, 'timeUpdate', { currentTime: 0, currentLiveTimestamp: null, currentOffsetFromLive: null, bufferedPosition: 0 });

  if (state.kind === 'idle') return null;

  if (state.kind === 'loading') {
    return (
      <View style={styles.loading} testID="ad-loading-overlay">
        <ActivityIndicator color={colors.text} />
        <Text style={styles.loadingText}>Your video will start after a short ad</Text>
      </View>
    );
  }

  const { creative, position } = state;
  const remaining = Math.max(0, Math.ceil(creative.durationSec - currentTime));
  const skipIn = creative.skipOffsetSec === null ? null : Math.max(0, Math.ceil(creative.skipOffsetSec - currentTime));

  return (
    <View style={styles.container} testID="ad-overlay">
      <VideoView player={adPlayer} style={StyleSheet.absoluteFill} nativeControls={false} contentFit="contain" />
      <View style={styles.topBar}>
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>AD</Text>
        </View>
        <Text style={styles.meta}>
          {creative.isBumper ? 'Sponsor' : `Ad ${position.index} of ${position.total}`} · {remaining}s
        </Text>
        {isLiveBreak ? <Text style={styles.meta}> · Live continues after the break</Text> : null}
      </View>
      <View style={styles.bottomBar}>
        <Pressable style={styles.cta} onPress={() => onLearnMore(creative)} testID="ad-learn-more">
          <Text style={styles.ctaText} numberOfLines={1}>
            {creative.advertiser} · Learn more
          </Text>
        </Pressable>
        {skipIn === null ? null : (
          <Pressable
            style={[styles.skip, skipIn > 0 && styles.skipDisabled]}
            disabled={skipIn > 0}
            onPress={onSkip}
            testID="ad-skip"
          >
            <Text style={styles.skipText}>{skipIn > 0 ? `Skip in ${skipIn}` : 'Skip ad ›'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { ...StyleSheet.absoluteFill, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { color: colors.textMuted, fontSize: 13 },
  container: { ...StyleSheet.absoluteFill, backgroundColor: colors.black },
  topBar: { position: 'absolute', top: spacing.sm, left: spacing.sm, right: spacing.sm, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  adBadge: { backgroundColor: colors.ad, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2, marginRight: spacing.sm },
  adBadgeText: { color: colors.black, fontWeight: '800', fontSize: 11 },
  meta: { color: colors.text, fontSize: 12, textShadowColor: colors.black, textShadowRadius: 4 },
  bottomBar: { position: 'absolute', bottom: spacing.sm, left: spacing.sm, right: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  cta: { flexShrink: 1, backgroundColor: colors.overlay, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  ctaText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  skip: { backgroundColor: colors.overlay, borderColor: colors.text, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  skipDisabled: { opacity: 0.6 },
  skipText: { color: colors.text, fontSize: 12, fontWeight: '700' },
});
