import { SwitchRow } from '@forthtilliath/react-native-kit/components/settings/SwitchRow';
import { Pressable, StyleSheet, Text } from 'react-native';

import { clearCriteria, describeActiveFilters } from '../../domain/activeFilters';
import { DURATION_BUCKETS, type DurationKey } from '../../domain/durations';
import type { Filters } from '../../domain/filters';
import { ChoiceGrid, type ChoiceOption } from '../../ui/ChoiceGrid';
import { switchColors, switchStyles } from '../../ui/kitStyles';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Section } from '../../ui/Section';
import { Sheet } from '../../ui/Sheet';
import { colors } from '../../ui/theme';
import { type TagOption, TagFilterRows } from './TagFilterRows';

const PLAYER_OPTIONS: ChoiceOption<number>[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
  value: n,
  label: n === 10 ? '10+' : String(n),
}));
const DURATION_OPTIONS: ChoiceOption<DurationKey>[] = DURATION_BUCKETS.map(({ key, label, hint }) => ({
  value: key,
  label,
  hint,
}));
const AGE_OPTIONS: ChoiceOption<number>[] = [4, 6, 8, 10, 12, 14].map((age) => ({
  value: age,
  label: String(age),
  hint: 'ans',
}));

const ANY = 'Peu importe';

type Props = {
  visible: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (filters: Filters) => void;
  /** Groupes de tags proposés comme filtres (selon les réglages) ; les groupes vides sont omis. */
  tagOptions: TagOption[];
  resultCount: number;
  onOpenSettings: () => void;
};

export function FilterSheet({ visible, onClose, filters, onChange, tagOptions, resultCount, onOpenSettings }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });
  /** Choix unique : un second tap sur la valeur active la désélectionne. */
  const pick = (key: 'players' | 'youngestAge', value: number) => set(key, filters[key] === value ? null : value);
  const toggleDuration = (key: DurationKey) =>
    set('durations', filters.durations.includes(key) ? filters.durations.filter((d) => d !== key) : [...filters.durations, key]);

  const { players, youngestAge, durations } = filters;
  const hasCriteria = describeActiveFilters(filters).length > 0;
  const offersMoreTags = tagOptions.some((o) => o.group !== 'categories');

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Filtres"
      action={hasCriteria ? { label: 'Réinitialiser', onPress: () => onChange(clearCriteria(filters)) } : undefined}
    >
      <Section title="Nombre de joueurs" aside={players === null ? ANY : `${players} joueur${players > 1 ? 's' : ''}`}>
        <ChoiceGrid
          label="Nombre de joueurs"
          options={PLAYER_OPTIONS}
          selected={players === null ? [] : [players]}
          onToggle={(n) => pick('players', n)}
          columns={5}
        />
      </Section>

      <Section title="Durée de partie" aside={durations.length ? undefined : ANY}>
        <ChoiceGrid
          label="Durée de partie"
          options={DURATION_OPTIONS}
          selected={durations}
          onToggle={toggleDuration}
          columns={2}
          multiple
        />
      </Section>

      <Section title="Âge du plus jeune joueur" aside={youngestAge === null ? ANY : `Dès ${youngestAge} ans`}>
        <ChoiceGrid
          label="Âge du plus jeune joueur"
          options={AGE_OPTIONS}
          selected={youngestAge === null ? [] : [youngestAge]}
          onToggle={(age) => pick('youngestAge', age)}
          columns={6}
        />
      </Section>

      {tagOptions.length > 0 && (
        <Section title="Genre de jeu">
          <TagFilterRows
            options={tagOptions}
            selected={filters.tags}
            onChange={(group, selected) => set('tags', { ...filters.tags, [group]: selected })}
          />
        </Section>
      )}
      {!offersMoreTags && (
        <Pressable onPress={onOpenSettings} accessibilityRole="button">
          <Text style={styles.hint}>
            Envie de filtrer par mécanisme ou par thème ? Choisis-les dans{' '}
            <Text style={styles.link}>les réglages</Text>.
          </Text>
        </Pressable>
      )}

      <SwitchRow
        label="Extensions et accessoires"
        description="Les afficher avec les jeux de base"
        value={filters.includeExpansions}
        onChange={(v) => set('includeExpansions', v)}
        colors={switchColors}
        styles={switchStyles}
      />

      <PrimaryButton
        label={resultCount ? `Voir ${resultCount} jeu${resultCount > 1 ? 'x' : ''}` : 'Aucun jeu ne correspond'}
        onPress={onClose}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  link: { color: colors.primary, fontWeight: '600' },
});
