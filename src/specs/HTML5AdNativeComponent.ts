import type { HostComponent, ViewProps } from 'react-native';
import type {
  DirectEventHandler,
  Double,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import * as React from 'react';
import { Platform, UIManager, findNodeHandle } from 'react-native';

export interface AdSize {
  width?: Double;
  height?: Double;
}

export type AdType = 'BANNER' | 'DISPLAY' | 'COMPANION';

export interface AdFailedToLoadEvent {
  error: string;
}

export interface NativeProps extends ViewProps {
  adUnitID: string;
  adIsResponsive?: boolean;
  adSize?: AdSize;
  adType?: WithDefault<AdType, 'BANNER'>;

  onAdLoaded?: DirectEventHandler<null>;
  onAdFailedToLoad?: DirectEventHandler<AdFailedToLoadEvent>;
  onAdOpened?: DirectEventHandler<null>;
  onAdClosed?: DirectEventHandler<null>;
  onAdClicked?: DirectEventHandler<null>;
}

interface NativeCommands {
  loadAd: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  destroy: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['loadAd', 'destroy'],
});

export default codegenNativeComponent<NativeProps>(
  'HTML5AdNativeComponent'
) as HostComponent<NativeProps>;

const isFabric = (global as any)?.nativeFabricUIManager !== undefined;

export const AdCommands = {
  loadAd: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => {
    if (isFabric) {
      Commands.loadAd(viewRef);
    } else {
      const reactTag = findNodeHandle(viewRef);
      if (reactTag != null) {
        UIManager.dispatchViewManagerCommand(
          reactTag,
          Platform.OS === 'ios' ? 'loadAd' : 1,
          []
        );
      }
    }
  },

  destroy: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => {
    if (isFabric) {
      Commands.destroy(viewRef);
    } else {
      const reactTag = findNodeHandle(viewRef);
      if (reactTag != null) {
        UIManager.dispatchViewManagerCommand(
          reactTag,
          Platform.OS === 'ios' ? 'destroy' : 2,
          []
        );
      }
    }
  },
} as const;
