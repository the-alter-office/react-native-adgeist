import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { loadDisplayAd, type IDisplayCreative } from '../api/mock/displayAdServer';
import { track } from '../analytics/eventBus';
import { useEntitlement } from '../state/entitlement';
import { useFlags } from '../state/flags';
import { colors, radius, spacing } from '../theme';
import type { IAdSlotConfig, IHouseBanner } from '../types/content';

type SlotState = { kind: 'loading' } | { kind: 'filled'; creative: IDisplayCreative } | { kind: 'house'; banner: IHouseBanner } | { kind: 'empty' };

const HEIGHT: Record<IAdSlotConfig['format'], number> = {
  ROADBLOCK: 160,
  MASTHEAD: 0,
  BANNER_320x50: 72,
  MREC_300x250: 250,
};

type AdSlotProps = { slot: IAdSlotConfig; fill?: boolean };

export function AdSlot({ slot, fill = false }: AdSlotProps) {
  const { tier } = useEntitlement();
  const { gamRefreshIntervalSec } = useFlags();
  const [state, setState] = useState<SlotState>({ kind: 'loading' });
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (tier === 'PASS') return;
    let active = true;
    const load = async () => {
      try {
        track('display_ad_request', { adUnitId: slot.adUnitId, format: slot.format });
        const creative = await loadDisplayAd(slot.adUnitId, slot.format);
        if (!active) return;
        if (creative) {
          setState({ kind: 'filled', creative });
          track('display_ad_exposure', { adUnitId: slot.adUnitId, creativeId: creative.id, advertiser: creative.advertiser });
        } else {
          track('display_ad_no_fill', { adUnitId: slot.adUnitId, fallback: Boolean(slot.defaultBanner) });
          setState(slot.defaultBanner ? { kind: 'house', banner: slot.defaultBanner } : { kind: 'empty' });
        }
      } catch (error) {
        console.error(error);
      }
    };
    load();
    const refresh = setTimeout(() => setRefreshTick((tick) => tick + 1), gamRefreshIntervalSec * 1000);
    return () => {
      active = false;
      clearTimeout(refresh);
    };
  }, [slot, tier, gamRefreshIntervalSec, refreshTick]);

  if (tier === 'PASS' || state.kind === 'empty') return null;

  const sizeStyle = fill ? styles.fill : { height: HEIGHT[slot.format] };

  if (state.kind === 'loading') {
    return <View style={[styles.base, styles.skeleton, sizeStyle]} testID={`ad-slot-loading-${slot.format}`} />;
  }

  if (state.kind === 'house') {
    const { banner } = state;
    const handleHousePress = () => {
      try {
        if (banner.targetContentId === 'settings') router.push('/settings');
        else router.push(`/watch/${banner.targetContentId}`);
      } catch (error) {
        console.error(error);
      }
    };
    return (
      <Pressable style={[styles.base, sizeStyle, { backgroundColor: banner.color }]} onPress={handleHousePress} testID={`house-banner-${slot.format}`}>
        <Text style={styles.headline}>{banner.title}</Text>
        <Text style={styles.body}>{banner.subtitle}</Text>
      </Pressable>
    );
  }

  const { creative } = state;
  const handleAdPress = () => {
    try {
      track('display_ad_click', { adUnitId: slot.adUnitId, creativeId: creative.id });
      Alert.alert(creative.advertiser, `${creative.headline}\n\n(Dummy advertiser landing page)`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Pressable style={[styles.base, sizeStyle, { backgroundColor: creative.color }]} onPress={handleAdPress} testID={`display-ad-${slot.format}`}>
      <View style={styles.row}>
        <Text style={styles.adLabel}>AD</Text>
        <Text style={styles.advertiser}>{creative.advertiser}</Text>
      </View>
      <Text style={styles.headline} numberOfLines={1}>
        {creative.headline}
      </Text>
      {slot.format === 'BANNER_320x50' ? null : <Text style={styles.body}>{creative.body}</Text>}
      {slot.format === 'BANNER_320x50' ? null : (
        <View style={styles.cta}>
          <Text style={styles.ctaText}>{creative.cta}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, padding: spacing.md, justifyContent: 'center', overflow: 'hidden' },
  fill: { flex: 1, justifyContent: 'flex-end' },
  skeleton: { backgroundColor: colors.surfaceRaised },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  adLabel: { backgroundColor: colors.ad, color: colors.black, fontSize: 10, fontWeight: '800', paddingHorizontal: 5, borderRadius: 4, overflow: 'hidden' },
  advertiser: { color: colors.text, fontSize: 12, opacity: 0.85 },
  headline: { color: colors.text, fontSize: 16, fontWeight: '800' },
  body: { color: colors.text, fontSize: 13, opacity: 0.85, marginTop: 2 },
  cta: { alignSelf: 'flex-start', marginTop: spacing.sm, backgroundColor: colors.text, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 6 },
  ctaText: { color: colors.black, fontWeight: '700', fontSize: 12 },
});
