import { Pressable, StyleSheet, Text } from 'react-native';

import { Icon, type IconName } from './Icon';
import { colors, radius, spacing } from './theme';

type Props = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  /** Bouton contour plutôt que plein, pour une action secondaire. */
  outline?: boolean;
};

export function PrimaryButton({ label, onPress, icon, disabled = false, outline = false }: Props) {
  const color = outline ? colors.primary : colors.onPrimary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.button, outline && styles.outline, (pressed || disabled) && styles.pressed]}
    >
      {icon && <Icon name={icon} size={20} color={color} />}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  pressed: { opacity: 0.7 },
  label: { fontSize: 16, fontWeight: '700' },
});
