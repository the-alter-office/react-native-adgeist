import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { setTier } from '../state/entitlement';
import { colors, radius, spacing } from '../theme';

export function PremiumGate() {
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
      <Text style={styles.body}>Get a pass to watch every premium match and full replay.</Text>
      <Pressable style={styles.button} onPress={handleBuyPass} testID="get-pass">
        <Text style={styles.buttonText}>Get a Pass (demo)</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/plans')} testID="see-plans">
        <Text style={styles.link}>See plans</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  gate: { width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  body: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  button: { marginTop: spacing.sm, backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  buttonText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  link: { color: colors.textMuted, textDecorationLine: 'underline', fontSize: 12, marginTop: spacing.xs },
});
