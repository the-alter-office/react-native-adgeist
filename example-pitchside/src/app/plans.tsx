import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { setTier, useEntitlement, type Tier } from '../state/entitlement';
import { colors, radius, spacing } from '../theme';

const PLANS: { tier: Tier; title: string; body: string }[] = [
  { tier: 'FREE', title: 'Free', body: 'Live matches, highlights and replays that are not premium.' },
  { tier: 'PASS', title: 'Pass (demo, no payment)', body: 'Everything in Free, plus all premium matches and full replays.' },
];

export default function PlansScreen() {
  const { tier } = useEntitlement();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2, width: '100%', maxWidth: 720, alignSelf: 'center' },
  section: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: spacing.sm, marginBottom: spacing.sm },
  plan: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  planSelected: { borderColor: colors.accent },
  planTitle: { color: colors.text, fontWeight: '700', marginBottom: 2 },
  muted: { color: colors.textMuted, fontSize: 12 },
});
