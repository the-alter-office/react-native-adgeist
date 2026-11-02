import { FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { clearEventLog, useAdStats, useEventLog, type IAnalyticsEvent } from '../analytics/eventBus';
import { setTier, useEntitlement, type Tier } from '../state/entitlement';
import { setFlag, useFlags, type IRemoteFlags } from '../state/flags';
import { colors, radius, spacing } from '../theme';

type BooleanFlag = { [K in keyof IRemoteFlags]: IRemoteFlags[K] extends boolean ? K : never }[keyof IRemoteFlags];

const FLAG_ROWS: { key: BooleanFlag; label: string }[] = [
  { key: 'enableVmaxLive', label: 'VMAX ads on live streams' },
  { key: 'enableVmaxVod', label: 'VMAX ads on VOD' },
  { key: 'enableRoadblock', label: 'Home roadblock' },
  { key: 'enableMastheadAd', label: 'Masthead ad in hero carousel' },
];

const PLANS: { tier: Tier; title: string; body: string }[] = [
  { tier: 'FREE', title: 'Free', body: 'Ads on every stream. Premium matches unlock with “Watch Free With Ads”.' },
  { tier: 'PASS', title: 'Pass (demo, no payment)', body: 'No pre-rolls or mid-rolls, no display ads, all premium content.' },
];

export default function SettingsScreen() {
  const { tier } = useEntitlement();
  const flags = useFlags();
  const log = useEventLog();
  const stats = useAdStats();
  const fillPct = stats.opportunitySec > 0 ? Math.round((stats.filledSec / stats.opportunitySec) * 100) : 0;

  const header = (
    <View>
      <Text style={styles.section}>Plan</Text>
      {PLANS.map((plan) => (
        <Pressable
          key={plan.tier}
          style={[styles.plan, tier === plan.tier && styles.planSelected]}
          onPress={() => setTier(plan.tier)}
          accessibilityState={{ selected: tier === plan.tier }}
          testID={`plan-${plan.tier}`}
        >
          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.muted}>{plan.body}</Text>
        </Pressable>
      ))}

      <Text style={styles.section}>Remote flags (mock)</Text>
      {FLAG_ROWS.map((row) => (
        <View key={row.key} style={styles.flagRow}>
          <Text style={styles.flagLabel}>{row.label}</Text>
          <Switch value={flags[row.key]} onValueChange={(value) => setFlag(row.key, value)} testID={`flag-${row.key}`} />
        </View>
      ))}

      <Text style={styles.section}>Ad opportunity vs fill (session)</Text>
      <View style={styles.statsRow}>
        <Stat label="Opportunity" value={`${Math.round(stats.opportunitySec)}s`} />
        <Stat label="Filled" value={`${Math.round(stats.filledSec)}s`} />
        <Stat label="Fill rate" value={`${fillPct}%`} />
      </View>

      <View style={styles.logHeader}>
        <Text style={styles.section}>Ad event log</Text>
        <Pressable onPress={clearEventLog} testID="clear-log">
          <Text style={styles.link}>Clear</Text>
        </Pressable>
      </View>
      {log.length === 0 ? <Text style={styles.muted}>Play something to see ad events here.</Text> : null}
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={log}
      keyExtractor={(event) => String(event.seq)}
      ListHeaderComponent={header}
      renderItem={({ item }) => <LogRow event={item} />}
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

function LogRow({ event }: { event: IAnalyticsEvent }) {
  const time = new Date(event.at).toLocaleTimeString();
  const payload = Object.entries(event.payload)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('  ');
  return (
    <View style={styles.logRow}>
      <Text style={styles.logName}>
        {time} · {event.name}
      </Text>
      {payload ? <Text style={styles.logPayload}>{payload}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2, width: '100%', maxWidth: 720, alignSelf: 'center' },
  section: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: spacing.xl, marginBottom: spacing.sm },
  plan: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  planSelected: { borderColor: colors.accent },
  planTitle: { color: colors.text, fontWeight: '700', marginBottom: 2 },
  muted: { color: colors.textMuted, fontSize: 12 },
  flagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs },
  flagLabel: { color: colors.text, fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  statValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
  logHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  link: { color: colors.accent, fontWeight: '700' },
  logRow: { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: spacing.sm },
  logName: { color: colors.text, fontSize: 12, fontWeight: '700' },
  logPayload: { color: colors.textMuted, fontSize: 11, fontFamily: 'monospace', marginTop: 2 },
});
