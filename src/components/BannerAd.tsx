/**
 * @module BannerAd
 * @description A React Native component for displaying banner and video ads with robust error handling and analytics.
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import Adgeist from '../NativeAdgeist';
import { useAdgeistContext } from './AdgeistProvider';
import { normalizeUrl } from '../utilities';

/**
 * Interface for ad data structure
 */
interface AdData {
  id: string;
  bidId: string;
  cur: string;
  seatBid: SeatBid[];
}

/**
 * Interface for seat bid data
 */
interface SeatBid {
  bidId: string;
  bid: Bid[];
}

/**
 * Interface for individual bid
 */
interface Bid {
  id: string;
  impId: string;
  price: number;
  ext: BidExtension;
}

/**
 * Interface for bid extension data
 */
interface BidExtension {
  creativeUrl: string;
  ctaUrl: string;
  creativeTitle: string;
  creativeDescription: string;
  creativeBrandName?: string;
}

/**
 * Props for the BannerAd component
 */
interface AdBannerProps {
  /** Unique identifier for the ad slot */
  dataAdSlot: string;
  /** Type of ad to display */
  dataSlotType?: 'banner' | 'video';
  /** Width of the ad container */
  width?: number;
  /** Height of the ad container */
  height?: number;
  /** Enable responsive layout */
  isResponsive?: boolean;
  /** Responsive layout type */
  responsiveType?: 'SQUARE' | 'VERTICAL' | 'WIDE';
  /** Callback for ad load errors */
  onAdLoadError?: (error: Error) => void;
  /** Callback for ad load success */
  onAdLoadSuccess?: (adData: AdData) => void;
}

