import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { adFor } from '../config';
import { AdSlot } from '../components/AdSlot';
import { AdStatusPanel } from '../components/AdStatusPanel';
import { AdLogPanel } from '../components/AdLogPanel';
import { InfoCard } from '../components/InfoCard';
import { MissingAdCard } from '../components/MissingAdCard';
import { adCode } from '../components/adDescription';
import { useAdEvents } from '../components/useAdEvents';
import { colors, shared } from '../theme';

const KIND = 'banner';
const DEFAULT_SLOT_HEIGHT = 50;

export default function BannerAdScreen() {
  const ad = adFor(KIND);
  const insets = useSafeAreaInsets();
  const { events, onAdEvent, clear, codes, adRendered, clickHandled, unexpected } = useAdEvents();

  const slotStyle = [
    styles.slot,
    ad?.adSize?.height === undefined && { height: DEFAULT_SLOT_HEIGHT },
  ];

  return (
    <View testID={`${KIND}-screen`} style={shared.screen}>
      <ScrollView style={shared.scroll} contentContainerStyle={shared.content}>
        <InfoCard
          title="Banner Ad"
          body="The banner pinned to the bottom is as wide as the screen. The publisher declares the height, the parent supplies the width."
          code={ad ? adCode(ad) : undefined}
        />

        {ad ? (
          <>
            <AdStatusPanel
              kind={KIND}
              codes={codes}
              adRendered={adRendered}
              clickHandled={clickHandled}
              unexpected={unexpected}
            />
            <AdLogPanel events={events} onClear={clear} />
          </>
        ) : (
          <MissingAdCard kind={KIND} />
        )}
      </ScrollView>

      {ad ? (
        <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
          <AdSlot kind={KIND} ad={ad} slotStyle={slotStyle} onAdEvent={onAdEvent} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.slot,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  slot: {
    width: '100%',
  },
});
