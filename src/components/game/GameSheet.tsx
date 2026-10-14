import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Game, TagGroup } from '../../domain/types';
import { Icon } from '../../ui/Icon';
import { Section } from '../../ui/Section';
import { Sheet } from '../../ui/Sheet';
import { colors, radius, spacing } from '../../ui/theme';
import { gameFacts, gameSubtitle } from './gameLabels';

type Props = {
  /** Gardé pendant l'animation de fermeture pour que le contenu ne disparaisse pas. */
  game: Game | null;
  visible: boolean;
  onClose: () => void;
  /** Affiche tous les jeux portant ce tag. */
  onSelectTag: (group: TagGroup, tag: string) => void;
};

type TagsProps = { title: string; group: TagGroup; tags: string[]; onSelect: Props['onSelectTag'] };

function Tags({ title, group, tags, onSelect }: TagsProps) {
  if (tags.length === 0) return null;
  return (
    <Section title={title}>
      <View style={styles.tags}>
        {tags.map((tag) => (
          <Pressable
            key={tag}
            onPress={() => onSelect(group, tag)}
            accessibilityRole="button"
            accessibilityHint="Affiche tous les jeux de la collection avec ce tag"
            style={({ pressed }) => [styles.tag, pressed && styles.pressed]}
          >
            <Text style={styles.tagLabel}>{tag}</Text>
          </Pressable>
        ))}
      </View>
    </Section>
  );
}

/** Fiche détaillée d'un jeu. */
export function GameSheet({ game, visible, onClose, onSelectTag }: Props) {
  if (!game) return null;

  const facts = gameFacts(game);
  const credits = [
    game.authors.length > 0 && `Par ${game.authors.join(', ')}`,
    game.year !== null && `Édition ${game.year}`,
  ].filter(Boolean);

  return (
    <Sheet visible={visible} onClose={onClose} title={game.title} subtitle={gameSubtitle(game) || undefined}>
      {facts.length > 0 && (
        <View style={styles.facts}>
          {facts.map((fact) => (
            <View key={fact.key} style={styles.fact}>
              <Icon name={fact.icon} size={20} color={colors.primary} />
              <Text style={styles.factValue}>{fact.value}</Text>
              <Text style={styles.factLabel}>{fact.label}</Text>
            </View>
          ))}
        </View>
      )}

      {(game.rating !== null || game.averageRating !== null) && (
        <View style={styles.ratings}>
          {game.rating !== null && (
            <View style={styles.rating}>
              <Icon name="star" size={16} color={colors.star} />
              <Text style={styles.ratingText}>
                <Text style={styles.strong}>{game.rating}</Text>/10 · ma note
              </Text>
            </View>
          )}
          {game.averageRating !== null && (
            <Text style={styles.ratingText}>
              <Text style={styles.strong}>{game.averageRating}</Text>/10 · moyenne MyLudo
            </Text>
          )}
        </View>
      )}

      <Tags title="Catégories" group="categories" tags={game.categories} onSelect={onSelectTag} />
      <Tags title="Mécanismes" group="mechanisms" tags={game.mechanisms} onSelect={onSelectTag} />
      <Tags title="Thèmes" group="themes" tags={game.themes} onSelect={onSelectTag} />

      {credits.length > 0 && <Text style={styles.credits}>{credits.join(' · ')}</Text>}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  facts: { flexDirection: 'row', gap: spacing.sm },
  fact: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  factValue: { fontSize: 17, fontWeight: '800', color: colors.text },
  factLabel: { fontSize: 12, color: colors.muted },
  ratings: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.lg, rowGap: spacing.xs },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, color: colors.muted },
  strong: { fontWeight: '800', color: colors.text },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  pressed: { opacity: 0.6 },
  tagLabel: { fontSize: 13, color: colors.primary },
  credits: { fontSize: 13, color: colors.muted, lineHeight: 19 },
});
