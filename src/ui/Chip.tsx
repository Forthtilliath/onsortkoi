import { Pressable, Text } from 'react-native';

import { Icon } from './Icon';
import { radius, spacing, themedStyles, useColors } from './theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  /** Affiche une croix : la puce sert à retirer un élément. */
  removable?: boolean;
};

export function Chip({ label, selected = false, onPress, removable = false }: Props) {
  const c = useColors();
  const styles = useStyles();
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
      {removable && <Icon name="close" size={14} color={selected ? c.onPrimary : c.muted} />}
    </Pressable>
  );
}

const useStyles = themedStyles((c) => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.card,
    maxWidth: '100%',
  },
  selected: { backgroundColor: c.primary, borderColor: c.primary },
  pressed: { opacity: 0.7 },
  label: { color: c.text, fontSize: 14, flexShrink: 1 },
  selectedLabel: { color: c.onPrimary, fontWeight: '600' },
}));
