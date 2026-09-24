import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';
import { AdLogPanel, useAdCallbacks, useAdLog } from './scenarios/AdLogPanel';

const FIXED_AD_UNIT_ID = '6aacd70d7935d686e83fb1aa';
const INVALID_AD_UNIT_ID = '000000000000000000000000';
const FIXED_SIZE = { width: 250, height: 250 };
const FAILING_SIZE = { width: 360, height: 360 };

export default function FixedAdspaceScreen() {
  const { lines, append, clear } = useAdLog();
  const validCallbacks = useAdCallbacks(append, 'A');
  const collapsingCallbacks = useAdCallbacks(append, 'B');
  const reservedCallbacks = useAdCallbacks(append, 'C');

  const [sizeA, setSizeA] = useState('');
  const [sizeB, setSizeB] = useState('');
  const [sizeC, setSizeC] = useState('');

  const measure =
    (set: (value: string) => void) => (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      set(`${Math.round(width)} x ${Math.round(height)}`);
    };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Non-Responsive Adspace</Text>
          <Text style={styles.body}>
            The AdView measures itself from adSize alone. If the server returns
            a creative of a different size, the SDK adopts the creative's size,
            re-measures the box and reports the mismatch through onAdWarning.
          </Text>
          <Text style={styles.code}>{'// adIsResponsive omitted'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            Ad A - Valid Unit, reserveSpace = true
          </Text>
          <Text style={styles.hint}>
            A real ad unit at {FIXED_SIZE.width} x {FIXED_SIZE.height}. Watch
            for onAdWarning if the creative comes back a different size.
          </Text>

          <View
            style={[styles.slot, styles.slotNeutral]}
            onLayout={measure(setSizeA)}
          >
            <HTML5AdView
              adUnitID={FIXED_AD_UNIT_ID}
              adSize={FIXED_SIZE}
              reserveSpace
              {...validCallbacks}
            />
          </View>

          <Text style={styles.measured}>Measured: {sizeA || '-'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            Ad B - Invalid Unit, reserveSpace = false
          </Text>
          <Text style={styles.hint}>
            This ad unit does not exist, so the load fails. With reserveSpace
            false the native AdView removes itself after onAdFailedToLoad - the
            red box should give up its {FAILING_SIZE.width} x{' '}
            {FAILING_SIZE.height} slot and everything below should move up.
          </Text>

          <View
            style={[styles.slot, styles.slotBad]}
            onLayout={measure(setSizeB)}
          >
            <HTML5AdView
              adUnitID={INVALID_AD_UNIT_ID}
              adSize={FAILING_SIZE}
              reserveSpace={false}
              {...collapsingCallbacks}
            />
          </View>

          <Text style={styles.measured}>Measured: {sizeB || '-'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            Ad C - Invalid Unit, reserveSpace = true
          </Text>
          <Text style={styles.hint}>
            The same invalid unit, so it fails the same way. With reserveSpace
            true the blue box keeps its {FAILING_SIZE.width} x{' '}
            {FAILING_SIZE.height} slot, empty, and nothing below it shifts.
          </Text>

          <View
            style={[styles.slot, styles.slotGood]}
            onLayout={measure(setSizeC)}
          >
            <HTML5AdView
              adUnitID={INVALID_AD_UNIT_ID}
              adSize={FAILING_SIZE}
              reserveSpace
              {...reservedCallbacks}
            />
          </View>

          <Text style={styles.measured}>Measured: {sizeC || '-'}</Text>
        </View>

        <AdLogPanel lines={lines} onClear={clear} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    padding: 10,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  body: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 23,
  },
  code: {
    color: '#63AA75',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
    marginTop: 12,
  },
  sectionLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hint: {
    color: '#999',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  measured: {
    color: '#4A7DFF',
    fontSize: 13,
    fontFamily: 'monospace',
    marginTop: 8,
  },
  slot: {
    alignSelf: 'center',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  slotNeutral: {
    borderColor: '#3a3a3a',
  },
  slotGood: {
    borderColor: '#4A7DFF',
  },
  slotBad: {
    borderColor: '#E05A5A',
  },
});
