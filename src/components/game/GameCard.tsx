import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Game } from '../../domain/types';
import { Icon } from '../../ui/Icon';
import { colors, radius, spacing } from '../../ui/theme';
import { gameFacts, subtitleParts } from './gameLabels';
import { GameTile } from './GameTile';

type Props = { game: Game; onPress: (game: Game) => void };

function GameCardBase({ game, onPress }: Props) {
  const subtitle = subtitleParts(game);
  const facts = gameFacts(game);

  return (
    <Pressable
      onPress={() => onPress(game)}
      accessibilityRole="button"
      accessibilityHint="Ouvre la fiche du jeu"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <GameTile game={game} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.titleLine} numberOfLines={1}>
            <Text style={styles.title}>{game.title}</Text>
            {subtitle.map((part) => (
              <Text key={part} style={styles.subtitle}>
                {'  •  '}
                {part}
              </Text>
            ))}
          </Text>
          {game.rating !== null && (
            <View style={styles.rating} accessibilityLabel={`Ma note : ${game.rating} sur 10`}>
              <Icon name="star" size={13} color={colors.star} />
              <Text style={styles.ratingText}>{game.rating}</Text>
            </View>
          )}
        </View>
        <View style={styles.facts}>
          {facts.length === 0 && <Text style={styles.factText}>Infos non renseignées</Text>}
          {facts.map((fact) => (
            <View key={fact.key} style={styles.fact}>
              <Icon name={fact.icon} size={14} color={colors.muted} />
              <Text style={styles.factText}>
                {fact.value}
                {fact.key === 'age' ? ' ans' : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

export const GameCard = memo(GameCardBase);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    // Ombre douce plutôt qu'une bordure : les cartes se détachent du fond crème.
    elevation: 1,
    shadowColor: colors.text,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pressed: { opacity: 0.85 },
  body: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  titleLine: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 13, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted },
  facts: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: 2, marginTop: 2 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  factText: { fontSize: 13, color: colors.text },
});