export const BannerAd: React.FC<AdBannerProps> = ({
  dataAdSlot,
  dataSlotType = 'banner',
  width = 0,
  height = 0,
  isResponsive = false,
  onAdLoadError,
  onAdLoadSuccess,
}) => {
  const [adData, setAdData] = useState<AdData | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasImpression, setHasImpression] = useState<boolean>(false);
  const [hasView, setHasView] = useState<boolean>(false);
  const renderStartTime = useRef(Date.now());
  const adRef = useRef<View>(null);
  const visibilityStartTime = useRef<number | null>(null);
  const timeToVisible = useRef<number | null>(null);
  const viewTime = useRef<number>(0);
  const lastCheckTime = useRef<number>(Date.now());
  const currentVisibilityRatio = useRef<number>(0);
  const videoRef = useRef<any>(null);
  const lastPausedTime = useRef<number>(0);
  const isInView = useRef<boolean>(false);

  const { isInitialized, publisherId, apiKey, domain, isTestEnvironment } =
    useAdgeistContext();

  const creativeData = adData?.seatBid?.[0]?.bid?.[0]?.ext as BidExtension;
  const bidId = adData?.id;
  const campaignId = adData?.seatBid?.[0]?.bid?.[0]?.id;
  const adSpaceId = dataAdSlot;

  /**
   * Fetches ad creative data (without tracking impression here)
   */
  const fetchAd = useCallback(async () => {
    if (!isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);
      setHasImpression(false);
      setHasView(false);

      const response = await Adgeist.fetchCreative(
        apiKey,
        domain,
        dataAdSlot,
        publisherId,
        isTestEnvironment
      );

      const creative: { data: AdData } = response as { data: AdData };
      setAdData(creative.data);
      onAdLoadSuccess?.(creative.data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Ad load failed');
      setError(error);
      setHasImpression(false);
      setHasView(false);
      onAdLoadError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    isInitialized,
    publisherId,
    dataAdSlot,
    apiKey,
    domain,
    isTestEnvironment,
    onAdLoadError,
    onAdLoadSuccess,
  ]);

  /**
   * Tracks impression when media (image/video) is fully loaded
   */
  const trackImpressionOnMediaLoad = useCallback(async () => {
    if (hasImpression || !bidId || !campaignId) return;

    try {
      const renderTime = Date.now() - renderStartTime.current;

      await Adgeist.trackImpression(
        campaignId,
        adSpaceId,
        publisherId,
        apiKey,
        bidId,
        isTestEnvironment,
        renderTime
      );

      setHasImpression(true);
    } catch (err) {
      console.error('Failed to track impression:', err);
    }
  }, [
    hasImpression,
    bidId,
    campaignId,
    adSpaceId,
    publisherId,
    apiKey,
    isTestEnvironment,
  ]);

  /**
   * Tracks view event for banner ads when visible for >=1s and >=50% in viewport
   */
  const trackView = useCallback(async () => {
    if (hasView || !hasImpression || !bidId || !campaignId) return;

    try {
      const currentViewTime = viewTime.current;
      const currentTimeToVisible = timeToVisible.current || 0;
      const visibility = currentVisibilityRatio.current;

      if (
        currentViewTime >= (dataSlotType === 'video' ? 2000 : 1000) &&
        visibility >= 0.5 &&
        timeToVisible.current !== null
      ) {
        await Adgeist.trackView(
          campaignId,
          adSpaceId,
          publisherId,
          apiKey,
          bidId,
          isTestEnvironment,
          currentViewTime,
          visibility,
          0,
          currentTimeToVisible
        );

        setHasView(true);
      }
    } catch (err) {
      console.error('Failed to track view:', err);
    }
  }, [
    hasView,
    hasImpression,
    bidId,
    campaignId,
    adSpaceId,
    publisherId,
    apiKey,
    isTestEnvironment,
    dataSlotType,
  ]);

  /**
   * Calculates visibility ratio and updates view metrics
   */
  const checkVisibility = useCallback(() => {
    if (!adRef.current || !hasImpression) return;

    adRef.current.measure((_x, _y, _width, height, _pageX, pageY) => {
      const window = Dimensions.get('window');
      const windowHeight = window.height;

      const adTop = pageY;
      const adBottom = pageY + height;
      const windowTop = 0;
      const windowBottom = windowHeight;

      const visibleTop = Math.max(adTop, windowTop);
      const visibleBottom = Math.min(adBottom, windowBottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibilityRatio = height > 0 ? visibleHeight / height : 0;
      currentVisibilityRatio.current = visibilityRatio;

      const currentTime = Date.now();
      const deltaTime = currentTime - lastCheckTime.current;
      lastCheckTime.current = currentTime;

      if (visibilityRatio >= 0.5 && timeToVisible.current === null) {
        timeToVisible.current = currentTime - renderStartTime.current;
      }

      if (visibilityRatio >= 0.5) {
        viewTime.current += deltaTime;
        if (!visibilityStartTime.current) {
          visibilityStartTime.current = currentTime;
        }
      } else {
        visibilityStartTime.current = null;
      }

      if (
        viewTime.current >= (dataSlotType === 'video' ? 2000 : 1000) &&
        visibilityRatio >= 0.5
      ) {
        trackView();
      }

      if (dataSlotType === 'video' && videoRef.current) {
        if (visibilityRatio >= 0.5) {
          isInView.current = true;
          videoRef.current.seek(lastPausedTime.current || 0);
        } else {
          isInView.current = false;
          lastPausedTime.current = videoRef.current.currentTime || 0;
        }
      }
    });
  }, [hasImpression, trackView, dataSlotType]);

  /**
   * Handles ad click and sends click analytics
   */
  const handleClick = useCallback(async () => {
    if (!adData || !adData.seatBid.length || !bidId || !campaignId) return;

    try {
      Adgeist.trackClick(
        campaignId,
        adSpaceId,
        publisherId,
        apiKey,
        bidId,
        isTestEnvironment
      );

      await Linking.openURL(normalizeUrl(creativeData.ctaUrl));
    } catch (err) {
      console.error('Failed to handle ad click:', err);
    }
  }, [
    adData,
    bidId,
    campaignId,
    adSpaceId,
    publisherId,
    apiKey,
    isTestEnvironment,
    creativeData,
  ]);

  useEffect(() => {
    renderStartTime.current = Date.now();
    lastCheckTime.current = Date.now();
    fetchAd();
  }, [fetchAd]);

  useEffect(() => {
    if (!hasImpression || hasView) return;

    const intervalId = setInterval(checkVisibility, 200);

    return () => {
      clearInterval(intervalId);
    };
  }, [hasImpression, hasView, checkVisibility]);

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingOverlayContainer,
          !isResponsive && { width: width, height: height },
        ]}
      >
        <ActivityIndicator size="large" color="#63AA75" />
      </View>
    );
  }

  if (!creativeData?.creativeUrl || error) return null;

  return (
    <TouchableWithoutFeedback
      accessible
      accessibilityLabel="Ad Banner"
      style={{ width: '100%', height: '100%' }}
    >
      <View
        ref={adRef}
        style={[
          styles.adContainer,
          !isResponsive && { width: width, height: height },
        ]}
      >
        {dataSlotType === 'banner' ? (
          <TouchableWithoutFeedback onPress={handleClick}>
            <Image
              style={styles.creative}
              source={{ uri: creativeData.creativeUrl }}
              accessibilityLabel="Ad Creative"
              resizeMode="contain"
              onLoad={trackImpressionOnMediaLoad}
              onError={(e) => {
                console.error('Image load error:', e.nativeEvent.error);
                setError(new Error('Failed to load ad image'));
              }}
            />
          </TouchableWithoutFeedback>
        ) : (
          <View style={styles.videoCreative}>
            <TouchableWithoutFeedback onPress={handleClick}>
              <Video
                ref={videoRef}
                source={{ uri: creativeData.creativeUrl }}
                resizeMode="contain"
                style={{ width: '100%', height: '100%' }}
                repeat={true}
                muted={isMuted}
                onLoad={trackImpressionOnMediaLoad}
                onError={() => {
                  setError(new Error('Failed to load ad video'));
                }}
              />
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => setIsMuted(!isMuted)}>
              <Image
                style={styles.soundIcon}
                source={{
                  uri: isMuted
                    ? 'https://d2cfeg6k9cklz9.cloudfront.net/ad-icons/Muted.png'
                    : 'https://d2cfeg6k9cklz9.cloudfront.net/ad-icons/Unmuted.png',
                }}
                accessibilityLabel={isMuted ? 'Unmute video' : 'Mute video'}
              />
            </TouchableWithoutFeedback>
          </View>
        )}

        <View style={styles.adContent}>
          <View style={styles.contentContainer}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {creativeData.creativeTitle}
            </Text>
            <Text
              style={styles.description}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {creativeData.creativeDescription}
            </Text>
            <Text
              style={styles.brandName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {creativeData?.creativeBrandName || 'The Brand Name'}
            </Text>
          </View>
          <TouchableWithoutFeedback onPress={handleClick}>
            <Image
              style={styles.linkButton}
              source={{
                uri: 'https://d2cfeg6k9cklz9.cloudfront.net/ad-icons/Button.png',
              }}
              accessibilityLabel="Visit Advertiser Site"
            />
          </TouchableWithoutFeedback>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  loadingOverlayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  creative: {
    resizeMode: 'contain',
    borderTopLeftRadius: 5,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 5,
    width: '100%',
    height: '70%',
  },
  videoCreative: {
    position: 'relative',
    width: '100%',
    height: '70%',
  },
  soundIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
  },
  adContent: {
    width: '100%',
    height: '30%',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingRight: 10,
    paddingLeft: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  contentContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: '#4A4A4A',
    fontSize: 15,
    marginBottom: 4,
  },
  brandName: {
    color: '#6B7280',
    fontSize: 14,
    textTransform: 'capitalize',
    opacity: 0.8,
  },
  linkButton: {
    width: 80,
    height: 40,
    objectFit: 'contain',
  },
});
