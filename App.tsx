import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from './src/components/EmptyState';
import { FilterPanel, type TagOption } from './src/components/FilterPanel';
import { GameCard } from './src/components/GameCard';
import { SettingsScreen } from './src/components/SettingsScreen';
import { applyFilters, collectTags, EMPTY_FILTERS, type Filters } from './src/domain/filters';
import { filterableTags, pruneFilterTags, type Settings } from './src/domain/settings';
import type { TagGroup } from './src/domain/types';
import { colors, spacing } from './src/ui/theme';
import { useCollection } from './src/useCollection';
import { useSettings } from './src/useSettings';

const FILTER_GROUPS: { group: TagGroup; label: string }[] = [
  { group: 'categories', label: 'Catégories' },
  { group: 'mechanisms', label: 'Mécanismes' },
  { group: 'themes', label: 'Thèmes' },
];

function Main() {
  const { collection, loading, importing, runImport } = useCollection();
  const { settings, updateSettings } = useSettings();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const games = collection?.games;
  const activeFilters = useMemo(() => pruneFilterTags(filters, settings), [filters, settings]);
  const results = useMemo(() => (games ? applyFilters(games, activeFilters) : []), [games, activeFilters]);

  const tagOptions = useMemo<TagOption[]>(() => {
    if (!games) return [];
    return FILTER_GROUPS.map(({ group, label }) => ({
      group,
      label,
      tags: filterableTags(settings, group, collectTags(games, group).map((t) => t.name)),
    })).filter((option) => option.tags.length > 0);
  }, [games, settings]);

  const changeSettings = (next: Settings) => {
    updateSettings(next);
    setFilters((f) => pruneFilterTags(f, next));
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>LudoCollec</Text>
        {collection && (
          <Pressable
            onPress={() => setSettingsOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Réglages"
            hitSlop={8}
          >
            <Text style={styles.headerLink}>Réglages</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : !collection ? (
        <EmptyState onImport={runImport} busy={importing} />
      ) : (
        <>
          <FlatList
            data={results}
            keyExtractor={(game) => String(game.id)}
            renderItem={({ item }) => <GameCard game={item} />}
            ListHeaderComponent={
              <FilterPanel
                filters={activeFilters}
                onChange={setFilters}
                tagOptions={tagOptions}
                onOpenSettings={() => setSettingsOpen(true)}
                resultCount={results.length}
              />
            }
            ListEmptyComponent={<Text style={styles.noResult}>Aucun jeu ne correspond à ces critères.</Text>}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />
          <SettingsScreen
            visible={settingsOpen}
            settings={settings}
            onChange={changeSettings}
            collection={collection}
            onReimport={runImport}
            importing={importing}
            onClose={() => setSettingsOpen(false)}
          />
        </>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Main />
    </SafeAreaProvider>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  appTitle: { fontSize: 22, fontWeight: '800', color: colors.primary },
  headerLink: { fontSize: 15, fontWeight: '600', color: colors.primary },
  loader: { marginTop: spacing.xl },
  list: { paddingBottom: spacing.xl },
  noResult: { textAlign: 'center', color: colors.muted, marginTop: spacing.xl, paddingHorizontal: spacing.lg },
});
