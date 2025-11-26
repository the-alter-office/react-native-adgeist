import {
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from 'react';
import {
  requireNativeComponent,
  UIManager,
  type ViewStyle,
  findNodeHandle,
  type NativeSyntheticEvent,
} from 'react-native';
import type { AdSize } from '../types/AdSize';
import { AdSizes, NATIVE_AD_COMPONENT_NAME } from '../constants';

// Ad Request interface
export interface AdRequest {
  isTestMode?: boolean;
}

// Event interfaces
export interface AdFailedToLoadEvent {
  error: string;
}

// Props interface
export interface AdgeistAdViewProps {
  adUnitId: string;
  adSize?: AdSize;
  isTestMode?: boolean;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (event: NativeSyntheticEvent<AdFailedToLoadEvent>) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
  onAdClicked?: () => void;
}

export interface AdgeistAdViewRef {
  loadAd: (adRequest?: AdRequest) => void;
  destroy: () => void;
}

interface NativeAdViewProps {
  adUnitId: string;
  adSize?: AdSize;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (event: NativeSyntheticEvent<AdFailedToLoadEvent>) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
  onAdClicked?: () => void;
}

let NativeAdView: any;

try {
  const SpecComponent = require('../specs/NativeAdViewComponentSpec').default;
  if (SpecComponent) {
    NativeAdView = SpecComponent;
  } else {
    NativeAdView = requireNativeComponent<NativeAdViewProps>(
      NATIVE_AD_COMPONENT_NAME
    );
  }
} catch {
  NativeAdView = requireNativeComponent<NativeAdViewProps>(
    NATIVE_AD_COMPONENT_NAME
  );
}

const AdgeistAdViewComponent = forwardRef<AdgeistAdViewRef, AdgeistAdViewProps>(
  (
    {
      adUnitId,
      adSize = AdSizes.BANNER,
      isTestMode = false,
      onAdLoaded,
      onAdFailedToLoad,
      onAdOpened,
      onAdClosed,
      onAdClicked,
    },
    ref
  ) => {
    const nativeRef = useRef(null);

    const loadAdInternal = useCallback(
      (adRequest?: AdRequest) => {
        const nodeHandle = findNodeHandle(nativeRef.current);
        if (nodeHandle) {
          const finalAdRequest = adRequest || { isTestMode };
          UIManager.dispatchViewManagerCommand(nodeHandle, 'loadAd', [
            finalAdRequest,
          ]);
        }
      },
      [isTestMode]
    );

    useImperativeHandle(
      ref,
      () => ({
        loadAd: (adRequest?: AdRequest) => {
          loadAdInternal(adRequest);
        },
        destroy: () => {
          const nodeHandle = findNodeHandle(nativeRef.current);
          if (nodeHandle) {
            UIManager.dispatchViewManagerCommand(nodeHandle, 'destroy', []);
          }
        },
      }),
      [loadAdInternal]
    );

    useEffect(() => {
      loadAdInternal();
    }, [adUnitId, isTestMode, loadAdInternal]);

    const getAdDimensions = useCallback((): {
      width: number;
      height: number;
    } => {
      if (adSize.width && adSize.height) {
        return { width: adSize.width, height: adSize.height };
      }
      return { width: 360, height: 360 };
    }, [adSize]);

    const dimensions = getAdDimensions();

    const containerStyle: ViewStyle = {
      width: dimensions.width,
      height: dimensions.height,
    };

    return (
      <NativeAdView
        ref={nativeRef}
        adUnitId={adUnitId}
        adSize={adSize}
        style={containerStyle}
        onAdLoaded={onAdLoaded}
        onAdFailedToLoad={onAdFailedToLoad}
        onAdOpened={onAdOpened}
        onAdClosed={onAdClosed}
        onAdClicked={onAdClicked}
      />
    );
  }
);

export const AdgeistAdView = AdgeistAdViewComponent;
