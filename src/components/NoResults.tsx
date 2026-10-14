import { Text, View } from 'react-native';

import { Icon } from '../ui/Icon';
import { PrimaryButton } from '../ui/PrimaryButton';
import { spacing, themedStyles, useColors } from '../ui/theme';

export function NoResults({ onReset }: { onReset: () => void }) {
  const c = useColors();
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Icon name="dice-outline" size={40} color={c.muted} />
      <Text style={styles.title}>Aucun jeu ne correspond</Text>
      <Text style={styles.text}>Essaie d’assouplir un critère ou de vider la recherche.</Text>
      <PrimaryButton label="Tout effacer" onPress={onReset} outline />
    </View>
  );
}

const useStyles = themedStyles((c) => ({
  container: { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingTop: spacing.xl * 2 },
  title: { fontSize: 17, fontWeight: '700', color: c.text },
  text: { fontSize: 14, color: c.muted, textAlign: 'center', marginBottom: spacing.sm },
}));
