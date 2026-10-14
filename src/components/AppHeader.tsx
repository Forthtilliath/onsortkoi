import { Text, View } from 'react-native';

import { IconButton } from '../ui/IconButton';
import { spacing, themedStyles } from '../ui/theme';

type Props = {
  /** Nombre de jeux de base ; `null` sans collection importée. */
  gameCount: number | null;
  onOpenSettings: () => void;
};

export function AppHeader({ gameCount, onOpenSettings }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.header}>
      <View style={styles.titles}>
        <Text style={styles.title} accessibilityRole="header">
          Onsortkoi
        </Text>
        {gameCount !== null && (
          <Text style={styles.subtitle}>
            {gameCount} jeu{gameCount > 1 ? 'x' : ''} dans ta ludothèque
          </Text>
        )}
      </View>
      {gameCount !== null && <IconButton icon="settings-outline" label="Réglages" onPress={onOpenSettings} />}
    </View>
  );
}

const useStyles = themedStyles((c) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  titles: { flex: 1 },
  title: { fontSize: 26, fontWeight: '800', color: c.primary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: c.muted },
}));
