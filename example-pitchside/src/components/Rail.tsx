import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import type { IContentItem } from '../types/content';
import { ContentCard } from './ContentCard';

const CARD_WIDTH = 240;

type RailProps = { title: string; items: IContentItem[] };

export function Rail({ title, items }: RailProps) {
  return (
    <View style={styles.rail}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ContentCard item={item} width={CARD_WIDTH} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { marginTop: spacing.xl },
  title: { color: colors.text, fontSize: 17, fontWeight: '800', marginHorizontal: spacing.lg, marginBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg },
});
