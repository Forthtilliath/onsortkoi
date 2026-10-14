import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { countActiveFilters, EMPTY_FILTERS, type Filters } from '../domain/filters';
import type { TagGroup } from '../domain/types';
import { MultiChipRow } from '../ui/MultiChipRow';
import { OptionRow } from '../ui/OptionRow';
import { colors, radius, spacing } from '../ui/theme';

const PLAYER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 10];
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];
const AGE_OPTIONS = [4, 6, 8, 10, 12, 14];

const formatMinutes = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : `${minutes / 60} h`.replace('.5 h', ' h 30');

export type TagOption = { group: TagGroup; label: string; tags: string[] };

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  /** Groupes de tags proposés comme filtres (selon les réglages) ; les groupes vides sont omis. */
  tagOptions: TagOption[];
  onOpenSettings: () => void;
  resultCount: number;
};

export function FilterPanel({ filters, onChange, tagOptions, onOpenSettings, resultCount }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });

  // Garde min ≤ max : choisir une borne incompatible efface l'autre.
  const setDuration = (key: 'minDuration' | 'maxDuration', value: number | null) => {
    const other = key === 'minDuration' ? 'maxDuration' : 'minDuration';
    const otherValue = filters[other];
    const conflict =
      value !== null &&
      otherValue !== null &&
      (key === 'minDuration' ? value > otherValue : value < otherValue);
    onChange({ ...filters, [key]: value, ...(conflict && { [other]: null }) });
  };

  const activeCount = countActiveFilters(filters);

  return (
    <View style={styles.panel}>
      <TextInput
        style={styles.search}
        placeholder="Rechercher un titre…"
        placeholderTextColor={colors.muted}
        value={filters.query}
        onChangeText={(query) => set('query', query)}
        autoCorrect={false}
        clearButtonMode="while-editing"
        maxLength={100}
      />

      <OptionRow
        label="Nombre de joueurs"
        options={PLAYER_OPTIONS}
        value={filters.players}
        onChange={(v) => set('players', v)}
        format={String}
      />
      <OptionRow
        label="Durée minimum"
        options={DURATION_OPTIONS}
        value={filters.minDuration}
        onChange={(v) => setDuration('minDuration', v)}
        format={formatMinutes}
      />
      <OptionRow
        label="Durée maximum"
        options={DURATION_OPTIONS}
        value={filters.maxDuration}
        onChange={(v) => setDuration('maxDuration', v)}
        format={formatMinutes}
      />
      <OptionRow
        label="Âge du plus jeune joueur"
        options={AGE_OPTIONS}
        value={filters.youngestAge}
        onChange={(v) => set('youngestAge', v)}
        format={(age) => `${age} ans`}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Inclure extensions et accessoires</Text>
        <Switch
          value={filters.includeExpansions}
          onValueChange={(v) => set('includeExpansions', v)}
          trackColor={{ true: colors.primary }}
        />
      </View>

      {tagOptions.map(({ group, label, tags }) => (
        <MultiChipRow
          key={group}
          label={label}
          options={tags}
          selected={filters.tags[group]}
          onChange={(selected) => set('tags', { ...filters.tags, [group]: selected })}
        />
      ))}
      {!tagOptions.some((o) => o.group !== 'categories') && (
        <Pressable onPress={onOpenSettings} accessibilityRole="button">
          <Text style={styles.hint}>
            Astuce : choisis dans <Text style={styles.link}>Réglages</Text> les mécanismes et thèmes à proposer ici.
          </Text>
        </Pressable>
      )}

      <View style={styles.footer}>
        <Text style={styles.count}>
          {resultCount} jeu{resultCount > 1 ? 'x' : ''}
        </Text>
        {activeCount > 0 && (
          <Pressable onPress={() => onChange(EMPTY_FILTERS)} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.reset}>Réinitialiser ({activeCount})</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.sm },
  search: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { color: colors.text, fontSize: 14, flex: 1 },
  hint: { color: colors.muted, fontSize: 13 },
  link: { color: colors.primary, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.xs },
  count: { color: colors.text, fontSize: 15, fontWeight: '700' },
  reset: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
