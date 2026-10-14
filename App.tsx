import { useAutoBackup } from '@forthtilliath/expo-backup-ui';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from './src/components/AppHeader';
import { EmptyState } from './src/components/EmptyState';
import { ActiveFilterBar } from './src/components/filters/ActiveFilterBar';
import { FilterSheet } from './src/components/filters/FilterSheet';
import { SearchBar } from './src/components/filters/SearchBar';
import { GameCard } from './src/components/game/GameCard';
import { GameSheet } from './src/components/game/GameSheet';
import { NoResults } from './src/components/NoResults';
import { SettingsScreen } from './src/components/SettingsScreen';
import { UpdateBanner } from './src/components/UpdateBanner';
import { clearCriteria } from './src/domain/activeFilters';
import { filtersForTag, isStandalone } from './src/domain/filters';
import type { Settings } from './src/domain/settings';
import type { Game, TagGroup } from './src/domain/types';
import { colors, spacing } from './src/ui/theme';
import { backup, setBackupAppliedListener } from './src/backupManager';
import { useCollection } from './src/useCollection';
import { useFirstImport } from './src/useFirstImport';
import { useGameFilters } from './src/useGameFilters';
import { useSettings } from './src/useSettings';

type Panel = 'filters' | 'game' | 'settings' | null;

function Main() {
  const { collection, loading, importing, runImport, importGames, replaceCollection } = useCollection();
  const { settings, updateSettings } = useSettings();
  const games = collection?.games;
  const { filters, setFilters, results, criteria, tagOptions, pruneFor } = useGameFilters(games, settings);
  const [panel, setPanel] = useState<Panel>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const { bottom } = useSafeAreaInsets();

  const baseGameCount = useMemo(() => (games ? games.filter(isStandalone).length : null), [games]);

  const openGame = useCallback((game: Game) => {
    setSelectedGame(game);
    setPanel('game');
  }, []);
  const close = () => setPanel(null);

  const listRef = useRef<FlatList<Game>>(null);
  const showTag = (group: TagGroup, tag: string) => {
    setFilters(filtersForTag(filters, group, tag));
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    close();
  };

  const changeSettings = (next: Settings) => {
    updateSettings(next);
    pruneFor(next);
  };

  useAutoBackup(backup);
  // Après une restauration (fichier, Drive ou annulation) : la mémoire suit le stockage.
  useEffect(() => {
    setBackupAppliedListener(({ collection: restored, settings: restoredSettings }) => {
      replaceCollection(restored);
      changeSettings(restoredSettings);
    });
    return () => setBackupAppliedListener(null);
  });
  const firstImport = useFirstImport(importGames);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <AppHeader gameCount={baseGameCount} onOpenSettings={() => setPanel('settings')} />
      <UpdateBanner />

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : !collection ? (
        <EmptyState
          onImport={firstImport.importFile}
          onRestoreDrive={firstImport.restoreFromDrive}
          busy={firstImport.busy}
        />
      ) : (
        <>
          <View style={styles.controls}>
            <View style={styles.search}>
              <SearchBar
                query={filters.query}
                onChangeQuery={(query) => setFilters({ ...filters, query })}
                activeCount={criteria.length}
                onOpenFilters={() => setPanel('filters')}
              />
            </View>
            <ActiveFilterBar
              active={criteria}
              onRemove={(criterion) => setFilters(criterion.clear(filters))}
              onClearAll={() => setFilters(clearCriteria(filters))}
              resultCount={results.length}
            />
          </View>

          <FlatList
            ref={listRef}
            data={results}
            keyExtractor={(game) => String(game.id)}
            renderItem={({ item }) => <GameCard game={item} onPress={openGame} />}
            ListEmptyComponent={<NoResults onReset={() => setFilters({ ...clearCriteria(filters), query: '' })} />}
            contentContainerStyle={{ paddingTop: spacing.xs, paddingBottom: bottom + spacing.xl }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />

          <FilterSheet
            visible={panel === 'filters'}
            onClose={close}
            filters={filters}
            onChange={setFilters}
            tagOptions={tagOptions}
            resultCount={results.length}
            onOpenSettings={() => setPanel('settings')}
          />
          <GameSheet game={selectedGame} visible={panel === 'game'} onClose={close} onSelectTag={showTag} />
          <SettingsScreen
            visible={panel === 'settings'}
            settings={settings}
            onChange={changeSettings}
            collection={collection}
            onReimport={runImport}
            importing={importing}
            onClose={close}
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
  loader: { marginTop: spacing.xl },
  controls: { gap: spacing.sm, paddingBottom: spacing.sm },
  search: { paddingHorizontal: spacing.lg },
});
