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

export interface AdPreviewSize {
  width?: Double;
  height?: Double;
}

export interface NativeAdPreviewEvent {
  code: string;
  type: string;
  message: string;
  data: Readonly<{
    reason: string;
  }>;
}

export interface NativeAdPreviewSizeChangedEvent {
  width: Double;
  height: Double;
}

export interface NativeProps extends ViewProps {
  type?: WithDefault<'banner' | 'display' | 'companion', 'banner'>;
  media?: WithDefault<'image' | 'gif' | 'video', 'image'>;
  creativeUrl?: string;
  companionUrl?: string;
  title?: string;
  description?: string;
  ctaUrl?: WithDefault<string, 'https://adgeist.ai'>;
  deepLinkUrl?: string;
  isResponsive?: WithDefault<boolean, true>;
  adSize?: AdPreviewSize;
  reserveSpace?: WithDefault<boolean, false>;

  onAdEvent?: DirectEventHandler<NativeAdPreviewEvent>;
  onAdSizeChanged?: DirectEventHandler<NativeAdPreviewSizeChangedEvent>;
}

interface NativeCommands {
  loadAd: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['loadAd'],
});

export default codegenNativeComponent<NativeProps>(
  'AdPreviewNativeComponent'
) as HostComponent<NativeProps>;

const isFabric = (global as any)?.nativeFabricUIManager !== undefined;

export const AdPreviewCommands = {
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
} as const;
