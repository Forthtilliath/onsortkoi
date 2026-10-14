import { Pressable, StyleSheet, Text } from 'react-native';

import { Icon } from './Icon';
import { colors, radius, spacing } from './theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  /** Affiche une croix : la puce sert à retirer un élément. */
  removable?: boolean;
};

export function Chip({ label, selected = false, onPress, removable = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={removable ? `Retirer ${label}` : label}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]} numberOfLines={1}>
        {label}
      </Text>
      {removable && <Icon name="close" size={14} color={selected ? colors.onPrimary : colors.muted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    maxWidth: '100%',
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { opacity: 0.7 },
  label: { color: colors.text, fontSize: 14, flexShrink: 1 },
  selectedLabel: { color: colors.onPrimary, fontWeight: '600' },
});
