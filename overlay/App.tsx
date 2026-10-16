import React, { useCallback, useState } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AdgeistProvider, HTML5AdView } from '@thealteroffice/react-native-adgeist';
import type { AdViewEvent } from '@thealteroffice/react-native-adgeist';
import config from './e2e.config.json';

type InitState = 'initializing' | 'initialized' | 'error';

type ReceivedEvent = {
  code: string;
  type: string;
  message: string;
  reason: string;
};

function AdPlacement({ onEvent }: { onEvent: (event: ReceivedEvent) => void }) {
  const handleAdEvent = useCallback(
    (event: NativeSyntheticEvent<AdViewEvent>) => {
      const { code, type, message, data } = event.nativeEvent;
      onEvent({ code, type, message, reason: data?.reason ?? '' });
    },
    [onEvent]
  );

  if (config.adIsResponsive) {
    return (
      <View style={[styles.adBox, { height: config.adSize.height }]}>
        <HTML5AdView adUnitID={config.adUnitId} adIsResponsive onAdEvent={handleAdEvent} />
      </View>
    );
  }

  return (
    <View style={styles.adBox}>
      <HTML5AdView
        adUnitID={config.adUnitId}
        adSize={{ width: config.adSize.width, height: config.adSize.height }}
        onAdEvent={handleAdEvent}
      />
    </View>
  );
}

export default function App() {
  const [initState, setInitState] = useState<InitState>('initializing');
  const [initError, setInitError] = useState('');
  const [events, setEvents] = useState<ReceivedEvent[]>([]);

  const handleInitSuccess = useCallback(() => setInitState('initialized'), []);
  const handleInitError = useCallback((error: Error) => {
    setInitState('error');
    setInitError(error.message);
  }, []);
  const handleEvent = useCallback(
    (event: ReceivedEvent) => setEvents((current) => [...current, event]),
    []
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Adgeist E2E</Text>
      <Text style={styles.line}>
        init: {initState}
        {initError ? ` (${initError})` : ''}
      </Text>
      <Text style={styles.line}>
        events: {events.length === 0 ? 'none' : events.map((e) => e.code).join(', ')}
      </Text>
      <AdgeistProvider
        onInitializationSuccess={handleInitSuccess}
        onInitializationError={handleInitError}
      >
        <AdPlacement onEvent={handleEvent} />
      </AdgeistProvider>
      <ScrollView style={styles.log}>
        {events.map((e, index) => (
          <Text key={index} style={styles.logLine}>
            {e.code} {e.type}: {e.message}
            {e.reason ? ` (${e.reason})` : ''}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 8,
  },
  line: {
    fontSize: 14,
    color: '#111111',
    marginBottom: 4,
  },
  adBox: {
    alignSelf: 'center',
    marginVertical: 12,
  },
  log: {
    flex: 1,
  },
  logLine: {
    fontSize: 12,
    color: '#444444',
    marginBottom: 2,
  },
});
