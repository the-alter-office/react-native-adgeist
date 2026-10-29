import { StyleSheet, Text, View } from 'react-native';
import type { AdKind } from '../config';
import { colors, shared } from '../theme';

type Props = {
  kind: AdKind;
  codes: string[];
  adRendered: boolean;
  clickHandled: boolean;
  unexpected: string[];
};

export function AdStatusPanel({ kind, codes, adRendered, clickHandled, unexpected }: Props) {
  return (
    <View style={shared.card}>
      <Text style={styles.heading}>Status</Text>
      <Text testID={`${kind}-status-ad-rendered`} style={[styles.row, adRendered && styles.ok]}>
        {`ad rendered: ${adRendered ? 'yes' : 'no'}`}
      </Text>
      <Text testID={`${kind}-status-click-handled`} style={[styles.row, clickHandled && styles.ok]}>
        {`click handled: ${clickHandled ? 'yes' : 'no'}`}
      </Text>
      <Text testID={`${kind}-status-unexpected`} style={[styles.row, unexpected.length > 0 && styles.bad]}>
        {`unexpected: ${unexpected.length === 0 ? 'none' : unexpected.join(', ')}`}
      </Text>
      <Text testID={`${kind}-event-log`} style={styles.row}>
        {`events: ${codes.length === 0 ? 'none' : codes.join(', ')}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: 'monospace',
    marginVertical: 2,
  },
  ok: {
    color: colors.accent,
  },
  bad: {
    color: colors.danger,
  },
});
