import { View, StyleSheet, Text, Pressable } from 'react-native';
import {
  BannerAd,
  setUserDetails,
  logEvent,
  updateConsentStatus,
  useAdgeistContext,
  getConsentStatus,
} from '@thealteroffice/react-native-adgeist';
import { useEffect } from 'react';

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

  return (
    <View style={styles.container}>
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

      <BannerAd
        dataAdSlot="68a4af38c752b36e62d2672c"
        width={360}
        height={360}
        isResponsive={false}
        dataSlotType="video"
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
    gap: 4,
  },
  button: {
    backgroundColor: '#63AA75',
    padding: 10,
    borderRadius: 5,
  },
});
