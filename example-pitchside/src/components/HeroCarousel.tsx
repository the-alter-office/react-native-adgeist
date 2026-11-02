import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useFlags } from '../state/flags';
import { useEntitlement } from '../state/entitlement';
import { colors, radius, spacing } from '../theme';
import type { IAdSlotConfig, IContentItem } from '../types/content';
import { AdSlot } from './AdSlot';

type HeroEntry = { kind: 'content'; item: IContentItem } | { kind: 'masthead'; slot: IAdSlotConfig };

const MASTHEAD_POSITION = 1;
const MAX_WIDTH = 720;

type HeroCarouselProps = { items: IContentItem[]; masthead: IAdSlotConfig | null };

export function HeroCarousel({ items, masthead }: HeroCarouselProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { enableMastheadAd } = useFlags();
  const { tier } = useEntitlement();
  const width = Math.min(windowWidth, MAX_WIDTH) - spacing.lg * 2;

  const entries: HeroEntry[] = items.map((item) => ({ kind: 'content', item }));
  if (masthead && enableMastheadAd && tier !== 'PASS') {
    entries.splice(Math.min(MASTHEAD_POSITION, entries.length), 0, { kind: 'masthead', slot: masthead });
  }

  return (
    <FlatList
      horizontal
      data={entries}
      keyExtractor={(entry) => (entry.kind === 'content' ? entry.item.id : entry.slot.adUnitId)}
      snapToInterval={width + spacing.md}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      renderItem={({ item: entry }) => (
        <View style={[styles.slide, { width }]}>
          {entry.kind === 'masthead' ? <AdSlot slot={entry.slot} fill /> : <HeroSlide item={entry.item} />}
        </View>
      )}
    />
  );
}

function HeroSlide({ item }: { item: IContentItem }) {
  return (
    <Pressable style={[styles.hero, { backgroundColor: item.posterColor }]} onPress={() => router.push(`/watch/${item.id}`)} testID={`hero-${item.id}`}>
      <Text style={styles.tournament}>{item.tournament.toUpperCase()}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
      <View style={styles.row}>
        <View style={styles.watch}>
          <Text style={styles.watchText}>{item.isLive ? '▶ Watch Live' : '▶ Watch Now'}</Text>
        </View>
        {item.isPremium ? <Text style={styles.premium}>PREMIUM</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.lg },
  slide: { aspectRatio: 16 / 9, marginRight: spacing.md },
  hero: { flex: 1, borderRadius: radius.lg, padding: spacing.lg, justifyContent: 'flex-end' },
  tournament: { color: colors.text, opacity: 0.75, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: spacing.xs },
  subtitle: { color: colors.text, opacity: 0.85, fontSize: 13, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  watch: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 6 },
  watchText: { color: colors.text, fontWeight: '800', fontSize: 13 },
  premium: { backgroundColor: colors.ad, color: colors.black, fontSize: 10, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, overflow: 'hidden' },
});
