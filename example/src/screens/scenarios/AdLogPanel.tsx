import { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeSyntheticEvent } from 'react-native';

type FailedToLoadEvent = NativeSyntheticEvent<{ error: string }>;
type WarningEvent = NativeSyntheticEvent<{ warning: string }>;

export function useAdLog() {
  const [lines, setLines] = useState<string[]>([]);

  const append = useCallback((line: string) => {
    const at = new Date().toTimeString().slice(0, 8);
    setLines((previous) => [...previous, `${at}  ${line}`]);
  }, []);

  const clear = useCallback(() => setLines([]), []);

  return { lines, append, clear };
}

export function useAdCallbacks(append: (line: string) => void, tag?: string) {
  return useMemo(() => {
    const prefix = tag ? `[${tag}] ` : '';

    return {
      onAdLoaded: () => append(`${prefix}onAdLoaded`),
      onAdOpened: () => append(`${prefix}onAdOpened`),
      onAdClosed: () => append(`${prefix}onAdClosed`),
      onAdClicked: () => append(`${prefix}onAdClicked`),
      onAdFailedToLoad: (event: FailedToLoadEvent) =>
        append(`${prefix}onAdFailedToLoad: ${event.nativeEvent.error}`),
      onAdWarning: (event: WarningEvent) =>
        append(`${prefix}onAdWarning: ${event.nativeEvent.warning}`),
    };
  }, [append, tag]);
}

type Props = {
  lines: string[];
  onClear: () => void;
};

export function AdLogPanel({ lines, onClear }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>SDK Callbacks</Text>
        <Pressable onPress={onClear} hitSlop={8}>
          <Text style={styles.clear}>Clear</Text>
        </Pressable>
      </View>

      <View style={styles.panel}>
        {lines.length === 0 ? (
          <Text style={styles.empty}>Waiting for the first callback...</Text>
        ) : (
          lines.map((line, index) => (
            <Text key={`${index}-${line}`} style={styles.line}>
              {line}
            </Text>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  clear: {
    color: '#4A7DFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  panel: {
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    padding: 12,
    minHeight: 80,
  },
  line: {
    color: '#ccc',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  empty: {
    color: '#999',
    fontSize: 13,
    fontFamily: 'monospace',
  },
});
