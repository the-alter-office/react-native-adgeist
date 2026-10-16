import React, { useCallback, useState } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AdgeistProvider, HTML5AdView } from '@thealteroffice/react-native-adgeist';
import type { AdViewEvent } from '@thealteroffice/react-native-adgeist';
import config from './e2e.config.json';

const AD_RENDERED_CODE = 'AL1';
const CLICK_HANDLED_CODE = 'AI1';
const ALLOWED_WARNING_CODES: string[] = [];

type InitState = 'initializing' | 'initialized' | 'error';

type ReceivedEvent = {
  code: string;
  type: string;
  message: string;
  reason: string;
};

function isUnexpected(code: string) {
  if (code.startsWith('AE') || code === 'RWAE1') {
    return true;
  }
  return code.startsWith('AW') && !ALLOWED_WARNING_CODES.includes(code);
}

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
      <View testID="ad-container" style={[styles.adBox, { height: config.adSize.height }]}>
        <HTML5AdView adUnitID={config.adUnitId} adIsResponsive onAdEvent={handleAdEvent} />
      </View>
    );
  }

  return (
    <View testID="ad-container" style={styles.adBox}>
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

  const codes = events.map((e) => e.code);
  const adRendered = codes.includes(AD_RENDERED_CODE);
  const clickHandled = codes.includes(CLICK_HANDLED_CODE);
  const unexpected = [...new Set(codes.filter(isUnexpected))];

  return (
    <View testID="e2e-root" style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Adgeist E2E</Text>
      <View style={styles.panel}>
        <Text testID="status-init" style={styles.line}>
          {initState === 'error' ? `init: error: ${initError}` : `init: ${initState}`}
        </Text>
        <Text testID="status-ad-rendered" style={[styles.line, adRendered && styles.ok]}>
          {`ad rendered: ${adRendered ? 'yes' : 'no'}`}
        </Text>
        <Text testID="status-click-handled" style={[styles.line, clickHandled && styles.ok]}>
          {`click handled: ${clickHandled ? 'yes' : 'no'}`}
        </Text>
        <Text
          testID="status-unexpected"
          style={[styles.line, unexpected.length > 0 && styles.bad]}
        >
          {`unexpected: ${unexpected.length === 0 ? 'none' : unexpected.join(', ')}`}
        </Text>
        <Text testID="event-log" style={styles.line}>
          {`events: ${codes.length === 0 ? 'none' : codes.join(', ')}`}
        </Text>
      </View>
      <AdgeistProvider
        onInitializationSuccess={handleInitSuccess}
        onInitializationError={handleInitError}
      >
        <AdPlacement onEvent={handleEvent} />
      </AdgeistProvider>
      <ScrollView style={styles.log}>
        {events.map((e, index) => (
          <Text key={index} style={styles.logLine}>
            {`${e.code} ${e.type}: ${e.message}${e.reason ? ` (${e.reason})` : ''}`}
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
  panel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f2f2f2',
  },
  line: {
    fontSize: 14,
    color: '#111111',
    marginVertical: 2,
  },
  ok: {
    color: '#0a7a2f',
  },
  bad: {
    color: '#b00020',
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
