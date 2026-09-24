import {
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useState,
  useMemo,
} from 'react';
import type { NativeSyntheticEvent, ViewStyle } from 'react-native';

import HTML5AdNativeComponent, {
  AdCommands,
  type AdSize,
  type AdSizeChangedEvent,
} from '../specs/HTML5AdNativeComponent';
import type {
  AdFailedToLoadEvent,
  HTML5AdNativeComponentProps,
  HTML5AdViewRef,
} from '../types/HTML5AdNativeComponentProps';
import { toAdSizeAxis } from '../utilities';

export const HTML5AdView = forwardRef<
  HTML5AdViewRef,
  HTML5AdNativeComponentProps
>(
  (
    {
      adUnitID,
      adIsResponsive,
      adSize,
      reserveSpace,
      onAdLoaded,
      onAdFailedToLoad,
      onAdOpened,
      onAdClosed,
      onAdClicked,
      onAdWarning,
    },
    ref
  ) => {
    const nativeRef = useRef<any>(null);
    const [isViewReady, setIsViewReady] = useState(false);
    const [resolvedSize, setResolvedSize] = useState<AdSize | null>(null);
    const [hasFailed, setHasFailed] = useState(false);

    const collapsesOnFailure = reserveSpace === false;

    const width = toAdSizeAxis(adSize?.width);
    const height = toAdSizeAxis(adSize?.height);

    const resolvedAdSize = useMemo<AdSize>(() => {
      const dimensions: AdSize = {};

      if (width !== undefined) {
        dimensions.width = width;
      }

      if (height !== undefined) {
        dimensions.height = height;
      }

      return dimensions;
    }, [width, height]);

    const nativeSize = adIsResponsive ? null : resolvedSize;

    const containerStyle = useMemo<ViewStyle>(
      () => ({
        width: nativeSize?.width ?? width ?? '100%',
        height: nativeSize?.height ?? height ?? '100%',
      }),
      [width, height, nativeSize]
    );

    const handleAdSizeChanged = useCallback(
      (event: NativeSyntheticEvent<AdSizeChangedEvent>) => {
        const { width: nativeWidth, height: nativeHeight } = event.nativeEvent;

        if (nativeWidth <= 0 || nativeHeight <= 0) return;

        setResolvedSize((current) =>
          current?.width === nativeWidth && current?.height === nativeHeight
            ? current
            : { width: nativeWidth, height: nativeHeight }
        );
      },
      []
    );

    const handleAdFailedToLoad = useCallback(
      (event: NativeSyntheticEvent<AdFailedToLoadEvent>) => {
        onAdFailedToLoad?.(event);

        if (collapsesOnFailure) {
          setHasFailed(true);
        }
      },
      [onAdFailedToLoad, collapsesOnFailure]
    );

    useEffect(() => {
      setResolvedSize(null);
      setHasFailed(false);
    }, [adUnitID]);

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
          if (hasFailed) {
            setHasFailed(false);
            return;
          }

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
      [isViewReady, loadAdInternal, hasFailed]
    );

    if (hasFailed && collapsesOnFailure) {
      return null;
    }

    return (
      <HTML5AdNativeComponent
        ref={handleNativeRef}
        style={containerStyle}
        // Required Props, it will take values from React Component props
        adUnitID={adUnitID}
        adIsResponsive={adIsResponsive}
        adSize={resolvedAdSize}
        reserveSpace={reserveSpace}
        // Required Event Callbacks
        onAdLoaded={onAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
        onAdOpened={onAdOpened}
        onAdClosed={onAdClosed}
        onAdClicked={onAdClicked}
        onAdWarning={onAdWarning}
        onAdSizeChanged={handleAdSizeChanged}
      />
    );
  }
);

HTML5AdView.displayName = 'HTML5AdView';
