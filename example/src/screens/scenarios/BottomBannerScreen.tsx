import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';
import { AdLogPanel, useAdCallbacks, useAdLog } from './AdLogPanel';

const AD_UNIT_ID = '6aacd3a4fff212e2a8031309';
const AD_HEIGHT = 50;

export default function BottomBannerScreen() {
  const { lines, append, clear } = useAdLog();
  const callbacks = useAdCallbacks(append);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Horizontal - Bottom Banner</Text>
          <Text style={styles.body}>
            The banner pinned to the bottom is as wide as the screen and as tall
            as the ad. The publisher declares the height, the parent supplies
            the width.
          </Text>
          <Text style={styles.code}>
            {`adIsResponsive\nadSize={{ height: ${AD_HEIGHT} }}`}
          </Text>
        </View>

        <AdLogPanel lines={lines} onClear={clear} />
      </ScrollView>

      <View style={styles.banner}>
        <HTML5AdView
          adUnitID={AD_UNIT_ID}
          adIsResponsive
          adSize={{ height: AD_HEIGHT }}
          {...callbacks}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  scroll: {
    flex: 1,
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
  banner: {
    backgroundColor: '#141414',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
});
