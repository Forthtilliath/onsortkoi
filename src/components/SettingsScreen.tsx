import { BackupScreen } from '@forthtilliath/expo-backup-ui';
import { SwitchRow } from '@forthtilliath/react-native-kit/components/settings/SwitchRow';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { backup } from '../backupManager';
import { collectTags } from '../domain/filters';
import type { Settings } from '../domain/settings';
import type { Game } from '../domain/types';
import type { StoredCollection } from '../storage';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { backupScreenStyles, switchColors } from '../ui/kitStyles';
import { PrimaryButton } from '../ui/PrimaryButton';
import { Section } from '../ui/Section';
import { colors, radius, spacing } from '../ui/theme';
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

export function SettingsScreen({
  visible,
  settings,
  onChange,
  collection,
  onReimport,
  importing,
  onClose,
}: Props) {
  const [editing, setEditing] = useState<ChoiceGroup | null>(null);
  const games: Game[] = collection.games;

  const tagsByGroup = useMemo(
    () => ({ mechanisms: collectTags(games, 'mechanisms'), themes: collectTags(games, 'themes') }),
    [games],
  );
  const editedChoice = CHOICES.find((c) => c.key === editing);

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
                colors={switchColors}
                styles={{ label: styles.switchLabel, description: styles.hint }}
              />
              {CHOICES.map(({ key, label }) => {
                const count = settings[key].length;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setEditing(key)}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.row, styles.separator, pressed && styles.pressed]}
                  >
                    <Text style={styles.rowLabel}>{label}</Text>
                    <Text style={styles.rowValue}>{count ? `${count} choisi${count > 1 ? 's' : ''}` : 'Aucun'}</Text>
                    <Icon name="chevron-forward" size={18} color={colors.muted} />
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>
              Coche les mécanismes et thèmes qui t’intéressent : ils apparaîtront dans le panneau des filtres.
            </Text>
          </Section>

          <Section title="Collection">
            <View style={[styles.card, styles.padded]}>
              <Text style={styles.rowLabel}>
                {games.length} jeux et extensions · importés le {formatDate(collection.importedAt)}
              </Text>
              <PrimaryButton
                label={importing ? 'Import en cours…' : 'Réimporter un export MyLudo'}
                icon="cloud-download-outline"
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
              styles={backupScreenStyles}
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
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  content: { padding: spacing.lg, gap: spacing.xl },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  padded: { padding: spacing.lg, gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  separator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  pressed: { backgroundColor: colors.primarySoft },
  rowLabel: { fontSize: 15, color: colors.text, flex: 1 },
  switchLabel: { fontSize: 15, fontWeight: '400', color: colors.text },
  rowValue: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  hint: { fontSize: 13, color: colors.muted },
});
