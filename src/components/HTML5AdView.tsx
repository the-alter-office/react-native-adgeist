import {
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useState,
  useMemo,
} from 'react';
import type { ViewStyle } from 'react-native';

import { useAdgeistContext } from '../providers/AdgeistProvider';
import HTML5AdNativeComponent, {
  Commands,
} from '../specs/HTML5AdNativeComponent';
import type {
  HTML5AdNativeComponentProps,
  HTML5AdRequest,
  HTML5AdViewRef,
} from '../types/HTML5AdNativeComponentProps';
import { AdSizes } from '../constants';

export const HTML5AdView = forwardRef<
  HTML5AdViewRef,
  HTML5AdNativeComponentProps & HTML5AdRequest
>(
  (
    {
      adUnitID,
      adSize = AdSizes.BANNER,
      adType,
      onAdLoaded,
      onAdFailedToLoad,
      onAdOpened,
      onAdClosed,
      onAdClicked,
    },
    ref
  ) => {
    const { isTestEnvironment } = useAdgeistContext();

    const nativeRef = useRef<any>(null);
    const [isViewReady, setIsViewReady] = useState(false);
    const pendingLoadRef = useRef<HTML5AdRequest | null>(null);

    const dimensions = useMemo(() => {
      const width = adSize.width ?? 360;
      const height = adSize.height ?? 360;
      return { width, height };
    }, [adSize.width, adSize.height]);

    const containerStyle = useMemo<ViewStyle>(
      () => ({
        width: dimensions.width,
        height: dimensions.height,
      }),
      [dimensions]
    );

    const loadAdInternal = useCallback(
      (request: HTML5AdRequest = { isTestMode: isTestEnvironment }) => {
        if (!nativeRef.current) {
          console.warn('HTML5AdView: Cannot load ad, native view not ready');
          return;
        }

        const finalRequest = {
          ...request,
          isTestMode: request.isTestMode ?? isTestEnvironment,
        };

        try {
          Commands.loadAd(nativeRef.current, finalRequest.isTestMode);
        } catch (error) {
          if (__DEV__) {
            console.warn('HTML5AdView: Error loading ad:', error);
          }
        }
      },
      [isTestEnvironment]
    );

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
        const request: HTML5AdRequest = { isTestMode: isTestEnvironment };
        if (pendingLoadRef.current) {
          loadAdInternal(pendingLoadRef.current);
          pendingLoadRef.current = null;
        } else {
          loadAdInternal(request);
        }
      }
    }, [isViewReady, adUnitID, isTestEnvironment, loadAdInternal]);

    useImperativeHandle(
      ref,
      () => ({
        loadAd: (adRequest?: HTML5AdRequest) => {
          const request = adRequest || { isTestMode: isTestEnvironment };

          if (isViewReady && nativeRef.current) {
            loadAdInternal(request);
          } else {
            pendingLoadRef.current = request;
          }
        },
        destroy: () => {
          if (nativeRef.current) {
            try {
              Commands.destroy(nativeRef.current);
            } catch (e) {
              console.warn('Error destroying ad view:', e);
            }
          }
        },
      }),
      [isViewReady, isTestEnvironment, loadAdInternal]
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
        adSize={adSize}
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
