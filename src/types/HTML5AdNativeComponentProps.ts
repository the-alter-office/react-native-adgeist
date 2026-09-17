import type { NativeSyntheticEvent } from 'react-native';
import type { AdSize } from './AdSize';

export interface HTML5AdNativeComponentProps {
  adUnitID: string;
  adIsResponsive?: boolean;
  adSize?: AdSize;

  onAdLoaded?: () => void;
  onAdFailedToLoad?: (event: NativeSyntheticEvent<AdFailedToLoadEvent>) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
  onAdClicked?: () => void;
}

export interface AdFailedToLoadEvent {
  error: string;
}

export interface HTML5AdViewRef {
  loadAd: () => void;
  destroy: () => void;
}
