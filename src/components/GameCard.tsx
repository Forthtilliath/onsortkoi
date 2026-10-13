import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatRange } from '../domain/fields';
import type { Game } from '../domain/types';
import { colors, radius, spacing } from '../ui/theme';

const TYPE_LABELS: Record<string, string> = {
  extension: 'Extension',
  standalone: 'Standalone',
  accessoire: 'Accessoire',
  goodie: 'Goodie',
};

function Detail({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <Text style={styles.detail}>
      <Text style={styles.detailLabel}>{label} : </Text>
      {values.join(', ')}
    </Text>
  );
}

function GameCardBase({ game }: { game: Game }) {
  const [open, setOpen] = useState(false);

  const players = formatRange(game.players);
  const facts = [
    players && `${players} joueur${game.players?.min === 1 && game.players.max === 1 ? '' : 's'}`,
    formatRange(game.duration, 'min'),
    game.age !== null && `${game.age}+ ans`,
  ].filter(Boolean);
  const typeLabel = TYPE_LABELS[game.type];

  return (
    <Pressable
      onPress={() => setOpen((o) => !o)}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.titleRow}>
        <Text style={styles.title}>{game.title}</Text>
        {game.rating !== null && <Text style={styles.rating}>★ {game.rating}</Text>}
      </View>
      {!!(game.subtitle || typeLabel) && (
        <Text style={styles.subtitle}>{[typeLabel, game.subtitle].filter(Boolean).join(' · ')}</Text>
      )}
      <Text style={styles.facts}>{facts.join('  ·  ') || 'Infos non renseignées'}</Text>
      {game.categories.length > 0 && <Text style={styles.categories}>{game.categories.join(', ')}</Text>}

      {open && (
        <View style={styles.details}>
          <Detail label="Thèmes" values={game.themes} />
          <Detail label="Mécanismes" values={game.mechanisms} />
          <Detail label="Auteurs" values={game.authors} />
          {game.year !== null && <Detail label="Édition" values={[String(game.year)]} />}
          {game.averageRating !== null && (
            <Detail label="Note moyenne MyLudo" values={[`${game.averageRating}/10`]} />
          )}
        </View>
      )}
    </Pressable>
  );
}

export const GameCard = memo(GameCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  pressed: { opacity: 0.85 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  rating: { fontSize: 14, fontWeight: '700', color: colors.primary },
  subtitle: { fontSize: 13, color: colors.muted },
  facts: { fontSize: 14, color: colors.text },
  categories: { fontSize: 13, color: colors.primary },
  details: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  detail: { fontSize: 13, color: colors.text, lineHeight: 18 },
  detailLabel: { fontWeight: '700' },
});
