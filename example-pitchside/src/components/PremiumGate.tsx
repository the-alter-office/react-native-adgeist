import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { setTier, unlockWithAds } from '../state/entitlement';
import { colors, radius, spacing } from '../theme';

type PremiumGateProps = { contentId: string; adDurationInSeconds: number };

export function PremiumGate({ contentId, adDurationInSeconds }: PremiumGateProps) {
  const handleBuyPass = () => {
    try {
      setTier('PASS');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.gate} testID="premium-gate">
      <Text style={styles.title}>Premium match</Text>
      <Text style={styles.body}>Watch free with about {adDurationInSeconds}s of ads, or get a pass for fewer ads on every match.</Text>
      <View style={styles.row}>
        <Pressable style={[styles.button, styles.primary]} onPress={() => unlockWithAds(contentId)} testID="watch-free-with-ads">
          <Text style={styles.buttonText}>Watch Free With Ads</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleBuyPass} testID="get-pass">
          <Text style={styles.buttonText}>Get a Pass (demo)</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => router.push('/settings')} testID="see-plans">
        <Text style={styles.link}>See plans</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  gate: { width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  body: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  button: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  primary: { backgroundColor: colors.accent, borderColor: colors.accent },
  buttonText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  link: { color: colors.textMuted, textDecorationLine: 'underline', fontSize: 12, marginTop: spacing.xs },
});
