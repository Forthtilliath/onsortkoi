import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from './src/components/EmptyState';
import { FilterPanel } from './src/components/FilterPanel';
import { GameCard } from './src/components/GameCard';
import { TagPicker } from './src/components/TagPicker';
import { applyFilters, EMPTY_FILTERS, type Filters } from './src/domain/filters';
import { colors, spacing } from './src/ui/theme';
import { useCollection } from './src/useCollection';

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');

function Main() {
  const { collection, loading, importing, runImport } = useCollection();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [tagsOpen, setTagsOpen] = useState(false);

  const games = collection?.games;
  const results = useMemo(() => (games ? applyFilters(games, filters) : []), [games, filters]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>LudoCollec</Text>
          {collection && (
            <Text style={styles.meta}>
              {collection.games.length} jeux · importés le {formatDate(collection.importedAt)}
            </Text>
          )}
        </View>
        {collection && (
          <Pressable onPress={runImport} disabled={importing} accessibilityRole="button" hitSlop={8}>
            <Text style={[styles.importLink, importing && styles.disabled]}>
              {importing ? 'Import…' : 'Réimporter'}
            </Text>
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
                filters={filters}
                onChange={setFilters}
                onOpenTags={() => setTagsOpen(true)}
                resultCount={results.length}
              />
            }
            ListEmptyComponent={<Text style={styles.noResult}>Aucun jeu ne correspond à ces critères.</Text>}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />
          <TagPicker
            visible={tagsOpen}
            games={collection.games}
            selected={filters.tags}
            onChange={(tags) => setFilters((f) => ({ ...f, tags }))}
            onClose={() => setTagsOpen(false)}
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
  meta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  importLink: { fontSize: 15, fontWeight: '600', color: colors.primary },
  disabled: { opacity: 0.5 },
  loader: { marginTop: spacing.xl },
  list: { paddingBottom: spacing.xl },
  noResult: { textAlign: 'center', color: colors.muted, marginTop: spacing.xl, paddingHorizontal: spacing.lg },
});
