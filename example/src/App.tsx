import { View, StyleSheet, Dimensions } from 'react-native';
import {
  AdgeistProvider,
  BannerAd,
} from '@thealteroffice/react-native-adgeist';

export default function App() {
  return (
    <AdgeistProvider
      publisherId="67f8ad1350ff1e0870da3f5b"
      apiKey="7f6b3361bd6d804edfb40cecf3f42e5ebc0b11bd88d96c8a6d64188b93447ad9"
      isTestEnvironment={true}
      domain="https://adgeist-ad-integration.d49kd6luw1c4m.amplifyapp.com"
    >
      <View style={styles.container}>
        <BannerAd
          dataAdSlot="686149fac1fd09fff371e53c"
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
