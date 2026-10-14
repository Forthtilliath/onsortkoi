import { Pressable, TextInput, View } from 'react-native';

import { Icon } from '../../ui/Icon';
import { IconButton } from '../../ui/IconButton';
import { radius, spacing, themedStyles, useColors } from '../../ui/theme';

type Props = {
  query: string;
  onChangeQuery: (query: string) => void;
  activeCount: number;
  onOpenFilters: () => void;
};

/** Recherche par titre ou auteur et accès au sheet des filtres. */
export function SearchBar({ query, onChangeQuery, activeCount, onOpenFilters }: Props) {
  const c = useColors();
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Icon name="search" size={18} color={c.muted} />
        <TextInput
          style={styles.input}
          placeholder="Rechercher un jeu, un auteur…"
          placeholderTextColor={c.muted}
          value={query}
          onChangeText={onChangeQuery}
          autoCorrect={false}
          returnKeyType="search"
          maxLength={100}
          accessibilityLabel="Rechercher un jeu par son titre ou son auteur"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => onChangeQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Effacer la recherche"
            hitSlop={10}
          >
            <Icon name="close-circle" size={18} color={c.muted} />
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

const useStyles = themedStyles((c) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  // Hauteur minimale (et non fixe) : le champ grandit avec la taille de police du téléphone.
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.control,
    backgroundColor: c.card,
  },
  input: { flex: 1, fontSize: 16, color: c.text, paddingVertical: spacing.sm },
}));
