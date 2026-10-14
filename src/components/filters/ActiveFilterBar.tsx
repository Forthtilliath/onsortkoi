import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ActiveFilter } from '../../domain/activeFilters';
import { Chip } from '../../ui/Chip';
import { colors, spacing } from '../../ui/theme';

type Props = {
  active: ActiveFilter[];
  onRemove: (filter: ActiveFilter) => void;
  onClearAll: () => void;
  resultCount: number;
};

/** Nombre de résultats et critères actifs (une puce par famille), retirables d'un tap. */
export function ActiveFilterBar({ active, onRemove, onClearAll, resultCount }: Props) {
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
          <Pressable onPress={onClearAll} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.clear}>Tout effacer</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  clear: { color: colors.primary, fontSize: 13, fontWeight: '600' },
});
