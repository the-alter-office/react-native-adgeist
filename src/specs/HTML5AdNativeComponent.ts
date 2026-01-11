import type { HostComponent, ViewProps } from 'react-native';
import type {
  DirectEventHandler,
  Double,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import * as React from 'react';

export interface AdSize {
  width?: Double;
  height?: Double;
}

export interface AdFailedToLoadEvent {
  error: string;
}

export interface NativeProps extends ViewProps {
  adUnitID: string;
  adIsResponsive?: boolean;
  adSize?: AdSize;
  adType: string;

  onAdLoaded?: DirectEventHandler<null>;
  onAdFailedToLoad?: DirectEventHandler<AdFailedToLoadEvent>;
  onAdOpened?: DirectEventHandler<null>;
  onAdClosed?: DirectEventHandler<null>;
  onAdClicked?: DirectEventHandler<null>;
}

interface NativeCommands {
  loadAd: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    isTestMode: boolean
  ) => void;
  destroy: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['loadAd', 'destroy'],
});

export default codegenNativeComponent<NativeProps>(
  'HTML5AdNativeComponent'
) as HostComponent<NativeProps>;
