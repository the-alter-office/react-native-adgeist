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

import AdPreviewNativeComponent, {
  AdPreviewCommands,
  type NativeAdPreviewEvent,
  type NativeAdPreviewSizeChangedEvent,
} from '../specs/AdPreviewNativeComponent';
import type { AdSize } from '../types/AdSize';
import type { AdViewEvent } from '../types/HTML5AdNativeComponentProps';
import type {
  HTML5AdViewPreviewProps,
  HTML5AdViewPreviewRef,
} from '../types/AdPreviewProps';
import { toAdSizeAxis } from '../utilities';

export const HTML5AdViewPreview = forwardRef<
  HTML5AdViewPreviewRef,
  HTML5AdViewPreviewProps
>(
  (
    {
      type,
      media,
      creativeUrl,
      companionUrl,
      title,
      description,
      ctaUrl,
      deepLinkUrl,
      isResponsive,
      adSize,
      reserveSpace,
      onAdEvent,
    },
    ref
  ) => {
    const nativeRef = useRef<any>(null);
    const [isViewReady, setIsViewReady] = useState(false);
    const [resolvedSize, setResolvedSize] = useState<AdSize | null>(null);

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

    const containerStyle = useMemo<ViewStyle>(
      () => ({
        width: resolvedSize?.width ?? width ?? '100%',
        height: resolvedSize?.height ?? height ?? '100%',
      }),
      [width, height, resolvedSize]
    );

    const handleAdSizeChanged = useCallback(
      (event: NativeSyntheticEvent<NativeAdPreviewSizeChangedEvent>) => {
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

    const handleAdEvent = useCallback(
      (event: NativeSyntheticEvent<NativeAdPreviewEvent>) => {
        onAdEvent?.(event as NativeSyntheticEvent<AdViewEvent>);
      },
      [onAdEvent]
    );

    const loadAdInternal = useCallback(() => {
      if (!nativeRef.current) {
        console.warn(
          'HTML5AdViewPreview: Cannot load ad, native view not ready'
        );
        return;
      }

      try {
        AdPreviewCommands.loadAd(nativeRef.current);
      } catch (error) {
        if (__DEV__) {
          console.warn('HTML5AdViewPreview: Error loading preview:', error);
        }
      }
    }, []);

    const handleNativeRef = useCallback((instance: any) => {
      nativeRef.current = instance;

      if (instance) {
        requestAnimationFrame(() => {
          setIsViewReady(true);
        });
      } else {
        setIsViewReady(false);
      }
    }, []);

    useEffect(() => {
      if (isViewReady) {
        loadAdInternal();
      }
    }, [isViewReady, loadAdInternal]);

    useImperativeHandle(
      ref,
      () => ({
        loadAd: () => {
          if (isViewReady && nativeRef.current) {
            loadAdInternal();
          }
        },
      }),
      [isViewReady, loadAdInternal]
    );

    return (
      <AdPreviewNativeComponent
        ref={handleNativeRef}
        style={containerStyle}
        type={type}
        media={media}
        creativeUrl={creativeUrl}
        companionUrl={companionUrl}
        title={title}
        description={description}
        ctaUrl={ctaUrl}
        deepLinkUrl={deepLinkUrl}
        isResponsive={isResponsive}
        adSize={resolvedAdSize}
        reserveSpace={reserveSpace}
        onAdEvent={handleAdEvent}
        onAdSizeChanged={handleAdSizeChanged}
      />
    );
  }
);

HTML5AdViewPreview.displayName = 'HTML5AdViewPreview';
