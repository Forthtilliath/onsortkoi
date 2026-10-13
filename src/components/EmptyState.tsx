import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../ui/theme';

export function EmptyState({ onImport, busy }: { onImport: () => void; busy: boolean }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aucune collection</Text>
      <Text style={styles.text}>Pour récupérer ta ludothèque :</Text>
      <Text style={styles.step}>1. Sur myludo.fr : Mon compte → Exporter, au format JSON.</Text>
      <Text style={styles.step}>2. Copie le fichier sur ce téléphone.</Text>
      <Text style={styles.step}>3. Importe-le ici.</Text>
      <Pressable
        onPress={onImport}
        disabled={busy}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, (pressed || busy) && styles.pressed]}
      >
        <Text style={styles.buttonText}>{busy ? 'Import en cours…' : 'Importer un export MyLudo'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  text: { fontSize: 15, color: colors.text },
  step: { fontSize: 15, color: colors.muted, lineHeight: 22 },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
  buttonText: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
});
