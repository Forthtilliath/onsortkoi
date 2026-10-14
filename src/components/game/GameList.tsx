import { type ReactElement, type Ref, useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { listRows, type ListRow } from '../../domain/listing';
import type { Game } from '../../domain/types';
import { spacing, themedStyles } from '../../ui/theme';
import { GameCard } from './GameCard';

type Props = {
  games: Game[];
  /** En-têtes par lettre, collés en haut pendant le défilement (tri par titre). */
  withLetters: boolean;
  onOpenGame: (game: Game) => void;
  /** Affiché quand aucun jeu ne correspond. */
  empty: ReactElement;
  /** Place laissée sous la liste pour le bouton flottant. */
  bottomSpace: number;
  listRef: Ref<FlatList<ListRow>>;
};

const keyOf = (row: ListRow) => (row.kind === 'letter' ? `letter-${row.letter}` : String(row.game.id));

export function GameList({ games, withLetters, onOpenGame, empty, bottomSpace, listRef }: Props) {
  const styles = useStyles();
  const { bottom } = useSafeAreaInsets();
  const { rows, stickyIndices } = useMemo(() => listRows(games, withLetters), [games, withLetters]);

  return (
    <FlatList
      ref={listRef}
      data={rows}
      keyExtractor={keyOf}
      renderItem={({ item }) =>
        item.kind === 'letter' ? (
          <View style={styles.letterRow}>
            <Text style={styles.letter} accessibilityRole="header">
              {item.letter}
            </Text>
          </View>
        ) : (
          <GameCard game={item.game} onPress={onOpenGame} />
        )
      }
      stickyHeaderIndices={stickyIndices}
      ListEmptyComponent={empty}
      contentContainerStyle={{ paddingTop: spacing.xs, paddingBottom: bottom + spacing.xl + bottomSpace }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      initialNumToRender={12}
      windowSize={11}
    />
  );
}

const useStyles = themedStyles((c) => ({
  letterRow: {
    backgroundColor: c.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  letter: { fontSize: 13, fontWeight: '800', color: c.primary, letterSpacing: 0.6 },
}));
