import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchHome } from '../api/client';
import { AdSlot } from '../components/AdSlot';
import { HeroCarousel } from '../components/HeroCarousel';
import { Rail } from '../components/Rail';
import { SportPills } from '../components/SportPills';
import { EmptyView, ErrorView, LoadingView } from '../components/StateViews';
import { useAsync } from '../hooks/useAsync';
import { useEntitlement } from '../state/entitlement';
import { useFlags } from '../state/flags';
import { colors, spacing } from '../theme';
import type { HomePill, HomeSegment } from '../types/content';

const MAX_CONTENT_WIDTH = 720;

export default function HomeScreen() {
  const [pill, setPill] = useState<HomePill>('ALL');
  const [roadblockDismissed, setRoadblockDismissed] = useState(false);
  const { enableRoadblock } = useFlags();
  const { tier } = useEntitlement();
  const home = useAsync(() => fetchHome(pill), [pill]);

  const renderSegment = (segment: HomeSegment) => {
    switch (segment.type) {
      case 'ROADBLOCK':
        if (!enableRoadblock || roadblockDismissed || tier === 'PASS') return null;
        return (
          <View key={segment.id} style={styles.padded}>
            <AdSlot slot={segment.slot} />
            <Pressable onPress={() => setRoadblockDismissed(true)} style={styles.dismiss} testID="roadblock-dismiss">
              <Text style={styles.dismissText}>Hide ad ✕</Text>
            </Pressable>
          </View>
        );
      case 'HERO':
        return <HeroCarousel key={segment.id} items={segment.items} masthead={segment.masthead} />;
      case 'RAIL':
        return <Rail key={segment.id} title={segment.title} items={segment.items} />;
      case 'BANNER':
        return (
          <View key={segment.id} style={[styles.padded, styles.banner]}>
            <AdSlot slot={segment.slot} />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          pitch<Text style={styles.logoAccent}>side</Text>
        </Text>
        <Pressable onPress={() => router.push('/settings')} style={styles.planButton} testID="open-settings">
          <Text style={styles.planText}>{tier === 'PASS' ? 'PASS ✓' : 'Get Pass'}</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <SportPills value={pill} onChange={setPill} />
          {home.status === 'loading' ? <LoadingView label="Loading matches…" /> : null}
          {home.status === 'error' ? <ErrorView message={home.error.message} onRetry={home.retry} /> : null}
          {home.status === 'success' && home.data.segments.length === 0 ? <EmptyView label="No matches right now" /> : null}
          {home.status === 'success' ? home.data.segments.map(renderSegment) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  logo: { color: colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  logoAccent: { color: colors.accent },
  planButton: { borderColor: colors.accent, borderWidth: 1, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: 6 },
  planText: { color: colors.accent, fontWeight: '700', fontSize: 12 },
  scroll: { paddingBottom: spacing.xl * 2, alignItems: 'center' },
  column: { width: '100%', maxWidth: MAX_CONTENT_WIDTH },
  padded: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  banner: { marginTop: spacing.xl },
  dismiss: { alignSelf: 'flex-end', paddingVertical: spacing.xs },
  dismissText: { color: colors.textMuted, fontSize: 11 },
});
