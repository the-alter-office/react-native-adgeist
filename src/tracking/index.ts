import { Platform } from 'react-native';
import Adgeist from '../specs/NativeAdgeist';

export type TrackingAuthorizationStatus =
  'authorized' | 'denied' | 'restricted' | 'not-determined' | 'unavailable';

const TRACKING_AUTHORIZATION_STATUSES: ReadonlySet<string> =
  new Set<TrackingAuthorizationStatus>([
    'authorized',
    'denied',
    'restricted',
    'not-determined',
    'unavailable',
  ]);

const toTrackingAuthorizationStatus = (
  status: string
): TrackingAuthorizationStatus =>
  TRACKING_AUTHORIZATION_STATUSES.has(status)
    ? (status as TrackingAuthorizationStatus)
    : 'unavailable';

export const requestTrackingAuthorization =
  async (): Promise<TrackingAuthorizationStatus> => {
    if (Platform.OS !== 'ios') {
      return 'unavailable';
    }
    const status = await Adgeist.requestTrackingAuthorization();
    return toTrackingAuthorizationStatus(status);
  };

export const getTrackingAuthorizationStatus =
  async (): Promise<TrackingAuthorizationStatus> => {
    if (Platform.OS !== 'ios') {
      return 'unavailable';
    }
    const status = await Adgeist.getTrackingAuthorizationStatus();
    return toTrackingAuthorizationStatus(status);
  };
