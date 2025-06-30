import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import Adgeist from '../NativeAdgeist';
import { useAdgeistContext } from './AdgeistProvider';

interface AdData {
  id: string;
  bidId: string;
  cur: string;
  seatBid: SeatBid[];
}

interface SeatBid {
  bidId: string;
  bid: Bid[];
}

interface Bid {
  id: string;
  impId: string;
  price: number;
  ext: BidExtension;
}

interface BidExtension {
  creativeUrl: string;
  ctaUrl: string;
  creativeTitle: string;
  creativeDescription: string;
  creativeBrandName?: string;
}
interface AdBannerTypes {
  dataAdSlot: string;
  width: number;
  height: number;
}

export const BannerAd: React.FC<AdBannerTypes> = ({ dataAdSlot }) => {
  const [adData, setAdData] = useState<AdData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { publisherId, apiKey, domain, isTestEnvironment } =
    useAdgeistContext();

  const creativeData = adData?.seatBid?.[0]?.bid?.[0]?.ext as BidExtension;

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response: Object = await Adgeist.fetchCreative(
          apiKey,
          domain,
          dataAdSlot,
          publisherId,
          isTestEnvironment
        );

        const creative: { data: AdData } = response as { data: AdData };
        setAdData(creative.data);
        setIsLoading(false);

        if (creative.data.seatBid.length > 0) {
          await Adgeist.sendCreativeAnalytic(
            creative.data.seatBid?.[0]?.bid?.[0]?.id || '',
            dataAdSlot,
            publisherId,
            'IMPRESSION',
            domain,
            apiKey,
            creative.data.id,
            isTestEnvironment
          );
        }
      } catch (error) {
        console.error('Ad load failed:', error);
      }
    })();
  }, [publisherId, dataAdSlot, apiKey, domain, isTestEnvironment]);

  const handleClick = async () => {
    if (adData && adData?.seatBid.length > 0) {
      await Adgeist.sendCreativeAnalytic(
        adData?.seatBid?.[0]?.bid?.[0]?.id || '',
        dataAdSlot,
        publisherId,
        'CLICK',
        domain,
        apiKey,
        adData.id,
        isTestEnvironment
      );
      Linking.openURL(creativeData.ctaUrl).catch((err) =>
        console.error('Failed to open URL:', err)
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingOverlayContainer}>
        <ActivityIndicator size="large" color="#63AA75" />
      </View>
    );
  }

  if (!creativeData?.creativeUrl) return null;

  return (
    <TouchableWithoutFeedback accessible accessibilityLabel="Ad Banner">
      <View style={styles.adContainer}>
        <Image
          style={[styles.creative, { width: '100%', height: 300 }]}
          source={{ uri: creativeData.creativeUrl }}
        />
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
          <TouchableWithoutFeedback
            onPress={() => {
              handleClick();
            }}
            accessible
            accessibilityLabel="Visit Site Button"
          >
            <Image
              style={[styles.linkButton]}
              source={{
                uri: 'https://d2cfeg6k9cklz9.cloudfront.net/onboarding-icons/Button.png',
              }}
            />
          </TouchableWithoutFeedback>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    width: Dimensions.get('window').width,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  loadingOverlayContainer: {
    width: '100%',
    height: 375,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creative: {
    resizeMode: 'cover',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  adContent: {
    width: '100%',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  contentContainer: {
    width: Dimensions.get('window').width - 100,
  },
  title: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    color: 'black',
    fontSize: 16,
  },
  brandName: {
    color: 'black',
    fontSize: 16,
    opacity: 0.6,
    marginTop: 5,
    fontWeight: 'semibold',
  },
  linkButton: {
    width: 40,
    height: 40,
  },
});
