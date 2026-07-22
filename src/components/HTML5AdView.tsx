import {
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useState,
  useMemo,
} from 'react';
import type { ViewStyle, DimensionValue } from 'react-native';

import HTML5AdNativeComponent, {
  AdCommands,
} from '../specs/HTML5AdNativeComponent';
import type {
  HTML5AdNativeComponentProps,
  HTML5AdViewRef,
} from '../types/HTML5AdNativeComponentProps';
import { AdSizes } from '../constants';

export const HTML5AdView = forwardRef<
  HTML5AdViewRef,
  HTML5AdNativeComponentProps
>(
  (
    {
      adUnitID,
      adIsResponsive,
      adSize,
      adType,
      onAdLoaded,
      onAdFailedToLoad,
      onAdOpened,
      onAdClosed,
      onAdClicked,
    },
    ref
  ) => {
    const nativeRef = useRef<any>(null);
    const [isViewReady, setIsViewReady] = useState(false);

    const dimensions = useMemo<{
      width: DimensionValue;
      height: DimensionValue;
    }>(() => {
      const width: DimensionValue = adSize?.width ?? '100%';
      const height: DimensionValue = adSize?.height ?? '100%';
      return { width, height };
    }, [adSize?.width, adSize?.height]);

    const containerStyle = useMemo<ViewStyle>(
      () => ({
        width: dimensions.width,
        height: dimensions.height,
      }),
      [dimensions]
    );

    const loadAdInternal = useCallback(() => {
      if (!nativeRef.current) {
        console.warn('HTML5AdView: Cannot load ad, native view not ready');
        return;
      }

      try {
        AdCommands.loadAd(nativeRef.current);
      } catch (error) {
        if (__DEV__) {
          console.warn('HTML5AdView: Error loading ad:', error);
        }
      }
    }, []);

    const handleNativeRef = useCallback((ref: any) => {
      nativeRef.current = ref;

      if (ref) {
        // Mark as ready in the next animation frame (ensures layout pass completed)
        requestAnimationFrame(() => {
          setIsViewReady(true);
        });
      } else {
        setIsViewReady(false);
      }
    }, []);

    useEffect(() => {
      if (isViewReady && adUnitID) {
        loadAdInternal();
      }
    }, [isViewReady, adUnitID, loadAdInternal]);

    useImperativeHandle(
      ref,
      () => ({
        loadAd: () => {
          if (isViewReady && nativeRef.current) {
            loadAdInternal();
          }
        },
        destroy: () => {
          if (nativeRef.current) {
            try {
              AdCommands.destroy(nativeRef.current);
            } catch (e) {
              console.warn('Error destroying ad view:', e);
            }
          }
        },
      }),
      [isViewReady, loadAdInternal]
    );

    if (__DEV__) {
      console.log('[HTML5AdView]', { adUnitID, adSize, adType, isViewReady });
    }

    return (
      <HTML5AdNativeComponent
        ref={handleNativeRef}
        style={containerStyle}
        // Required Props, it will take values from React Component props
        adUnitID={adUnitID}
        adSize={adIsResponsive ? AdSizes.Responsive : adSize}
        adIsResponsive={adIsResponsive}
        adType={adType}
        // Required Event Callbacks
        onAdLoaded={onAdLoaded}
        onAdFailedToLoad={onAdFailedToLoad}
        onAdOpened={onAdOpened}
        onAdClosed={onAdClosed}
        onAdClicked={onAdClicked}
      />
    );
  }
);

HTML5AdView.displayName = 'HTML5AdView';
