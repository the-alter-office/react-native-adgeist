import { ScrollView, StyleSheet, View } from 'react-native';
import { adFor } from '../config';
import { AdSlot } from '../components/AdSlot';
import { AdStatusPanel } from '../components/AdStatusPanel';
import { AdLogPanel } from '../components/AdLogPanel';
import { InfoCard } from '../components/InfoCard';
import { MissingAdCard } from '../components/MissingAdCard';
import { adCode } from '../components/adDescription';
import { useAdEvents } from '../components/useAdEvents';
import { colors, shared } from '../theme';

const KIND = 'companion';
const SLOT_HEIGHT = 360;

export default function CompanionAdScreen() {
  const ad = adFor(KIND);
  const { events, onAdEvent, clear, codes, adRendered, clickHandled, unexpected } = useAdEvents();

  return (
    <View testID={`${KIND}-screen`} style={shared.screen}>
      <ScrollView contentContainerStyle={shared.content}>
        <InfoCard
          title="Companion Ad"
          body={`A companion ad needs at least 320 x 320. The slot below is as wide as the screen and ${SLOT_HEIGHT} tall, inline with the content.`}
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
            <AdSlot kind={KIND} ad={ad} slotStyle={styles.slot} onAdEvent={onAdEvent} />
            <AdLogPanel events={events} onClear={clear} />
          </>
        ) : (
          <MissingAdCard kind={KIND} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: '100%',
    height: SLOT_HEIGHT,
    marginBottom: 12,
    backgroundColor: colors.slot,
  },
});
