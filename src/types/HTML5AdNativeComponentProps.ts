import type { NativeSyntheticEvent } from 'react-native';
import type { AdSize } from './AdSize';
import type { AdType } from './AdType';

export interface HTML5AdNativeComponentProps {
  adUnitID: string;
  adIsResponsive?: boolean;
  adSize?: AdSize;
  adType: AdType;

  onAdLoaded?: () => void;
  onAdFailedToLoad?: (event: NativeSyntheticEvent<AdFailedToLoadEvent>) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
  onAdClicked?: () => void;
}

export interface AdFailedToLoadEvent {
  error: string;
}

export interface HTML5AdRequest {
  isTestMode?: boolean;
}

export interface HTML5AdViewRef {
  loadAd: (adRequest?: HTML5AdRequest) => void;
  destroy: () => void;
}
