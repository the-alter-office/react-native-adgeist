import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';
import { AdLogPanel, useAdCallbacks, useAdLog } from './AdLogPanel';

const AD_UNIT_ID = '6aacd3a4fff212e2a8031309';
const AD_HEIGHT = 250;

export default function ScrollListScreen() {
  const { lines, append, clear } = useAdLog();
  const goodCallbacks = useAdCallbacks(append, 'A');
  const badCallbacks = useAdCallbacks(append, 'B');
  const [sizeA, setSizeA] = useState('');
  const [sizeB, setSizeB] = useState('');

  const measure =
    (set: (value: string) => void) => (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      set(`${Math.round(width)} x ${Math.round(height)}`);
    };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Inside A ScrollView</Text>
          <Text style={styles.body}>
            A scrolling column is as wide as the screen but has no height of its
            own to hand down. The parent supplies the width, the publisher has
            to supply the height.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            Ad A - adSize={`{{ height: ${AD_HEIGHT} }}`}
          </Text>
          <Text style={styles.hint}>
            The declared height is passed straight through as a style, so the
            row measures exactly {AD_HEIGHT} tall whatever the parent does.
          </Text>

          <View
            style={[styles.slot, styles.slotGood]}
            onLayout={measure(setSizeA)}
          >
            <HTML5AdView
              adUnitID={AD_UNIT_ID}
              adIsResponsive
              adSize={{ height: AD_HEIGHT }}
              {...goodCallbacks}
            />
          </View>

          <Text style={styles.measured}>Measured: {sizeA || '-'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Ad B - No adSize</Text>
          <Text style={styles.hint}>
            With no declared height, HTML5AdView falls back to height: '100%'.
            The ad is never height-less - it takes whatever that percentage
            resolves to in this scrolling column, which is nobody's stated
            intent. Compare the two measured sizes to see what it landed on.
          </Text>

          <View
            style={[styles.slot, { height: 0 }, styles.slotBad]}
            onLayout={measure(setSizeB)}
          >
            <HTML5AdView
              adUnitID={AD_UNIT_ID}
              adIsResponsive
              {...badCallbacks}
            />
          </View>

          <Text style={styles.measured}>Measured: {sizeB || '-'}</Text>
        </View>

        <AdLogPanel lines={lines} onClear={clear} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    // flex: 1,
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
    backgroundColor: '#141414',
    // borderWidth: 1,
    borderStyle: 'dashed',
  },
  slotGood: {
    borderColor: '#63AA75',
  },
  slotBad: {
    borderColor: '#E05A5A',
  },
});
