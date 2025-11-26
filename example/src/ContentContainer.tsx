import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  BannerAd,
  setUserDetails,
  logEvent,
  updateConsentStatus,
  useAdgeistContext,
  getConsentStatus,
} from '@thealteroffice/react-native-adgeist';
import { useEffect, useState } from 'react';
import AdViewExample from './AdViewExample';

export default function ContentContainer() {
  const { setAdgeistConsentModal } = useAdgeistContext();

  useEffect(() => {
    (async () => {
      const consentStatus = await getConsentStatus();
      if (consentStatus === 'DENIED') {
        setAdgeistConsentModal(true);
      }
    })();
  }, [setAdgeistConsentModal]);
  const [isAdVisible, setIsAdVisible] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable
        style={styles.button}
        onPress={() =>
          setUserDetails({
            userId: '12345',
            userName: 'John Doe',
            email: 'john.doe@example.com',
          })
        }
      >
        <Text>Set User Details</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() =>
          logEvent({
            eventType: 'search',
            eventProperties: {
              search_query: 'test in example app',
            },
          })
        }
      >
        <Text>Send Search Event</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => updateConsentStatus(true)}
      >
        <Text>Update Consent</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => setIsAdVisible(true)}>
        <Text>Show Ad</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { marginBottom: 50 }]}
        onPress={() => setIsAdVisible(false)}
      >
        <Text>Remove Ad</Text>
      </Pressable>

      <AdViewExample />

      {isAdVisible && (
        <View
          style={{
            width: Dimensions.get('window').width,
            height: 360,
            alignItems: 'center',
            marginTop: 500,
          }}
        >
          <BannerAd
            dataAdSlot="68ef39e281029bf4edcd62ea"
            width={360}
            height={360}
            // isResponsive={true}
            dataSlotType="video"
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 200,
    alignItems: 'center',
    backgroundColor: 'black',
    gap: 4,
    height: 1500,
  },
  button: {
    backgroundColor: '#63AA75',
    padding: 10,
    borderRadius: 5,
  },
});
