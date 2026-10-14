import { Pressable, Text, View } from 'react-native';

import type { ActiveFilter } from '../../domain/activeFilters';
import { SORT_OPTIONS, type SortKey } from '../../domain/listing';
import { Chip } from '../../ui/Chip';
import { Icon } from '../../ui/Icon';
import { spacing, themedStyles, useColors } from '../../ui/theme';

type Props = {
  active: ActiveFilter[];
  onRemove: (filter: ActiveFilter) => void;
  onClearAll: () => void;
  resultCount: number;
  sort: SortKey;
  onOpenSort: () => void;
};

/** Nombre de résultats, tri et critères actifs (une puce par famille), retirables d'un tap. */
export function ActiveFilterBar({ active, onRemove, onClearAll, resultCount, sort, onOpenSort }: Props) {
  const c = useColors();
  const styles = useStyles();
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? '';

  return (
    <View style={styles.bar}>
      {active.length > 0 && (
        <View style={styles.chips}>
          {active.map((filter) => (
            <Chip key={filter.key} label={filter.label} selected removable onPress={() => onRemove(filter)} />
          ))}
        </View>
      )}
      <View style={styles.summary}>
        <Text style={styles.count} accessibilityLiveRegion="polite">
          {resultCount} jeu{resultCount > 1 ? 'x' : ''}
        </Text>
        {active.length > 0 && (
          <Pressable onPress={onClearAll} accessibilityRole="button" hitSlop={8} style={styles.link}>
            <Text style={styles.linkText}>Tout effacer</Text>
          </Pressable>
        )}
        <Pressable
          onPress={onOpenSort}
          accessibilityRole="button"
          accessibilityLabel={`Trier, actuellement par ${sortLabel.toLowerCase()}`}
          hitSlop={8}
          style={[styles.link, styles.sort]}
        >
          <Icon name="swap-vertical" size={16} color={c.primary} />
          <Text style={styles.linkText}>{sortLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = themedStyles((c) => ({
  bar: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  count: { flex: 1, color: c.muted, fontSize: 13, fontWeight: '600' },
  link: { minHeight: 32, justifyContent: 'center' },
  sort: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkText: { color: c.primary, fontSize: 13, fontWeight: '600' },
}));
