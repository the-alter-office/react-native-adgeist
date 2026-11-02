import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';
import { AdLogPanel, useAdCallbacks, useAdLog } from './AdLogPanel';

const AD_UNIT_ID = '6aacd3a4fff212e2a8031309';
const AD_WIDTH = 120;

export default function VerticalRailScreen() {
  const { lines, append, clear } = useAdLog();
  const callbacks = useAdCallbacks(append);

  return (
    <View style={styles.screen}>
      <View style={styles.row}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.column}>
          <View style={styles.card}>
            <Text style={styles.title}>Vertical - Right Column</Text>
            <Text style={styles.body}>
              The rail on the right is as wide as the ad and as tall as the
              screen. The publisher declares the width, the parent supplies the
              height.
            </Text>
            <Text style={styles.code}>
              {`adIsResponsive\nadSize={{ width: ${AD_WIDTH} }}`}
            </Text>
          </View>

          <AdLogPanel lines={lines} onClear={clear} />
        </ScrollView>

        <View style={styles.rail}>
          <HTML5AdView
            adUnitID={AD_UNIT_ID}
            adIsResponsive
            adSize={{ width: AD_WIDTH }}
            {...callbacks}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  scroll: {
    flex: 1,
  },
  column: {
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
  rail: {
    backgroundColor: '#141414',
    borderLeftWidth: 1,
    borderLeftColor: '#333',
  },
});
