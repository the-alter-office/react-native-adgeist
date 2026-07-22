import { AdgeistProvider } from '@thealteroffice/react-native-adgeist';
import ContentContainer from '../ContentContainer';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [appId, setAppId] = useState('69a6777707df2b1527e357f9');
  const [bundleId, setBundleId] = useState('com.leaguex.crm.beta');
  const [backendDomain, setbackendDomain] = useState(
    'https://beta.v2.bg-services.adgeist.ai'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showProvider, setShowProvider] = useState(true);

  const [config, setConfig] = useState({
    appId: '69a6777707df2b1527e357f9',
    bundleId: 'com.leaguex.crm.beta',
    backendDomain: 'https://beta.v2.bg-services.adgeist.ai',
  });

  const handleSubmit = () => {
    setIsLoading(true);
    setShowProvider(false);

    setTimeout(() => {
      setConfig({
        appId,
        bundleId,
        backendDomain,
      });
      setShowProvider(true);
      setIsLoading(false);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.configContainer}>
          <Text style={styles.header}>SDK Configuration</Text>

          <Text style={styles.label}>Backend Domain</Text>
          <TextInput
            style={styles.input}
            value={backendDomain}
            onChangeText={setbackendDomain}
            placeholder="Enter Backend Domain"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Adgeist App ID</Text>
          <TextInput
            style={styles.input}
            value={appId}
            onChangeText={setAppId}
            placeholder="Enter App ID"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Package or Bundle ID</Text>
          <TextInput
            style={styles.input}
            value={bundleId}
            onChangeText={setBundleId}
            placeholder="Enter Bundle ID"
            placeholderTextColor="#999"
          />

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Update Configuration</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.button, styles.profileButton]}
            onPress={() => navigation.push('Profile')}
          >
            <Text style={styles.buttonText}>Go to Profile</Text>
          </Pressable>
        </View>

        {showProvider && (
          <AdgeistProvider
            customBidRequestBackendDomain={backendDomain}
            customPackageOrBundleID={config.bundleId}
            customAdgeistAppID={config.appId}
          >
            <ContentContainer />
          </AdgeistProvider>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  configContainer: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: 'white',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#63AA75',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  profileButton: {
    backgroundColor: '#4A7DFF',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
