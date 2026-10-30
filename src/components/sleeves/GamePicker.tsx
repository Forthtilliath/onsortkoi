import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput } from 'react-native';

import { byTitle, normalize } from '../../domain/filters';
import type { Game } from '../../domain/types';
import { Icon } from '../../ui/Icon';
import { ScreenModal } from '../../ui/ScreenModal';
import { radius, spacing, themedStyles, useColors } from '../../ui/theme';
import { gameSubtitle } from '../game/gameLabels';

type Props = {
  visible: boolean;
  games: Game[];
  /** Jeux déjà associés, masqués de la liste. */
  exclude: Set<number>;
  onPick: (game: Game) => void;
  onClose: () => void;
};

/** Choix d'un jeu de la collection (extensions comprises), avec recherche par titre. */
export function GamePicker({ visible, games, exclude, onPick, onClose }: Props) {
  const c = useColors();
  const styles = useStyles();
  const [query, setQuery] = useState('');

  const choices = useMemo(() => {
    const q = normalize(query);
    return games
      .filter((g) => !exclude.has(g.id) && (!q || normalize(`${g.title} ${g.subtitle}`).includes(q)))
      .sort(byTitle);
  }, [games, exclude, query]);

  return (
    <ScreenModal visible={visible} onClose={onClose} title="Associer un jeu" scroll={false}>
      <TextInput
        style={styles.search}
        placeholder="Rechercher un jeu…"
        placeholderTextColor={c.muted}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        autoFocus
        maxLength={100}
        accessibilityLabel="Rechercher un jeu par son titre"
      />
      <FlatList
        data={choices}
        keyExtractor={(game) => String(game.id)}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const subtitle = gameSubtitle(item);
          return (
            <Pressable
              onPress={() => onPick(item)}
              accessibilityRole="button"
              accessibilityLabel={[item.title, subtitle].filter(Boolean).join(', ')}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <Text style={styles.title}>
                {item.title}
                {!!subtitle && <Text style={styles.subtitle}> · {subtitle}</Text>}
              </Text>
              <Icon name="add-circle-outline" size={22} color={c.primary} />
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Aucun jeu ne correspond.</Text>}
      />
    </ScreenModal>
  );
}

const useStyles = themedStyles((c) => ({
  search: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.control,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    color: c.text,
    marginBottom: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  pressed: { opacity: 0.6 },
  title: { flex: 1, fontSize: 15, color: c.text },
  subtitle: { fontSize: 13, color: c.muted },
  empty: { fontSize: 14, color: c.muted, paddingVertical: spacing.lg },
}));
