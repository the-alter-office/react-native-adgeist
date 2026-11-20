import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchStream } from '../../api/client';
import { SPORT_LABEL } from '../../components/ContentCard';
import { PremiumGate } from '../../components/PremiumGate';
import { Rail } from '../../components/Rail';
import { ErrorView, LoadingView } from '../../components/StateViews';
import { useAsync } from '../../hooks/useAsync';
import { PlayerSurface } from '../../player/PlayerSurface';
import { canWatch, useEntitlement } from '../../state/entitlement';
import { colors, radius, spacing } from '../../theme';

const MAX_CONTENT_WIDTH = 900;

export default function WatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const stream = useAsync(() => fetchStream(id), [id]);
  const entitlement = useEntitlement();

  if (stream.status === 'loading') return <LoadingView label="Preparing stream…" />;
  if (stream.status === 'error') return <ErrorView message={stream.error.message} onRetry={stream.retry} />;

  const { item, videoSource, related } = stream.data;
  const allowed = canWatch(entitlement, item.isPremium);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll}>
      <Stack.Screen options={{ title: item.tournament }} />
      <View style={styles.column}>
        {allowed ? (
          <PlayerSurface key={item.id} source={videoSource} />
        ) : (
          <PremiumGate />
        )}
        <View style={styles.info}>
          <View style={styles.row}>
            {item.isLive ? <Text style={[styles.tag, styles.live]}>● LIVE</Text> : <Text style={styles.tag}>{item.durationLabel}</Text>}
            <Text style={styles.tag}>{SPORT_LABEL[item.sport]}</Text>
            {item.isPremium ? <Text style={[styles.tag, styles.premium]}>PREMIUM</Text> : null}
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>
            {item.tournament} · {item.subtitle}
          </Text>
        </View>
        {related.length > 0 ? <Rail title={`More ${SPORT_LABEL[item.sport]}`} items={related} /> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl * 2, alignItems: 'center' },
  column: { width: '100%', maxWidth: MAX_CONTENT_WIDTH },
  info: { padding: spacing.lg, gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
  tag: { color: colors.text, backgroundColor: colors.surfaceRaised, fontSize: 11, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, overflow: 'hidden' },
  live: { backgroundColor: colors.live },
  premium: { backgroundColor: colors.premium, color: colors.black },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: spacing.sm },
  subtitle: { color: colors.textMuted, fontSize: 13 },
});
