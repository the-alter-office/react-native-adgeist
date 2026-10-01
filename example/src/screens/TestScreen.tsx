import { HTML5AdView } from '@thealteroffice/react-native-adgeist';
import { View, StyleSheet, ScrollView } from 'react-native';

export default function TestScreen() {
  return (
    <ScrollView style={styles.container}>
      <View>
        <HTML5AdView
          adUnitID="6abbad621979b59913a3c141"
          adSize={{ width: 360, height: 360 }}
        />

        <HTML5AdView
          adUnitID="6abbada8dd7cf158e3e10cb2"
          adSize={{ height: 360 }}
          adIsResponsive={true}
          reserveSpace={true}
        />
      </View>
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
