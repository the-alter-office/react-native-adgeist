import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';
import { AdLogPanel, useAdCallbacks, useAdLog } from './AdLogPanel';

const AD_UNIT_ID = '6aacd3a4fff212e2a8031309';
const BOX_WIDTH = 300;
const BOX_HEIGHT = 250;

export default function FixedBoxScreen() {
  const { lines, append, clear } = useAdLog();
  const callbacks = useAdCallbacks(append);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Square - Both Axes Fixed</Text>
          <Text style={styles.body}>
            The box below is a fixed {BOX_WIDTH} x {BOX_HEIGHT}. The parent
            supplies both axes, so the publisher declares no adSize at all.
          </Text>
          <Text style={styles.code}>{'adIsResponsive\n// no adSize'}</Text>
        </View>

        <View style={styles.box}>
          <HTML5AdView adUnitID={AD_UNIT_ID} adIsResponsive {...callbacks} />
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
  box: {
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    alignSelf: 'center',
    marginBottom: 12,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderStyle: 'dashed',
  },
});
