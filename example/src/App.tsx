import { View, StyleSheet, Dimensions } from 'react-native';
import {
  AdgeistProvider,
  BannerAd,
} from '@thealteroffice/react-native-adgeist';

export default function App() {
  return (
    <AdgeistProvider
      publisherId="686e31ebff39dc4d5a674b92"
      apiKey="47bffe2e47da3fa46175806897406e3d18cf6a2dcd29e997de650cd839d6acab"
      isTestEnvironment={true}
      domain="https://adgeist-ad-integration.d49kd6luw1c4m.amplifyapp.com/"
      customAdgeistApiOrigin="bg-services-qa-api.adgeist.ai"
    >
      <View style={styles.container}>
        <BannerAd
          dataAdSlot="686eb31d527f1cf0d34cd273"
          dataSlotType="video"
          width={Dimensions.get('window').width}
          height={300}
        />
      </View>
    </AdgeistProvider>
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
