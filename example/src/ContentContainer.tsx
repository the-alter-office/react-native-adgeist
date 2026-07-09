import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';

import {
  useAdgeistContext,
  getConsentStatus,
  HTML5AdView,
  AdTypes,
  type AdType,
} from '@thealteroffice/react-native-adgeist';
import { useEffect, useState } from 'react';

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

  const [adSpaceId, setAdSpaceId] = useState('');
  const [adType, setAdType] = useState<AdType>(AdTypes.BANNER);

  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [isResponsive, setIsResponsive] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [snippet, setSnippet] = useState(``);
  const [responsiveMode, setResponsiveMode] = useState<Boolean>(false);
  const [containerWidth, setContainerWidth] = useState('250');
  const [containerHeight, setContainerHeight] = useState('250');

  const handleParseSnippet = (): boolean => {
    // 1. Required: adUnitID
    const adUnitIDMatch = snippet.match(/adUnitID="([^"]+)"/);
    if (!adUnitIDMatch?.[1]) {
      Alert.alert('Error', 'Could not find adUnitID in the snippet.');
      setSnippet('');
      return false;
    }

    // 2. Required: adType
    const adTypeMatch =
      snippet.match(/adType="([^"]+)"/) ||
      snippet.match(/adType=\{AdTypes\.(\w+)\}/);

    if (!adTypeMatch?.[1]) {
      Alert.alert('Error', 'Could not find adType in the snippet.');
      setSnippet('');
      return false;
    }

    // Parse ad type early (we already know it exists)
    const rawType = adTypeMatch[1].toUpperCase();
    const validTypes = ['BANNER', 'DISPLAY', 'COMPANION'] as const;
    type ValidAdType = (typeof validTypes)[number];

    if (!validTypes.includes(rawType as any)) {
      Alert.alert(
        'Error',
        `Unsupported adType: ${rawType}. Supported: BANNER, DISPLAY, COMPANION`
      );
      setSnippet('');
      return false;
    }

    const parsedAdType = rawType as ValidAdType;

    // 3. Detect responsive vs fixed-size
    const adSizeMatch = snippet.match(
      /adSize\s*=\s*\{\{\s*width\s*:\s*(\d+)\s*,\s*height\s*:\s*(\d+)\s*\}\}/is
    );

    const adIsResponsive = !adSizeMatch;

    // 4. Width/Height extraction & validation (only for fixed-size ads)
    let widthStr: string | undefined;
    let heightStr: string | undefined;

    if (!adIsResponsive) {
      if (adSizeMatch) {
        widthStr = adSizeMatch[1];
        heightStr = adSizeMatch[2];
      } else {
        // fallback legacy attributes
        const wMatch = snippet.match(/width="([^"]+)"/);
        const hMatch = snippet.match(/height="([^"]+)"/);

        if (wMatch?.[1] && hMatch?.[1]) {
          widthStr = wMatch[1];
          heightStr = hMatch[1];
        }
      }

      // Validate dimensions if we have them
      if (widthStr && heightStr) {
        const w = parseInt(widthStr, 10);
        const h = parseInt(heightStr, 10);

        if (isNaN(w) || isNaN(h) || w < 1 || h < 1) {
          Alert.alert('Error', 'Invalid ad dimensions (not valid numbers).');
          setSnippet('');
          return false;
        }

        // Very small banner check
        if (w < 240 && h < 50) {
          Alert.alert(
            'Error',
            'Ad dimensions are too small. Please use valid size.'
          );
          setSnippet('');
          return false;
        }

        // Set dimensions only for non-responsive
        setWidth(widthStr);
        setHeight(heightStr);
      }
    }

    // 5. All required fields found → set state
    setAdSpaceId(adUnitIDMatch[1]);
    setAdType(parsedAdType);
    setIsResponsive(adIsResponsive);

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
    setAdType(AdTypes.BANNER);
    setWidth('');
    setHeight('');
    setSnippet(``);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Responsive Type</Text>
        <Text style={styles.note}>
          Note: Enable responsive only for companion and display ads.
        </Text>
        <View style={styles.toggleContainer}>
          <Pressable
            style={[
              styles.toggleButton,
              !responsiveMode && styles.toggleButtonActive,
            ]}
            onPress={() => {
              setResponsiveMode(false);
              handleCancel();
            }}
          >
            <Text
              style={[
                styles.toggleButtonText,
                !responsiveMode && styles.toggleButtonTextActive,
              ]}
            >
              With Dimensions
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggleButton,
              responsiveMode && styles.toggleButtonActive,
            ]}
            onPress={() => {
              setResponsiveMode(true);
              handleCancel();
            }}
          >
            <Text
              style={[
                styles.toggleButtonText,
                responsiveMode && styles.toggleButtonTextActive,
              ]}
            >
              Responsive
            </Text>
          </Pressable>
        </View>

        {responsiveMode && (
          <View style={styles.dimensionsContainer}>
            <View style={styles.dimensionInput}>
              <Text style={styles.dimensionLabel}>Container Width</Text>
              <TextInput
                style={styles.dimensionField}
                value={containerWidth}
                onChangeText={setContainerWidth}
                placeholder="360"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.dimensionInput}>
              <Text style={styles.dimensionLabel}>Container Height</Text>
              <TextInput
                style={styles.dimensionField}
                value={containerHeight}
                onChangeText={setContainerHeight}
                placeholder="360"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

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
            <View
              style={{
                height: parseInt(containerHeight) || 320,
                width: parseInt(containerWidth) || 320,
                overflow: 'hidden',
              }}
            >
              <HTML5AdView
                key={'isReponsive'}
                adUnitID={adSpaceId}
                adIsResponsive={isResponsive}
                adType={adType}
                onAdLoaded={() => {}}
                onAdFailedToLoad={(event) => {
                  const errorMessage = event.nativeEvent.error;
                  setShowAd(false);
                  setSnippet(``);
                  Alert.alert(
                    'Ad Failed to Load',
                    errorMessage || 'Please check the ad snippet.'
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
              adSize={{ width: parseInt(width), height: parseInt(height) }}
              adType={adType}
              onAdLoaded={() => {}}
              onAdFailedToLoad={(event) => {
                const errorMessage = event.nativeEvent.error;
                setShowAd(false);
                setSnippet('');
                Alert.alert(
                  'Ad Failed to Load',
                  errorMessage || 'Please check the ad snippet.'
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
  note: {
    color: '#ccc',
    fontSize: 12,
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
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  toggleButtonActive: {
    backgroundColor: '#63AA75',
  },
  toggleButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  dimensionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  dimensionInput: {
    flex: 1,
  },
  dimensionLabel: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 8,
  },
  dimensionField: {
    backgroundColor: '#2a2a2a',
    color: 'white',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#63AA75',
    padding: 10,
    borderRadius: 5,
  },
});
