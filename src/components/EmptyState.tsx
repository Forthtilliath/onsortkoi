import { ScrollView, Text, View } from 'react-native';

import type { FirstImportTask } from '../useFirstImport';
import { Icon } from '../ui/Icon';
import { PrimaryButton } from '../ui/PrimaryButton';
import { radius, spacing, themedStyles, useColors } from '../ui/theme';

const STEPS = [
  'Sur myludo.fr : Mon compte → Exporter, au format JSON.',
  'Copie le fichier sur ce téléphone.',
  'Importe-le ici : tout reste sur ton téléphone.',
];

type Props = {
  /** Accepte un export MyLudo ou une sauvegarde Onsortkoi : le format est reconnu à la lecture. */
  onImport: () => void;
  /** Connecte un compte Google et récupère la sauvegarde automatique. */
  onRestoreDrive: () => void;
  /** Action en cours, le cas échéant : son bouton l'indique, les deux sont désactivés. */
  busy: FirstImportTask | null;
};

export function EmptyState({ onImport, onRestoreDrive, busy }: Props) {
  const c = useColors();
  const styles = useStyles();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Icon name="library-outline" size={40} color={c.primary} />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Ta ludothèque, dans ta poche
        </Text>
        <Text style={styles.text}>
          Importe ta collection MyLudo pour retrouver en un instant le jeu adapté à la soirée.
        </Text>
      </View>

      <View style={styles.steps}>
        {STEPS.map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText} maxFontSizeMultiplier={1.5}>
                {index + 1}
              </Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.action}>
        <PrimaryButton
          label={busy === 'file' ? 'Import en cours…' : 'Importer un fichier'}
          icon="document-outline"
          onPress={onImport}
          disabled={busy !== null}
        />
        <PrimaryButton
          label={busy === 'drive' ? 'Restauration en cours…' : 'Restaurer depuis Google Drive'}
          icon="cloud-download-outline"
          onPress={onRestoreDrive}
          disabled={busy !== null}
          outline
        />
        <Text style={styles.hint}>
          Tu utilisais déjà Onsortkoi avec la sauvegarde automatique ? Connecte le même compte Google.
        </Text>
      </View>
    </ScrollView>
  );
}

const useStyles = themedStyles((c) => ({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.sm },
  badge: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: c.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: 22, fontWeight: '800', color: c.text, textAlign: 'center' },
  text: { fontSize: 15, color: c.muted, textAlign: 'center', lineHeight: 21 },
  steps: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: c.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  // Taille minimale plutôt que fixe : la pastille grandit avec la taille de police du téléphone.
  stepNumber: {
    minWidth: 24,
    minHeight: 24,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: c.onPrimary, fontSize: 13, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 15, color: c.text, lineHeight: 22 },
  action: { gap: spacing.sm },
  hint: { fontSize: 13, color: c.muted, textAlign: 'center', lineHeight: 18 },
}));
