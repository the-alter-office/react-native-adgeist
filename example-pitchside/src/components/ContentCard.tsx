import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { IContentItem } from '../types/content';

const SPORT_LABEL: Record<IContentItem['sport'], string> = {
  CRICKET: 'Cricket',
  FOOTBALL: 'Football',
  KABADDI: 'Kabaddi',
  BASKETBALL: 'Basketball',
};

type ContentCardProps = { item: IContentItem; width: number };

export function ContentCard({ item, width }: ContentCardProps) {
  return (
    <Pressable
      style={[styles.card, { width }]}
      onPress={() => router.push(`/watch/${item.id}`)}
      testID={`content-card-${item.id}`}
    >
      <View style={[styles.poster, { backgroundColor: item.posterColor }]}>
        <Text style={styles.posterSport}>{SPORT_LABEL[item.sport].toUpperCase()}</Text>
        <Text style={styles.posterTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.badges}>
          {item.isLive ? <Text style={[styles.badge, styles.live]}>● LIVE</Text> : <Text style={styles.badge}>{item.durationLabel}</Text>}
          {item.isPremium ? <Text style={[styles.badge, styles.premium]}>PREMIUM</Text> : null}
        </View>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={1}>
        {item.tournament} · {item.subtitle}
      </Text>
    </Pressable>
  );
}

export { SPORT_LABEL };

const styles = StyleSheet.create({
  card: { marginRight: spacing.md },
  poster: { aspectRatio: 16 / 9, borderRadius: radius.md, padding: spacing.md, justifyContent: 'space-between', overflow: 'hidden' },
  posterSport: { color: colors.text, opacity: 0.7, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  posterTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  badges: { flexDirection: 'row', gap: spacing.xs },
  badge: { color: colors.text, backgroundColor: colors.overlay, fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, overflow: 'hidden' },
  live: { backgroundColor: colors.live },
  premium: { backgroundColor: colors.ad, color: colors.black },
  title: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: spacing.sm },
  subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
