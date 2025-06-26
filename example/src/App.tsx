import { View, StyleSheet, Dimensions } from 'react-native';
import {
  AdgeistProvider,
  BannerAd,
} from '@thealteroffice/react-native-adgeist';

export default function App() {
  return (
    <AdgeistProvider
      publisherId="67f8ad1350ff1e0870da3f5b"
      apiKey="1401f7740ea15573c05a39a4de72396d609ff931722c1b87aa6b98bdce2b2ba8"
      isTestEnvironment={true}
      domain="https://adgeist-ad-integration.d49kd6luw1c4m.amplifyapp.com"
    >
      <View style={styles.container}>
        <BannerAd
          dataAdSlot="67f8af1850ff1e0870da3fbe"
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
