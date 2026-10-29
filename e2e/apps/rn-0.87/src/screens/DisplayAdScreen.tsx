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

const KIND = 'display';
const BOX_WIDTH = 300;
const BOX_HEIGHT = 250;

export default function DisplayAdScreen() {
  const ad = adFor(KIND);
  const { events, onAdEvent, clear, codes, adRendered, clickHandled, unexpected } = useAdEvents();

  return (
    <View testID={`${KIND}-screen`} style={shared.screen}>
      <ScrollView contentContainerStyle={shared.content}>
        <InfoCard
          title="Display Ad"
          body={`The box below is a fixed ${BOX_WIDTH} x ${BOX_HEIGHT}, centred in the content. For a responsive ad unit the parent supplies both axes.`}
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
            <AdSlot kind={KIND} ad={ad} slotStyle={styles.box} onAdEvent={onAdEvent} />
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
  box: {
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    alignSelf: 'center',
    marginBottom: 12,
    backgroundColor: colors.slot,
  },
});
