import React from 'react';

import { Dimensions, StyleSheet, View, Text, Pressable } from 'react-native';
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
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
    backgroundColor: '#00000044',
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInnerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  headerContainer: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textContainer: {
    fontSize: 14,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 5,
  },
  button: {
    backgroundColor: '#63AA75',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'black',
  },
});
