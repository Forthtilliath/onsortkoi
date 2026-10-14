import { Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../ui/Icon';
import { radius, spacing, themedStyles, useColors } from '../ui/theme';

/** Hauteur du bouton, pour laisser la place sous la liste et au-dessus des toasts. */
export const RANDOM_BUTTON_SPACE = 56 + spacing.lg;

type Props = { count: number; onPress: () => void };

/** Bouton flottant « Au hasard » : tire un jeu parmi ceux affichés. */
export function RandomButton({ count, onPress }: Props) {
  const c = useColors();
  const styles = useStyles();
  const { bottom } = useSafeAreaInsets();
  if (count === 0) return null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Tirer un jeu au sort"
      accessibilityHint={`Choisit un jeu au hasard parmi les ${count} affichés`}
      style={({ pressed }) => [styles.button, { bottom: bottom + spacing.lg }, pressed && styles.pressed]}
    >
      <Icon name="dice" size={22} color={c.onPrimary} />
      <Text style={styles.label} maxFontSizeMultiplier={1.4}>
        Au hasard
      </Text>
    </Pressable>
  );
}

const useStyles = themedStyles((c) => ({
  button: {
    position: 'absolute',
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.lg + 2,
    borderRadius: radius.pill,
    backgroundColor: c.primary,
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  pressed: { opacity: 0.85 },
  label: { color: c.onPrimary, fontSize: 16, fontWeight: '700' },
}));
