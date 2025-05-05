import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import Adgeist from '../NativeAdgeist';

interface Creative {
  fileUrl: string;
  title: string;
  description: string;
  ctaUrl?: string;
}

interface AdData {
  _id: string;
  creative: Creative;
}

interface AdBannerTypes {
  dataPublisherId: string;
  dataAdSlot: string;
  width: number;
  height: number;
}

export const BannerAd: React.FC<AdBannerTypes> = ({
  dataPublisherId,
  dataAdSlot,
  width,
  height,
}) => {
  const [adData, setAdData] = useState<AdData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response: Object = await Adgeist.fetchCreative(
          dataAdSlot,
          dataPublisherId
        );
        const creative: { data: AdData } = response as { data: AdData };
        setAdData(creative.data);

        await Adgeist.sendCreativeAnalytic(
          creative.data._id,
          dataAdSlot,
          dataPublisherId,
          'impression'
        );
      } catch (error) {
        console.error('Ad load failed:', error);
      }
    })();
  }, [dataPublisherId, dataAdSlot]);

  const handleClick = async () => {
    if (adData?.creative?.ctaUrl) {
      await Adgeist.sendCreativeAnalytic(
        adData._id,
        dataAdSlot,
        dataPublisherId,
        'click'
      );
      Linking.openURL(adData.creative.ctaUrl).catch((err) =>
        console.error('Failed to open URL:', err)
      );
    }
  };

  if (!adData?.creative?.fileUrl) return null;

  return (
    <TouchableWithoutFeedback accessible accessibilityLabel="Ad Banner">
      <View style={styles.container}>
        <Image
          style={[styles.creative, { width, height }]}
          source={{ uri: adData.creative.fileUrl }}
        />
        <View style={styles.options}>
          <Text style={styles.option}>x</Text>
          <Text style={styles.option}>i</Text>
        </View>
        <View style={styles.adContent}>
          <Image
            style={styles.logo}
            source={{ uri: adData.creative.fileUrl }}
          />
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.adBadge}>AD</Text>
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {adData.creative.title}
              </Text>
            </View>
            <Text
              style={styles.description}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {adData.creative.description}
            </Text>
          </View>
          <TouchableWithoutFeedback
            onPress={handleClick}
            accessible
            accessibilityLabel="Visit Site Button"
          >
            <View style={styles.button}>
              <Text style={styles.buttonText}>Visit Site</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
  },
  creative: {
    resizeMode: 'contain',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  options: {
    flexDirection: 'row',
    gap: 2,
    position: 'absolute',
    top: 5,
    left: 5,
  },
  option: {
    color: 'green',
    backgroundColor: '#00000022',
    width: 20,
    height: 20,
    textAlign: 'center',
  },
  adContent: {
    width: '100%',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopColor: '#00000022',
    borderTopWidth: 1,
  },
  logo: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
    borderRadius: 2,
  },
  textContainer: {
    width: Dimensions.get('window').width - 150,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: Dimensions.get('window').width - 200,
  },
  adBadge: {
    color: 'white',
    backgroundColor: 'green',
    width: 40,
    borderRadius: 4,
    textAlign: 'center',
  },
  title: {
    color: 'black',
  },
  description: {
    color: 'black',
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'green',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  buttonText: {
    color: 'green',
  },
});
