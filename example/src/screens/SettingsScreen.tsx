import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { requestTrackingAuthorization } from '@thealteroffice/react-native-adgeist';

export default function SettingsScreen() {
  const [trackingAuthorized, setTrackingAuthorized] = useState<boolean | null>(
    null
  );

  const handleRequestTracking = () => {
    requestTrackingAuthorization().then(setTrackingAuthorized);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.label}>
        Tracking authorized:{' '}
        {trackingAuthorized === null ? '…' : String(trackingAuthorized)}
      </Text>
      <Pressable style={styles.button} onPress={handleRequestTracking}>
        <Text style={styles.buttonText}>Request tracking permission</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    color: 'white',
    fontSize: 14,
    marginTop: 16,
  },
  button: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
