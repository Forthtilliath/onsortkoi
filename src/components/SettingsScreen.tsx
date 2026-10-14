import { BackupScreen } from '@forthtilliath/expo-backup-ui';
import { compareVersions } from '@forthtilliath/expo-release-updates/compareVersions';
import { SwitchRow } from '@forthtilliath/react-native-kit/components/settings/SwitchRow';
import { UpdateSettingsScreen } from '@forthtilliath/react-native-kit/components/settings/UpdateSettingsScreen';
import { useThemePreference } from '@forthtilliath/react-native-kit/components/theme/themePreferenceContext';
import { ThemeToggle } from '@forthtilliath/react-native-kit/components/theme/ThemeToggle';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { backup } from '../backupManager';
import { collectTags } from '../domain/filters';
import type { Settings } from '../domain/settings';
import type { StoredCollection } from '../storage';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { useKitStyles } from '../ui/kitStyles';
import { PrimaryButton } from '../ui/PrimaryButton';
import { Section } from '../ui/Section';
import { radius, spacing, themedStyles, useColors } from '../ui/theme';
import { ToastHost } from '../ui/Toast';
import { checkForUpdate, currentVersion, fetchHistory, installApk } from '../updates';
import { TagChecklist } from './TagChecklist';

type ChoiceGroup = 'mechanisms' | 'themes';

const CHOICES: { key: ChoiceGroup; label: string; title: string }[] = [
  { key: 'mechanisms', label: 'Mécanismes proposés', title: 'Mécanismes' },
  { key: 'themes', label: 'Thèmes proposés', title: 'Thèmes' },
];

type Props = {
  visible: boolean;
  settings: Settings;
  onChange: (settings: Settings) => void;
  collection: StoredCollection;
  onReimport: () => void;
  importing: boolean;
  onClose: () => void;
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');

export function SettingsScreen({ visible, settings, onChange, collection, onReimport, importing, onClose }: Props) {
  const c = useColors();
  const styles = useStyles();
  const kit = useKitStyles();
  const theme = useThemePreference();
  const [editing, setEditing] = useState<ChoiceGroup | null>(null);
  const { games } = collection;

  const tagsByGroup = useMemo(
    () => ({ mechanisms: collectTags(games, 'mechanisms'), themes: collectTags(games, 'themes') }),
    [games],
  );
  const editedChoice = CHOICES.find((choice) => choice.key === editing);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            Réglages
          </Text>
          <IconButton icon="close" label="Fermer les réglages" onPress={onClose} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Section title="Filtres proposés">
            <View style={styles.card}>
              <SwitchRow
                label="Catégories"
                description="Toutes les catégories de ta collection"
                value={settings.showCategories}
                onChange={(showCategories) => onChange({ ...settings, showCategories })}
                colors={kit.switchColors}
                styles={{ label: styles.switchLabel, description: styles.hint }}
              />
              {CHOICES.map(({ key, label }) => {
                const count = settings[key].length;
                const value = count ? `${count} choisi${count > 1 ? 's' : ''}` : 'Aucun';
                return (
                  <Pressable
                    key={key}
                    onPress={() => setEditing(key)}
                    accessibilityRole="button"
                    accessibilityLabel={`${label} : ${value}`}
                    style={({ pressed }) => [styles.row, styles.separator, pressed && styles.pressed]}
                  >
                    <Text style={styles.rowLabel}>{label}</Text>
                    <Text style={styles.rowValue}>{value}</Text>
                    <Icon name="chevron-forward" size={18} color={c.muted} />
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>
              Coche les mécanismes et thèmes qui t’intéressent : ils apparaîtront dans le panneau des filtres.
            </Text>
          </Section>

          <Section title="Apparence">
            <ThemeToggle value={theme.preference} onChange={theme.setPreference} styles={kit.themeToggle} />
          </Section>

          <Section title="Collection">
            <View style={[styles.card, styles.padded]}>
              <Text style={styles.rowLabel}>
                {games.length} jeux et extensions · importés le {formatDate(collection.importedAt)}
              </Text>
              <PrimaryButton
                label={importing ? 'Import en cours…' : 'Réimporter un export MyLudo'}
                icon="document-outline"
                onPress={onReimport}
                disabled={importing}
                outline
              />
            </View>
          </Section>

          <Section title="Sauvegarde">
            <BackupScreen
              manager={backup}
              describeBackup={(data) => `${data.collection.games.length} jeux`}
              styles={kit.backup}
            />
          </Section>

          <Section title="Mises à jour">
            <UpdateSettingsScreen
              currentVersion={currentVersion}
              checkForUpdate={checkForUpdate}
              compareVersions={compareVersions}
              downloadAndInstallApk={installApk}
              fetchReleaseHistory={fetchHistory}
              styles={kit.updateScreen}
            />
          </Section>
        </ScrollView>

        {editedChoice && (
          <TagChecklist
            visible
            title={editedChoice.title}
            tags={tagsByGroup[editedChoice.key]}
            selected={settings[editedChoice.key]}
            onChange={(selected) => onChange({ ...settings, [editedChoice.key]: selected })}
            onClose={() => setEditing(null)}
          />
        )}
        <ToastHost />
      </SafeAreaView>
    </Modal>
  );
}

const useStyles = themedStyles((c) => ({
  screen: { flex: 1, backgroundColor: c.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { fontSize: 24, fontWeight: '800', color: c.text },
  content: { padding: spacing.lg, gap: spacing.xl },
  card: {
    backgroundColor: c.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    overflow: 'hidden',
  },
  padded: { padding: spacing.lg, gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  separator: { borderTopWidth: 1, borderTopColor: c.border },
  pressed: { backgroundColor: c.primarySoft },
  rowLabel: { fontSize: 15, color: c.text, flex: 1 },
  switchLabel: { fontSize: 15, fontWeight: '400', color: c.text },
  rowValue: { fontSize: 14, color: c.primary, fontWeight: '600' },
  hint: { fontSize: 13, color: c.muted },
}));
