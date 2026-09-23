import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Scenarios'>;

type ScenarioRoute =
  | 'VerticalRail'
  | 'BottomBanner'
  | 'FixedBox'
  | 'ScrollList';

const SCENARIOS: {
  route: ScenarioRoute;
  shape: string;
  layout: string;
  parentGives: string;
  publisherGives: string;
}[] = [
  {
    route: 'VerticalRail',
    shape: 'Vertical - Right Column',
    layout: 'Ad Width x Full Height',
    parentGives: 'Height',
    publisherGives: 'Width',
  },
  {
    route: 'BottomBanner',
    shape: 'Horizontal - Bottom Banner',
    layout: 'Full Width x Ad Height',
    parentGives: 'Width',
    publisherGives: 'Height',
  },
  {
    route: 'FixedBox',
    shape: 'Square / Normal',
    layout: 'Fixed x Fixed',
    parentGives: 'Both',
    publisherGives: 'Nothing',
  },
  {
    route: 'ScrollList',
    shape: 'Inside A ScrollView',
    layout: 'Full Width x Content Height',
    parentGives: 'Width',
    publisherGives: 'Height',
  },
];

export default function ScenariosScreen({ navigation }: Props) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Layout Scenarios</Text>
          <Text style={styles.body}>
            Each screen puts one ad in a different kind of slot, so you can
            check that the axis the parent supplies and the axis the publisher
            declares both land the way they should.
          </Text>
        </View>

        {SCENARIOS.map((scenario) => (
          <Pressable
            key={scenario.route}
            style={({ pressed }) => [
              styles.card,
              styles.item,
              pressed && styles.itemPressed,
            ]}
            onPress={() => navigation.push(scenario.route)}
          >
            <Text style={styles.shape}>{scenario.shape}</Text>
            <Text style={styles.layout}>{scenario.layout}</Text>

            <View style={styles.meta}>
              <View style={styles.metaColumn}>
                <Text style={styles.metaLabel}>Parent Gives</Text>
                <Text style={styles.metaValue}>{scenario.parentGives}</Text>
              </View>
              <View style={styles.metaColumn}>
                <Text style={styles.metaLabel}>Publisher Gives</Text>
                <Text style={styles.metaValue}>{scenario.publisherGives}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    padding: 10,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  body: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 23,
  },
  item: {
    marginBottom: 10,
  },
  itemPressed: {
    opacity: 0.7,
  },
  shape: {
    color: 'white',
    fontSize: 19,
    fontWeight: 'bold',
  },
  layout: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'monospace',
    marginTop: 6,
  },
  meta: {
    flexDirection: 'row',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  metaColumn: {
    flex: 1,
  },
  metaLabel: {
    color: '#999',
    fontSize: 13,
    marginBottom: 6,
  },
  metaValue: {
    color: '#63AA75',
    fontSize: 16,
    fontWeight: '600',
  },
});
