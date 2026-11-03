import { Platform } from 'react-native';
import Adgeist from '../specs/NativeAdgeist';

export const requestTrackingAuthorization = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return false;
  }
  return (await Adgeist.requestTrackingAuthorization()) === true;
};
