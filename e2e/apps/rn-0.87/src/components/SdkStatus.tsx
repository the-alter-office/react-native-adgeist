import { createContext, useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export type SdkState = {
  status: 'initializing' | 'initialized' | 'error';
  error?: string;
};

export const SdkStatusContext = createContext<SdkState>({ status: 'initializing' });

export function useSdkStatus() {
  return useContext(SdkStatusContext);
}

export function sdkStatusText(state: SdkState) {
  return state.status === 'error' ? `init: error: ${state.error ?? ''}` : `init: ${state.status}`;
}

export function InitializingView() {
  return (
    <View testID="e2e-root" style={styles.overlay}>
      <Text style={styles.title}>Adgeist E2E</Text>
      <Text testID="status-init" style={styles.status}>
        {sdkStatusText({ status: 'initializing' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  status: {
    color: colors.textSubtle,
    fontSize: 14,
    fontFamily: 'monospace',
  },
});
