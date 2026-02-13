import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ScrollView,
  Linking,
  TextInput,
  Alert,
} from 'react-native';

import {
  useAdgeistContext,
  getConsentStatus,
  trackConversionsWithDeepLinks,
  HTML5AdView,
} from '@thealteroffice/react-native-adgeist';
import { useEffect, useState } from 'react';
import { AdSizes } from '../../src/constants';

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

  useEffect(() => {
    const handleUrl = (url: string) => {
      trackConversionsWithDeepLinks(url);
    };

    // Handle initial URL if app was opened from link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl(url);
      }
    });

    // Handle URL changes while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => subscription?.remove();
  }, []);

  const [adSpaceId, setAdSpaceId] = useState('');
  const [adType, setAdType] = useState('');

  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [isResponsive, setIsResponsive] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [snippet, setSnippet] = useState('');

  const handleParseSnippet = () => {
    const adSlotMatch = snippet.match(/dataAdSlot="([^"]*)"/);
    const widthMatch = snippet.match(/width="([^"]*)"/);
    const heightMatch = snippet.match(/height="([^"]*)"/);
    const slotTypeMatch = snippet.match(/dataSlotType="([^"]*)"/);
    const isResponsive = snippet.includes('isResponsive=true');

    if (
      !isResponsive &&
      widthMatch?.[1] &&
      heightMatch?.[1] &&
      parseInt(widthMatch[1]) < 240 &&
      parseInt(heightMatch[1]) < 50
    ) {
      Alert.alert('Please provide valid ad dimensions.');
      setSnippet('');
      return false;
    }

    if (adSlotMatch && adSlotMatch[1]) setAdSpaceId(adSlotMatch[1]);
    if (!isResponsive && widthMatch && widthMatch[1]) setWidth(widthMatch[1]);
    if (!isResponsive && heightMatch && heightMatch[1])
      setHeight(heightMatch[1]);
    if (slotTypeMatch && slotTypeMatch[1]) setAdType(slotTypeMatch[1]);
    if (isResponsive) setIsResponsive(true);

    return true;
  };

  const handleSubmit = () => {
    if (handleParseSnippet()) {
      setShowAd(true);
    }
  };

  const handleCancel = () => {
    setShowAd(false);
    setAdSpaceId('');
    setAdType('');
    setWidth('');
    setHeight('');
    setSnippet('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>
          Paste Ad Code Snippet (HTML5AdView Component)
        </Text>

        <TextInput
          style={[styles.input, { height: 150, textAlignVertical: 'top' }]}
          value={snippet}
          onChangeText={setSnippet}
          placeholder="Paste code snippet here..."
          placeholderTextColor="#999"
          multiline
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Pressable
            style={[styles.submitButton, showAd && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={showAd}
          >
            <Text style={styles.submitButtonText}>Generate Ad</Text>
          </Pressable>

          <Pressable
            style={[styles.submitButton, !showAd && styles.disabledButton]}
            onPress={handleCancel}
            disabled={!showAd}
          >
            <Text style={styles.submitButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>

      {showAd && (
        <>
          {isResponsive ? (
            <View style={{ height: 360, width: 360 }}>
              <HTML5AdView
                key={'isReponsive'}
                adUnitID={adSpaceId}
                adIsResponsive={isResponsive}
                adType={adType}
                onAdLoaded={() => {}}
                onAdFailedToLoad={() => {
                  setShowAd(false);
                  setSnippet('');
                  Alert.alert(
                    'Ad Failed to Load',
                    'Please check the ad snippet.'
                  );
                }}
                onAdOpened={() => {}}
                onAdClosed={() => {}}
                onAdClicked={() => {}}
              />
            </View>
          ) : (
            <HTML5AdView
              key={width + height}
              adUnitID={adSpaceId}
              adSize={AdSizes.custom(parseInt(width), parseInt(height))}
              adType={adType}
              onAdLoaded={() => {}}
              onAdFailedToLoad={() => {
                setShowAd(false);
                setSnippet('');
                Alert.alert(
                  'Ad Failed to Load',
                  'Please check the ad snippet.'
                );
              }}
              onAdOpened={() => {}}
              onAdClosed={() => {}}
              onAdClicked={() => {}}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: 'black',
    gap: 4,
    paddingBottom: 100,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: 'white',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#63AA75',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
    width: '48%',
  },
  disabledButton: {
    backgroundColor: '#555',
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#63AA75',
    padding: 10,
    borderRadius: 5,
  },
});
