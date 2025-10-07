/**
 * @module BannerAd
 * @description A React Native component for displaying banner and video ads with robust error handling and analytics.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import Adgeist from '../NativeAdgeist';
import { useAdgeistContext } from './AdgeistProvider';

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
  // responsiveType = 'SQUARE',
  onAdLoadError,
  onAdLoadSuccess,
}) => {
  const [adData, setAdData] = useState<AdData | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { isInitialized, publisherId, apiKey, domain, isTestEnvironment } =
    useAdgeistContext();

  const creativeData = adData?.seatBid?.[0]?.bid?.[0]?.ext as BidExtension;

  /**
   * Fetches ad creative and sends impression analytics
   */
  const fetchAd = useCallback(async () => {
    if (!isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);

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

      // if (creative.data.seatBid.length > 0) {
      //   await Adgeist.sendCreativeAnalytic(
      //     creative.data.seatBid?.[0]?.bid?.[0]?.id || '',
      //     dataAdSlot,
      //     publisherId,
      //     'IMPRESSION',
      //     domain,
      //     apiKey,
      //     creative.data.id,
      //     isTestEnvironment
      //   );
      // }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Ad load failed');
      setError(error);
      onAdLoadError?.(error);
      console.error('Ad load failed:', error);
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
   * Handles ad click and sends click analytics
   */
  const handleClick = useCallback(async () => {
    if (adData && adData.seatBid.length > 0) {
      const bidId = adData.seatBid[0]?.bid[0]?.id;
      if (!bidId) return;

      try {
        await Adgeist.sendCreativeAnalytic(
          bidId,
          dataAdSlot,
          publisherId,
          'CLICK',
          domain,
          apiKey,
          adData.id,
          isTestEnvironment
        );
        await Linking.openURL(creativeData.ctaUrl);
      } catch (err) {
        console.error('Failed to handle ad click:', err);
      }
    }
  }, [
    adData,
    dataAdSlot,
    publisherId,
    domain,
    apiKey,
    isTestEnvironment,
    creativeData,
  ]);

  useEffect(() => {
    fetchAd();
  }, [fetchAd]);

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
        style={[
          styles.adContainer,
          !isResponsive && { width: width, height: height },
        ]}
      >
        {dataSlotType === 'banner' ? (
          <Image
            style={styles.creative}
            source={{ uri: creativeData.creativeUrl }}
            accessibilityLabel="Ad Creative"
            resizeMode="contain"
            onError={(e) =>
              console.error('Image load error:', e.nativeEvent.error)
            }
          />
        ) : (
          <View style={styles.videoCreative}>
            <Video
              source={{ uri: creativeData.creativeUrl }}
              resizeMode="contain"
              style={{ width: '100%', height: '100%' }}
              repeat={true}
              muted={isMuted}
              onError={(e) => console.error('Video load error:', e)}
            />

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
              {creativeData?.creativeBrandName || 'Brand Name'}
            </Text>
          </View>
          <TouchableWithoutFeedback onPress={handleClick}>
            <Image
              style={styles.linkButton}
              source={{
                uri: 'https://d2cfeg6k9cklz9.cloudfront.net/onboarding-icons/Button.png',
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
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  contentContainer: {
    width: '80%',
  },
  title: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    color: '#4A4A4A',
    fontSize: 16,
    marginBottom: 4,
  },
  brandName: {
    color: '#6B7280',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  linkButton: {
    width: 40,
    height: 40,
  },
});
