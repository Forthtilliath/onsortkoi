import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from './theme';

export type ChoiceOption<T> = { value: T; label: string; hint?: string };

type Props<T extends string | number> = {
  options: ChoiceOption<T>[];
  selected: readonly T[];
  /** Un tap sur une case cochée la décoche. */
  onToggle: (value: T) => void;
  columns: number;
  /** Lu par les lecteurs d'écran sur le groupe. */
  label: string;
  /** Plusieurs cases cochables (cases à cocher) plutôt qu'une seule (boutons radio). */
  multiple?: boolean;
};

/** Grille de cases de même taille : choix en un tap, sans défilement horizontal. */
export function ChoiceGrid<T extends string | number>({
  options,
  selected,
  onToggle,
  columns,
  label,
  multiple = false,
}: Props<T>) {
  const rows: ChoiceOption<T>[][] = [];
  for (let i = 0; i < options.length; i += columns) rows.push(options.slice(i, i + columns));

  return (
    <View style={styles.grid} accessibilityRole={multiple ? undefined : 'radiogroup'} accessibilityLabel={label}>
      {rows.map((row, index) => (
        <View key={index} style={styles.row}>
          {row.map((option) => {
            const checked = selected.includes(option.value);
            return (
              <Pressable
                key={String(option.value)}
                onPress={() => onToggle(option.value)}
                accessibilityRole={multiple ? 'checkbox' : 'radio'}
                accessibilityState={{ checked }}
                accessibilityLabel={option.hint ? `${option.label}, ${option.hint}` : option.label}
                style={({ pressed }) => [styles.tile, checked && styles.checked, pressed && styles.pressed]}
              >
                <Text style={[styles.label, checked && styles.checkedText]}>{option.label}</Text>
                {!!option.hint && <Text style={[styles.hint, checked && styles.checkedHint]}>{option.hint}</Text>}
              </Pressable>
            );
          })}
          {/* Cases vides pour garder la même largeur sur la dernière ligne. */}
          {Array.from({ length: columns - row.length }, (_, i) => (
            <View key={`empty-${i}`} style={styles.spacer} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: { flex: 1 },
  checked: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { opacity: 0.7 },
  label: { fontSize: 16, fontWeight: '700', color: colors.text },
  checkedText: { color: colors.onPrimary },
  hint: { fontSize: 12, color: colors.muted, marginTop: 1 },
  checkedHint: { color: colors.primarySoft },
});
