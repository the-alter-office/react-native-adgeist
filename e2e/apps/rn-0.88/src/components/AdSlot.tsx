import { StyleSheet, View } from 'react-native';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';
import type { AdViewEvent } from '@thealteroffice/react-native-adgeist';
import type { AdConfig, AdKind } from '../config';

type Props = {
  kind: AdKind;
  ad: AdConfig;
  slotStyle: StyleProp<ViewStyle>;
  onAdEvent: (event: NativeSyntheticEvent<AdViewEvent>) => void;
};

export function isFixedSize(ad: AdConfig) {
  const width = ad.adSize?.width;
  const height = ad.adSize?.height;
  const hasBothAxes = width !== undefined && height !== undefined;
  return ad.adIsResponsive === undefined ? hasBothAxes : !ad.adIsResponsive && hasBothAxes;
}

export function AdSlot({ kind, ad, slotStyle, onAdEvent }: Props) {
  if (isFixedSize(ad)) {
    return (
      <View testID={`${kind}-ad-container`} style={styles.fixed}>
        <HTML5AdView
          adUnitID={ad.adUnitId}
          adSize={{ width: ad.adSize?.width, height: ad.adSize?.height }}
          onAdEvent={onAdEvent}
        />
      </View>
    );
  }

  return (
    <View testID={`${kind}-ad-container`} style={slotStyle}>
      <HTML5AdView adUnitID={ad.adUnitId} adIsResponsive adSize={ad.adSize} onAdEvent={onAdEvent} />
    </View>
  );
}

const styles = StyleSheet.create({
  fixed: {
    alignSelf: 'center',
    marginBottom: 12,
  },
});
