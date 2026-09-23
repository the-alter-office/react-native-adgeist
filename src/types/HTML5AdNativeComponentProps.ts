import type { NativeSyntheticEvent } from 'react-native';
import type { AdSize } from './AdSize';

export interface HTML5AdNativeComponentProps {
  adUnitID: string;
  adIsResponsive?: boolean;
  adSize?: AdSize;
  reserveSpace?: boolean;

  onAdLoaded?: () => void;
  onAdFailedToLoad?: (event: NativeSyntheticEvent<AdFailedToLoadEvent>) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
  onAdClicked?: () => void;
  onAdWarning?: (event: NativeSyntheticEvent<AdWarningEvent>) => void;
}

export interface AdFailedToLoadEvent {
  error: string;
}

export interface AdWarningEvent {
  warning: string;
}

export interface HTML5AdViewRef {
  loadAd: () => void;
  destroy: () => void;
}
