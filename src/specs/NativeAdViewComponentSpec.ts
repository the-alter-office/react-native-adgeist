import type { HostComponent, ViewProps } from 'react-native';
import type {
  DirectEventHandler,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

export interface AdSize {
  type?: string;
  width?: Int32;
  height?: Int32;
}

export interface AdFailedToLoadEvent {
  error: string;
}

export interface NativeProps extends ViewProps {
  adUnitId: string;
  adSize?: AdSize;
  adType?: string;
  customOrigin?: string;
  onAdLoaded?: DirectEventHandler<null>;
  onAdFailedToLoad?: DirectEventHandler<AdFailedToLoadEvent>;
  onAdOpened?: DirectEventHandler<null>;
  onAdClosed?: DirectEventHandler<null>;
  onAdClicked?: DirectEventHandler<null>;
}

// For now, export the type only. The actual component registration
// will be handled by requireNativeComponent in AdgeistAdView.tsx
// This avoids the "Could not find component config" error
export default null as unknown as HostComponent<NativeProps>;
