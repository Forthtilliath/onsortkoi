import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '../ui/Icon';
import { PrimaryButton } from '../ui/PrimaryButton';
import { colors, radius, spacing } from '../ui/theme';

const STEPS = [
  'Sur myludo.fr : Mon compte → Exporter, au format JSON.',
  'Copie le fichier sur ce téléphone.',
  'Importe-le ici : tout reste sur ton téléphone.',
];

type Props = {
  onImport: () => void;
  onRestore: () => void;
  busy: boolean;
};

export function EmptyState({ onImport, onRestore, busy }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Icon name="library-outline" size={40} color={colors.primary} />
        </View>
        <Text style={styles.title}>Ta ludothèque, dans ta poche</Text>
        <Text style={styles.text}>
          Importe ta collection MyLudo pour retrouver en un instant le jeu adapté à la soirée.
        </Text>
      </View>

      <View style={styles.steps}>
        {STEPS.map((step, index) => (
          <View key={step} style={styles.step}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <PrimaryButton
        label={busy ? 'Import en cours…' : 'Importer un export MyLudo'}
        icon="cloud-download-outline"
        onPress={onImport}
        disabled={busy}
      />
      <PrimaryButton
        label="Restaurer une sauvegarde Drive"
        icon="refresh-outline"
        onPress={onRestore}
        disabled={busy}
        outline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.sm },
  badge: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center' },
  text: { fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 21 },
  steps: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
  },
  stepText: { flex: 1, fontSize: 15, color: colors.text, lineHeight: 22 },
});
