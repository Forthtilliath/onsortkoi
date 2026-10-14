import { useAutoBackup } from '@forthtilliath/expo-backup-ui';
import { ThemePreferenceProvider } from '@forthtilliath/react-native-kit/components/theme/ThemePreferenceProvider';
import { successFeedback } from '@forthtilliath/react-native-kit/utils/helpers/haptics';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, type FlatList, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from './src/components/AppHeader';
import { EmptyState } from './src/components/EmptyState';
import { ActiveFilterBar } from './src/components/filters/ActiveFilterBar';
import { FilterSheet } from './src/components/filters/FilterSheet';
import { SearchBar } from './src/components/filters/SearchBar';
import { SortSheet } from './src/components/filters/SortSheet';
import { GameList } from './src/components/game/GameList';
import { GameSheet } from './src/components/game/GameSheet';
import { NoResults } from './src/components/NoResults';
import { RANDOM_BUTTON_SPACE, RandomButton } from './src/components/RandomButton';
import { SettingsScreen } from './src/components/SettingsScreen';
import { UpdateBanner } from './src/components/UpdateBanner';
import { backup, setBackupAppliedListener } from './src/backupManager';
import { clearCriteria } from './src/domain/activeFilters';
import type { Backup } from './src/domain/backup';
import { filtersForTag, isStandalone } from './src/domain/filters';
import { type ListRow, pickRandom } from './src/domain/listing';
import type { Settings } from './src/domain/settings';
import type { Game, TagGroup } from './src/domain/types';
import { loadThemePreference, saveThemePreference } from './src/storage';
import { spacing, themedStyles, useColors } from './src/ui/theme';
import { ToastHost } from './src/ui/Toast';
import { useCollection } from './src/useCollection';
import { useFirstImport } from './src/useFirstImport';
import { useGameFilters } from './src/useGameFilters';
import { useSettings } from './src/useSettings';

type Panel = 'filters' | 'sort' | 'game' | 'settings' | null;

function Main() {
  const c = useColors();
  const styles = useStyles();
  const { collection, loading, importing, runImport, importGames, replaceCollection } = useCollection();
  const { settings, updateSettings } = useSettings();
  const games = collection?.games;
  const [panel, setPanel] = useState<Panel>(null);
  const { filters, setFilters, sort, setSort, results, criteria, tagOptions, pruneFor } = useGameFilters(
    games,
    settings,
    panel === 'filters',
  );
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  /** La fiche ouverte vient d'un tirage au sort (bouton « Relancer »). */
  const [drawn, setDrawn] = useState(false);

  // Fond natif (sous les modales, pendant le clavier) assorti au thème.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.background).catch(() => {});
  }, [c.background]);

  const baseGameCount = useMemo(() => (games ? games.filter(isStandalone).length : null), [games]);

  const openGame = useCallback((game: Game) => {
    setSelectedGame(game);
    setDrawn(false);
    setPanel('game');
  }, []);
  const close = () => setPanel(null);

  const draw = () => {
    const game = pickRandom(results, drawn ? selectedGame : null);
    if (!game) return;
    successFeedback();
    setSelectedGame(game);
    setDrawn(true);
    setPanel('game');
  };

  const listRef = useRef<FlatList<ListRow>>(null);
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
  const onBackupApplied = useEffectEvent(({ collection: restored, settings: restoredSettings }: Backup) => {
    replaceCollection(restored);
    changeSettings(restoredSettings);
  });
  useEffect(() => {
    setBackupAppliedListener((data) => onBackupApplied(data));
    return () => setBackupAppliedListener(null);
  }, []);
  const firstImport = useFirstImport(importGames);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <StatusBar style={c.scheme === 'dark' ? 'light' : 'dark'} />
      <AppHeader gameCount={baseGameCount} onOpenSettings={() => setPanel('settings')} />
      <UpdateBanner />

      {loading ? (
        <ActivityIndicator style={styles.loader} color={c.primary} />
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
              sort={sort}
              onOpenSort={() => setPanel('sort')}
            />
          </View>

          <GameList
            listRef={listRef}
            games={results}
            withLetters={sort === 'title'}
            onOpenGame={openGame}
            empty={<NoResults onReset={() => setFilters({ ...clearCriteria(filters), query: '' })} />}
            bottomSpace={RANDOM_BUTTON_SPACE}
          />
          <RandomButton count={results.length} onPress={draw} />

          <FilterSheet
            visible={panel === 'filters'}
            onClose={close}
            filters={filters}
            onChange={setFilters}
            tagOptions={tagOptions}
            resultCount={results.length}
            onOpenSettings={() => setPanel('settings')}
          />
          <SortSheet
            visible={panel === 'sort'}
            onClose={close}
            sort={sort}
            onChange={(next) => {
              setSort(next);
              listRef.current?.scrollToOffset({ offset: 0, animated: false });
            }}
          />
          <GameSheet
            game={selectedGame}
            visible={panel === 'game'}
            onClose={close}
            onSelectTag={showTag}
            draw={drawn ? { from: results.length, onReroll: draw } : undefined}
          />
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
      <ToastHost offset={collection ? RANDOM_BUTTON_SPACE : 0} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemePreferenceProvider load={loadThemePreference} save={saveThemePreference}>
        <Main />
      </ThemePreferenceProvider>
    </SafeAreaProvider>
  );
}

const useStyles = themedStyles((c) => ({
  screen: { flex: 1, backgroundColor: c.background },
  loader: { marginTop: spacing.xl },
  controls: { gap: spacing.sm, paddingBottom: spacing.sm },
  search: { paddingHorizontal: spacing.lg },
}));
