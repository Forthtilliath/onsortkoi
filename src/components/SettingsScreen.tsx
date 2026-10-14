import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { collectTags } from '../domain/filters';
import type { Settings } from '../domain/settings';
import type { Game } from '../domain/types';
import type { StoredCollection } from '../storage';
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

export function SettingsScreen({ visible, settings, onChange, collection, onReimport, importing, onClose }: Props) {
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
          <Text style={styles.title}>Réglages</Text>
          <Pressable onPress={onClose} accessibilityRole="button" hitSlop={12}>
            <Text style={styles.done}>Terminé</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.section}>Filtres affichés</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Filtre par catégorie</Text>
              <Switch
                value={settings.showCategories}
                onValueChange={(showCategories) => onChange({ ...settings, showCategories })}
                trackColor={{ true: colors.primary }}
              />
            </View>
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
                  <Text style={styles.rowValue}>{count ? `${count} choisi${count > 1 ? 's' : ''}` : 'Aucun'} ›</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hint}>
            Coche les mécanismes et thèmes qui t'intéressent : ils apparaîtront comme filtres sur l'écran principal.
          </Text>

          <Text style={styles.section}>Collection</Text>
          <View style={styles.card}>
            <Text style={styles.rowLabel}>
              {games.length} jeux · importés le {formatDate(collection.importedAt)}
            </Text>
            <Pressable
              onPress={onReimport}
              disabled={importing}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, (pressed || importing) && styles.pressed]}
            >
              <Text style={styles.buttonText}>{importing ? 'Import en cours…' : 'Réimporter un export MyLudo'}</Text>
            </Pressable>
          </View>
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
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  done: { fontSize: 16, fontWeight: '700', color: colors.primary },
  content: { padding: spacing.lg, gap: spacing.sm },
  section: { fontSize: 13, fontWeight: '700', color: colors.muted, marginTop: spacing.md, textTransform: 'uppercase' },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 },
  separator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  pressed: { opacity: 0.6 },
  rowLabel: { fontSize: 15, color: colors.text, flex: 1 },
  rowValue: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  hint: { fontSize: 12, color: colors.muted },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
});
