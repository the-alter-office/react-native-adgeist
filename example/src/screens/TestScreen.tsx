import { HTML5AdView } from '@thealteroffice/react-native-adgeist';
import { StyleSheet, ScrollView } from 'react-native';

export default function TestScreen() {
  return (
    <ScrollView
      style={styles.container}
      horizontal={false}
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      <HTML5AdView
        adUnitID="6abbad621979b59913a3c141"
        adSize={{ width: 360, height: 360 }}
      />

      <HTML5AdView
        adUnitID="6abbada8dd7cf158e3e10cb2"
        adSize={{ height: 500 }}
        adIsResponsive={true}
        reserveSpace={true}
      />

      <HTML5AdView
        adUnitID="6abe25e069c01bfd696f8124"
        adIsResponsive={true}
        adSize={{ height: 350 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
