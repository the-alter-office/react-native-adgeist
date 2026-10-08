import type { NativeSyntheticEvent } from 'react-native';
import type { AdSize } from './AdSize';

export type AdViewEventType =
  | 'AD_LOADED'
  | 'AD_CLOSED'
  | 'AD_CLICKED'
  | 'AD_NO_FILL'
  | 'AD_NETWORK_ERROR'
  | 'AD_INTERNAL_ERROR'
  | 'AD_WARNING';

export type AdViewEventCode =
  | 'AL1'
  | 'AL2'
  | 'AI1'
  | 'AE1'
  | 'AE2'
  | 'AE3'
  | 'AE4'
  | 'AW1'
  | 'AW2'
  | 'AW3'
  | 'AW4'
  | 'AW5'
  | 'AW6'
  | 'AW7'
  | 'AW8';

export interface AdViewEventData {
  reason: string;
}

export interface AdViewEvent {
  code: AdViewEventCode;
  type: AdViewEventType;
  message: string;
  data: AdViewEventData;
}

export interface HTML5AdNativeComponentProps {
  adUnitID: string;
  adIsResponsive?: boolean;
  adSize?: AdSize;
  reserveSpace?: boolean;

  onAdEvent?: (event: NativeSyntheticEvent<AdViewEvent>) => void;
}

export interface HTML5AdViewRef {
  loadAd: () => void;
  destroy: () => void;
}
