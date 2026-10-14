import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { normalize, type TagCount } from '../domain/filters';
import { colors, radius, spacing } from '../ui/theme';

type Props = {
  visible: boolean;
  title: string;
  tags: TagCount[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onClose: () => void;
};

/** Liste à cocher plein écran, avec recherche et nombre de jeux par tag. */
export function TagChecklist({ visible, title, tags, selected, onChange, onClose }: Props) {
  const [query, setQuery] = useState('');

  const visibleTags = useMemo(() => {
    const q = normalize(query);
    return q ? tags.filter((t) => normalize(t.name).includes(q)) : tags;
  }, [tags, query]);

  const toggle = (tag: string) =>
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" hitSlop={12}>
            <Text style={styles.done}>Terminé</Text>
          </Pressable>
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
        <View style={styles.toolbar}>
          <Text style={styles.hint}>
            {selected.length} coché{selected.length > 1 ? 's' : ''} sur {tags.length}
          </Text>
          {selected.length > 0 && (
            <Pressable onPress={() => onChange([])} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.clear}>Tout décocher</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          data={visibleTags}
          keyExtractor={(item) => item.name}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const checked = selected.includes(item.name);
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
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  hint: { color: colors.muted, fontSize: 12 },
  clear: { color: colors.primary, fontSize: 13, fontWeight: '600' },
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
