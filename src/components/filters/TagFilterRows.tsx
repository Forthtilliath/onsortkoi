import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TagCount } from '../../domain/filters';
import type { TagGroup } from '../../domain/types';
import { Icon } from '../../ui/Icon';
import { colors, radius, spacing } from '../../ui/theme';
import { TagChecklist } from '../TagChecklist';

export type TagOption = { group: TagGroup; label: string; tags: TagCount[] };

type Props = {
  options: TagOption[];
  selected: Record<TagGroup, string[]>;
  onChange: (group: TagGroup, selected: string[]) => void;
};

/** Une ligne par groupe de tags, résumant la sélection ; un tap ouvre la liste à cocher. */
export function TagFilterRows({ options, selected, onChange }: Props) {
  const [editing, setEditing] = useState<TagGroup | null>(null);
  const edited = options.find((o) => o.group === editing);

  return (
    <View style={styles.card}>
      {options.map(({ group, label }, index) => {
        const chosen = selected[group];
        return (
          <Pressable
            key={group}
            onPress={() => setEditing(group)}
            accessibilityRole="button"
            accessibilityLabel={`${label} : ${chosen.length ? chosen.join(', ') : 'tous'}`}
            style={({ pressed }) => [styles.row, index > 0 && styles.separator, pressed && styles.pressed]}
          >
            <View style={styles.texts}>
              <Text style={styles.label}>{label}</Text>
              <Text style={[styles.summary, chosen.length > 0 && styles.summaryActive]} numberOfLines={1}>
                {chosen.length ? chosen.join(', ') : 'Tous'}
              </Text>
            </View>
            {chosen.length > 0 && (
              <View style={styles.count}>
                <Text style={styles.countText}>{chosen.length}</Text>
              </View>
            )}
            <Icon name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        );
      })}

      {edited && (
        <TagChecklist
          visible
          title={edited.label}
          tags={edited.tags}
          selected={selected[edited.group]}
          onChange={(next) => onChange(edited.group, next)}
          onClose={() => setEditing(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  separator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  pressed: { backgroundColor: colors.primarySoft },
  texts: { flex: 1, gap: 1 },
  label: { fontSize: 15, fontWeight: '600', color: colors.text },
  summary: { fontSize: 13, color: colors.muted },
  summaryActive: { color: colors.primary },
  count: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { color: colors.onPrimary, fontSize: 12, fontWeight: '700' },
});
