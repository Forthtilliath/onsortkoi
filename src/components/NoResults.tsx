import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '../ui/Icon';
import { PrimaryButton } from '../ui/PrimaryButton';
import { colors, spacing } from '../ui/theme';

export function NoResults({ onReset }: { onReset: () => void }) {
  return (
    <View style={styles.container}>
      <Icon name="dice-outline" size={40} color={colors.border} />
      <Text style={styles.title}>Aucun jeu ne correspond</Text>
      <Text style={styles.text}>Essaie d’assouplir un critère ou de vider la recherche.</Text>
      <PrimaryButton label="Tout effacer" onPress={onReset} outline />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingTop: spacing.xl * 2 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  text: { fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: spacing.sm },
});
