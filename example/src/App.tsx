import { View, StyleSheet, Dimensions } from 'react-native';
import { BannerAd, BottomBannerAd } from '@thealteroffice/react-native-adgeist';

export default function App() {
  return (
    <View style={styles.container}>
      <BannerAd
        dataPublisherId="67a056c63205fce2290d1cda"
        dataAdSlot="67c99c7a34929568f405e7ff"
        width={Dimensions.get('window').width}
        height={300}
      />
      <BottomBannerAd
        dataPublisherId="67a056c63205fce2290d1cda"
        dataAdSlot="67c99c7a34929568f405e7ff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
});
