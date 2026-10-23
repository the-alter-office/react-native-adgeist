import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReceivedEvent } from './useAdEvents';
import { colors, shared } from '../theme';

type Props = {
  events: ReceivedEvent[];
  onClear: () => void;
};

export function AdLogPanel({ events, onClear }: Props) {
  return (
    <View style={shared.card}>
      <View style={styles.header}>
        <Text style={styles.title}>SDK Callbacks</Text>
        <Pressable onPress={onClear} hitSlop={8}>
          <Text style={styles.clear}>Clear</Text>
        </Pressable>
      </View>

      <View style={styles.panel}>
        {events.length === 0 ? (
          <Text style={styles.empty}>Waiting for the first callback...</Text>
        ) : (
          events.map((e, index) => (
            <Text key={`${index}-${e.code}`} style={styles.line}>
              {`${e.at}  ${e.code} (${e.type}): ${e.message}${e.reason ? ` - ${e.reason}` : ''}`}
            </Text>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  clear: {
    color: colors.link,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  panel: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 12,
    minHeight: 80,
  },
  line: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  empty: {
    color: colors.textSubtle,
    fontSize: 13,
    fontFamily: 'monospace',
  },
});
