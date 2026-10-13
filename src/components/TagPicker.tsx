import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { collectTags, normalize, type Filters } from '../domain/filters';
import { TAG_GROUPS, type Game, type TagGroup } from '../domain/types';
import { Chip } from '../ui/Chip';
import { colors, radius, spacing } from '../ui/theme';

type Props = {
  visible: boolean;
  games: Game[];
  selected: Filters['tags'];
  onChange: (tags: Filters['tags']) => void;
  onClose: () => void;
};

export function TagPicker({ visible, games, selected, onChange, onClose }: Props) {
  const [group, setGroup] = useState<TagGroup>('categories');
  const [query, setQuery] = useState('');

  const tags = useMemo(() => collectTags(games, group), [games, group]);
  const visibleTags = useMemo(() => {
    const q = normalize(query);
    return q ? tags.filter((t) => normalize(t.name).includes(q)) : tags;
  }, [tags, query]);

  const toggle = (tag: string) => {
    const current = selected[group];
    const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    onChange({ ...selected, [group]: next });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Affiner par…</Text>
          <Pressable onPress={onClose} accessibilityRole="button" hitSlop={12}>
            <Text style={styles.done}>Terminé</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {TAG_GROUPS.map(({ key, label }) => {
            const count = selected[key].length;
            return (
              <Chip
                key={key}
                label={count ? `${label} (${count})` : label}
                selected={group === key}
                onPress={() => setGroup(key)}
              />
            );
          })}
        </View>

        <TextInput
          style={styles.search}
          placeholder="Filtrer la liste…"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          maxLength={100}
        />
        <Text style={styles.hint}>Plusieurs choix dans un même onglet : au moins un doit correspondre.</Text>

        <FlatList
          data={visibleTags}
          keyExtractor={(item) => item.name}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const checked = selected[group].includes(item.name);
            return (
              <Pressable
                onPress={() => toggle(item.name)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              >
                <Text style={[styles.box, checked && styles.boxChecked]}>{checked ? '✓' : ''}</Text>
                <Text style={styles.itemLabel}>{item.name}</Text>
                <Text style={styles.itemCount}>{item.count}</Text>
              </Pressable>
            );
          }}
          ListEmptyComponent={<Text style={styles.hint}>Aucun résultat.</Text>}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  done: { fontSize: 16, fontWeight: '700', color: colors.primary },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
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
  hint: { color: colors.muted, fontSize: 12, marginVertical: spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.6 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    textAlign: 'center',
    color: colors.onPrimary,
    fontWeight: '700',
    lineHeight: 19,
  },
  boxChecked: { backgroundColor: colors.primary },
  itemLabel: { flex: 1, fontSize: 15, color: colors.text },
  itemCount: { fontSize: 13, color: colors.muted },
});
