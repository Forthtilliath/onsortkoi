import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { colors, radius } from './theme';

type Props = {
  icon: IconName;
  label: string;
  onPress: () => void;
  /** Pastille de compteur en haut à droite ; masquée à 0. */
  badge?: number;
  /** Bouton plein (couleur principale) plutôt que discret. */
  filled?: boolean;
};

export function IconButton({ icon, label, onPress, badge = 0, filled = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label}, ${badge} actif${badge > 1 ? 's' : ''}` : label}
      hitSlop={6}
      style={({ pressed }) => [styles.button, filled && styles.filled, pressed && styles.pressed]}
    >
      <Icon name={icon} size={22} color={filled ? colors.onPrimary : colors.text} />
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const SIZE = 44;

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filled: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { opacity: 0.7 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.onPrimary, fontSize: 11, fontWeight: '700' },
});
