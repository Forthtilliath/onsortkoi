import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '../../ui/Icon';
import { IconButton } from '../../ui/IconButton';
import { colors, radius, spacing } from '../../ui/theme';

type Props = {
  query: string;
  onChangeQuery: (query: string) => void;
  activeCount: number;
  onOpenFilters: () => void;
};

/** Recherche par titre et accès au sheet des filtres. */
export function SearchBar({ query, onChangeQuery, activeCount, onOpenFilters }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Icon name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.input}
          placeholder="Rechercher un jeu…"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={onChangeQuery}
          autoCorrect={false}
          returnKeyType="search"
          maxLength={100}
          accessibilityLabel="Rechercher un jeu par son titre"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => onChangeQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Effacer la recherche"
            hitSlop={10}
          >
            <Icon name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>
      <IconButton
        icon="options-outline"
        label="Filtres"
        onPress={onOpenFilters}
        badge={activeCount}
        filled={activeCount > 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  input: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 0 },
});
