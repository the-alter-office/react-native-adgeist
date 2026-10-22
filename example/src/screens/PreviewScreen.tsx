import { View, ScrollView, StyleSheet } from 'react-native';
import { HTML5AdViewPreview } from '@thealteroffice/react-native-adgeist';

export default function PreviewScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <HTML5AdViewPreview
          type="banner"
          media={'gif'}
          adSize={{
            width: 380,
            height: 300,
          }}
        />
        <HTML5AdViewPreview
          type="companion"
          deepLinkUrl="hello://com"
          title="This is a companion adspace"
          description="We show the description using this"
          adSize={{
            width: 380,
            height: 400,
          }}
        />
        <HTML5AdViewPreview
          type="display"
          title="This is a display adspace"
          description="We show the description using this"

          adSize={{
            width: 400,
            height: 300,
          }}
        />
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
    gap: 10,
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
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    marginRight: 8,
  },
  chipActive: {
    borderColor: '#4A7DFF',
    backgroundColor: '#14223f',
  },
  chipText: {
    color: 'white',
    fontSize: 14,
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
  },
  slotWide: {
    alignSelf: 'stretch',
  },
  slotNeutral: {
    borderColor: '#3a3a3a',
  },
  slotGood: {
    borderColor: '#4A7DFF',
  },
});
