import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { adFor, adNumber } from '../config';
import type { AdKind } from '../config';
import { sdkStatusText, useSdkStatus } from '../components/SdkStatus';
import { colors, shared } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type Entry = {
  kind: AdKind;
  route: Exclude<keyof RootStackParamList, 'Home'>;
  title: string;
  placement: string;
};

const ENTRIES: Entry[] = [
  {
    kind: 'companion',
    route: 'CompanionAd',
    title: 'Companion Ad',
    placement: 'Full width x 360, inline in the content',
  },
  {
    kind: 'banner',
    route: 'BannerAd',
    title: 'Banner Ad',
    placement: 'Full width, pinned to the bottom of the screen',
  },
  {
    kind: 'display',
    route: 'DisplayAd',
    title: 'Display Ad',
    placement: '300 x 250 box, centred in the content',
  },
];

export default function HomeScreen({ navigation }: Props) {
  const sdk = useSdkStatus();

  return (
    <View testID="e2e-root" style={shared.screen}>
      <ScrollView contentContainerStyle={shared.content}>
        <View style={shared.card}>
          <Text style={shared.title}>Adgeist E2E</Text>
          <Text style={shared.body}>
            Each screen renders one ad unit the way a publisher would integrate it. Open a screen
            to load its ad and watch the SDK callbacks.
          </Text>
          <Text
            testID="status-init"
            style={[styles.status, sdk.status === 'error' ? styles.bad : styles.ok]}
          >
            {sdkStatusText(sdk)}
          </Text>
        </View>

        {ENTRIES.map((entry) => {
          const configured = adFor(entry.kind) !== undefined;
          return (
            <Pressable
              key={entry.route}
              testID={`open-${entry.kind}`}
              style={({ pressed }) => [shared.card, pressed && styles.pressed]}
              onPress={() => navigation.push(entry.route)}
            >
              <Text style={styles.entryTitle}>{entry.title}</Text>
              <Text style={styles.placement}>{entry.placement}</Text>

              <View style={styles.meta}>
                <View style={styles.metaColumn}>
                  <Text style={styles.metaLabel}>Ad Unit</Text>
                  <Text style={styles.metaValue}>Ad {adNumber(entry.kind)}</Text>
                </View>
                <View style={styles.metaColumn}>
                  <Text style={styles.metaLabel}>Configured</Text>
                  <Text style={[styles.metaValue, !configured && styles.bad]}>
                    {configured ? 'Yes' : 'No'}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginTop: 12,
  },
  ok: {
    color: colors.accent,
  },
  bad: {
    color: colors.danger,
  },
  pressed: {
    opacity: 0.7,
  },
  entryTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: 'bold',
  },
  placement: {
    color: colors.textSubtle,
    fontSize: 14,
    fontFamily: 'monospace',
    marginTop: 6,
  },
  meta: {
    flexDirection: 'row',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  metaColumn: {
    flex: 1,
  },
  metaLabel: {
    color: colors.textSubtle,
    fontSize: 13,
    marginBottom: 6,
  },
  metaValue: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});
