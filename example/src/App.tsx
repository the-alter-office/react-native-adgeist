import { AdgeistProvider } from '@thealteroffice/react-native-adgeist';
import ContentContainer from './ContentContainer';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Switch,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';

export default function App() {
  const [appId, setAppId] = useState('695e797d6fcfb14c38cfd1d6');
  const [bundleId, setBundleId] = useState('com.leaguex.crm');
  const [backendDomain, setbackendDomain] = useState(
    'https://qa.v2.bg-services.adgeist.ai'
  );
  const [isTest, setIsTest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showProvider, setShowProvider] = useState(true);

  const [config, setConfig] = useState({
    appId: '695e797d6fcfb14c38cfd1d6',
    bundleId: 'com.leaguex.crm',
    isTest: true,
    backendDomain: 'https://qa.v2.bg-services.adgeist.ai',
  });

  const handleSubmit = () => {
    setIsLoading(true);
    setShowProvider(false);

    setTimeout(() => {
      setConfig({
        appId,
        bundleId,
        isTest,
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

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Test Environment</Text>
            <Switch
              value={isTest}
              onValueChange={setIsTest}
              trackColor={{ false: '#767577', true: '#63AA75' }}
            />
          </View>

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
        </View>

        {showProvider && (
          <AdgeistProvider
            customBidRequestBackendDomain={backendDomain}
            customPackageOrBundleID={config.bundleId}
            customAdgeistAppID={config.appId}
            isTestEnvironment={config.isTest}
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
    display: 'none',
  },
  button: {
    backgroundColor: '#63AA75',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
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
