import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { HomePill } from '../types/content';

const PILLS: { value: HomePill; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'CRICKET', label: 'Cricket' },
  { value: 'FOOTBALL', label: 'Football' },
  { value: 'KABADDI', label: 'Kabaddi' },
  { value: 'BASKETBALL', label: 'Basketball' },
];

type SportPillsProps = { value: HomePill; onChange: (pill: HomePill) => void };

export function SportPills({ value, onChange }: SportPillsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {PILLS.map((pill) => {
        const selected = pill.value === value;
        return (
          <Pressable
            key={pill.value}
            style={[styles.pill, selected && styles.selected]}
            onPress={() => onChange(pill.value)}
            accessibilityState={{ selected }}
            testID={`pill-${pill.value}`}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{pill.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  pill: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: 6 },
  selected: { backgroundColor: colors.text, borderColor: colors.text },
  label: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  labelSelected: { color: colors.black },
});
