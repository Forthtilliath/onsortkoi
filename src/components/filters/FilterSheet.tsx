import { SwitchRow } from '@forthtilliath/react-native-kit/components/settings/SwitchRow';
import { Pressable, Text } from 'react-native';

import { clearCriteria, describeActiveFilters } from '../../domain/activeFilters';
import { DURATION_BUCKETS, type DurationKey } from '../../domain/durations';
import { type Filters, PLAYERS_OR_MORE, playersLabel } from '../../domain/filters';
import { ChoiceGrid, type ChoiceOption } from '../../ui/ChoiceGrid';
import { useKitStyles } from '../../ui/kitStyles';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Section } from '../../ui/Section';
import { Sheet } from '../../ui/Sheet';
import { themedStyles } from '../../ui/theme';
import { type TagOption, TagFilterRows } from './TagFilterRows';

const PLAYER_OPTIONS: ChoiceOption<number>[] = Array.from({ length: PLAYERS_OR_MORE }, (_, i) => i + 1).map((n) => ({
  value: n,
  label: n === PLAYERS_OR_MORE ? `${n}+` : String(n),
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
  const styles = useStyles();
  const kit = useKitStyles();
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
      <Section title="Nombre de joueurs" aside={players === null ? ANY : playersLabel(players)}>
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
        colors={kit.switchColors}
        styles={kit.switchStyles}
      />

      <PrimaryButton
        label={resultCount ? `Voir ${resultCount} jeu${resultCount > 1 ? 'x' : ''}` : 'Aucun jeu ne correspond'}
        onPress={onClose}
      />
    </Sheet>
  );
}

const useStyles = themedStyles((c) => ({
  hint: { color: c.muted, fontSize: 13, lineHeight: 19 },
  link: { color: c.primary, fontWeight: '600' },
}));
