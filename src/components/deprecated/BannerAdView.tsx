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
import Adgeist from '../../specs/NativeAdgeist';
import { useAdgeistContext } from '../../providers/AdgeistProvider';
import { normalizeUrl } from '../../utilities';
import type { FIXEDADRESPONSE } from '../../types/FixedAdResponse';
import type { CPMADRESPONSE } from '../../types/CPMAdResponse';

interface AdBannerProps {
  dataAdSlot: string;
  dataSlotType?: 'banner' | 'video';
  dataBuyType?: 'FIXED' | 'CPM';
  width?: number;
  height?: number;
  isResponsive?: boolean;
  responsiveType?: 'SQUARE' | 'VERTICAL' | 'WIDE';
  onAdLoadError?: (error: Error) => void;
  onAdLoadSuccess?: (adData: FIXEDADRESPONSE | CPMADRESPONSE) => void;
}

export const BannerAd: React.FC<AdBannerProps> = ({
  dataAdSlot,
  dataSlotType = 'banner',
  dataBuyType = 'FIXED',
  width = 0,
  height = 0,
  isResponsive = false,
  onAdLoadError,
  onAdLoadSuccess,
}) => {
  const [adData, setAdData] = useState<FIXEDADRESPONSE | CPMADRESPONSE | null>(
    null
  );
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasImpression, setHasImpression] = useState<boolean>(false);
  const [hasView, setHasView] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [isManuallyControlled, setIsManuallyControlled] =
    useState<boolean>(false);
  const renderStartTime = useRef(Date.now());
  const adRef = useRef<View>(null);
  const visibilityStartTime = useRef<number | null>(null);
  const timeToVisible = useRef<number | null>(null);
  const viewTime = useRef<number>(0);
  const lastCheckTime = useRef<number>(Date.now());
  const currentVisibilityRatio = useRef<number>(0);
  const videoRef = useRef<any>(null);

  const { isInitialized, isTestEnvironment } = useAdgeistContext();

  let creativeBrandName;
  let creativeUrl;
  let creativeTitle;
  let creativeDescription;
  let ctaUrl;
  let bidMeta = '';

  let bidId;
  let campaignId;
  let adSpaceId = dataAdSlot;

  if (dataBuyType === 'FIXED') {
    creativeTitle = (adData as FIXEDADRESPONSE)?.creatives?.[0]?.title;
    creativeDescription = (adData as FIXEDADRESPONSE)?.creatives?.[0]
      ?.description;
    creativeBrandName = (adData as FIXEDADRESPONSE)?.advertiser?.name;
    creativeUrl = (adData as FIXEDADRESPONSE)?.creatives?.[0]?.fileUrl;
    ctaUrl = (adData as FIXEDADRESPONSE)?.creatives?.[0]?.ctaUrl;
    bidMeta = (adData as FIXEDADRESPONSE)?.metaData;

    bidId = (adData as FIXEDADRESPONSE)?.id;
    campaignId = (adData as FIXEDADRESPONSE)?.campaignId;
  } else {
    let creativeData = (adData as CPMADRESPONSE)?.seatBid?.[0]?.bid?.[0]?.ext;

    creativeTitle = creativeData?.creativeTitle;
    creativeDescription = creativeData?.creativeDescription;
    creativeBrandName = creativeData?.creativeBrandName;
    creativeUrl = creativeData?.creativeUrl;
    ctaUrl = creativeData?.ctaUrl;

    bidId = adData?.id;
    campaignId = (adData as CPMADRESPONSE)?.seatBid?.[0]?.bid?.[0]?.id;
  }

  const fetchAd = useCallback(async () => {
    if (!isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);
      setHasImpression(false);
      setHasView(false);

      const response = await Adgeist.fetchCreative(
        dataAdSlot,
        dataBuyType,
        isTestEnvironment
      );

      const creative: { data: FIXEDADRESPONSE | CPMADRESPONSE } = response as {
        data: FIXEDADRESPONSE | CPMADRESPONSE;
      };
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
    dataBuyType,
    dataAdSlot,
    isTestEnvironment,
    onAdLoadError,
    onAdLoadSuccess,
  ]);

  const trackImpressionOnMediaLoad = useCallback(async () => {
    if (hasImpression || !bidId || !campaignId) return;

    try {
      const renderTime = Date.now() - renderStartTime.current;

      await Adgeist.trackImpression(
        campaignId,
        adSpaceId,
        bidId,
        bidMeta,
        dataBuyType,
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
    dataBuyType,
    bidMeta,
    isTestEnvironment,
  ]);

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
          bidId,
          bidMeta,
          dataBuyType,
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
    dataBuyType,
    bidMeta,
    isTestEnvironment,
    dataSlotType,
  ]);

  const togglePlayPause = useCallback(() => {
    setIsManuallyControlled(true);
    setIsPaused((prev) => !prev);
  }, []);

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
        if (dataSlotType === 'video' && isPaused && !isManuallyControlled) {
          setIsPaused(false);
        }
      } else {
        visibilityStartTime.current = null;
        if (dataSlotType === 'video' && !isPaused) {
          setIsPaused(true);
          setIsManuallyControlled(false);
        }
      }

      if (
        !hasView &&
        viewTime.current >= (dataSlotType === 'video' ? 2000 : 1000) &&
        visibilityRatio >= 0.5
      ) {
        trackView();
      }
    });
  }, [
    hasImpression,
    trackView,
    dataSlotType,
    isPaused,
    hasView,
    isManuallyControlled,
  ]);

  const handleClick = useCallback(async () => {
    if (
      !adData ||
      (dataBuyType == 'CPM' && !(adData as CPMADRESPONSE).seatBid.length) ||
      !bidId ||
      !campaignId
    )
      return;

    try {
      Adgeist.trackClick(
        campaignId,
        adSpaceId,
        bidId,
        bidMeta,
        dataBuyType,
        isTestEnvironment
      );

      await Linking.openURL(normalizeUrl(ctaUrl as string));
    } catch (err) {
      console.error('Failed to handle ad click:', err);
    }
  }, [
    adData,
    bidId,
    campaignId,
    adSpaceId,
    bidMeta,
    dataBuyType,
    isTestEnvironment,
    ctaUrl,
  ]);

  useEffect(() => {
    renderStartTime.current = Date.now();
    lastCheckTime.current = Date.now();
    fetchAd();
  }, [fetchAd]);

  useEffect(() => {
    if (!hasImpression) return;

    if (dataSlotType === 'banner' && hasView) return;

    const intervalId = setInterval(checkVisibility, 200);

    return () => {
      clearInterval(intervalId);
    };
  }, [hasImpression, checkVisibility, dataSlotType, hasView]);

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

  if (creativeUrl || error) return null;

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
              source={{ uri: creativeUrl }}
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
                source={{ uri: creativeUrl }}
                resizeMode="contain"
                style={{ width: '100%', height: '100%' }}
                repeat={true}
                muted={isMuted}
                paused={isPaused}
                onLoad={trackImpressionOnMediaLoad}
                onError={() => {
                  setError(new Error('Failed to load ad video'));
                }}
              />
            </TouchableWithoutFeedback>
            <View style={styles.videoControls}>
              <TouchableWithoutFeedback onPress={togglePlayPause}>
                <Image
                  style={styles.playPauseIcon}
                  source={{
                    uri: isPaused
                      ? 'https://d2cfeg6k9cklz9.cloudfront.net/ad-icons/Play.png'
                      : 'https://d2cfeg6k9cklz9.cloudfront.net/ad-icons/Pause.png',
                  }}
                  accessibilityLabel={
                    isPaused ? 'Paused video' : 'Playing video'
                  }
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
          </View>
        )}

        <View style={styles.adContent}>
          <View style={styles.contentContainer}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {creativeTitle}
            </Text>
            <Text
              style={styles.description}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {creativeDescription}
            </Text>
            {creativeBrandName && (
              <Text
                style={styles.brandName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {creativeBrandName || 'The Brand Name'}
              </Text>
            )}
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
  videoControls: {},
  playPauseIcon: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    width: 30,
    height: 30,
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
