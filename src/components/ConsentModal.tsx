import React from 'react';

import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useAdgeistContext } from './AdgeistProvider';
import Adgeist from '../NativeAdgeist';

interface ConsentModalPropsType {}

export const ConsentModal: React.FC<ConsentModalPropsType> = () => {
  const { setAdgeistConsentModal } = useAdgeistContext();

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalInnerContainer}>
        <Text style={styles.headerContainer}>Your privacy matters</Text>
        <Text style={styles.textContainer}>
          We use data to provide and improve our services, deliver safer and
          more relevant ads, and measure performance.
        </Text>

        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.button}
            onPress={() => setAdgeistConsentModal(false)}
          >
            <Text style={styles.buttonText}>Decline</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => {
              Adgeist.updateConsentStatus(true);
              setAdgeistConsentModal(false);
            }}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
    backgroundColor: '#000000DD',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInnerContainer: {
    width: '95%',
    maxWidth: 375,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  headerContainer: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
    opacity: 0.8,
  },
  textContainer: {
    fontSize: 15,
    marginBottom: 5,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    backgroundColor: '#000000CC',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
    marginVertical: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 15,
  },
});
