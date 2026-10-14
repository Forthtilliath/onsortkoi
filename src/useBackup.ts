import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { pickBackup, shareBackup } from './backupFile';
import type { Backup } from './domain/backup';
import type { Settings } from './domain/settings';
import type { StoredCollection } from './domain/types';
import { saveBackup } from './storage';

type Options = {
  collection: StoredCollection | null;
  settings: Settings;
  /** Appelé une fois la sauvegarde validée et enregistrée sur le téléphone. */
  onRestored: (backup: Backup) => void;
};

const UNEXPECTED = "Une erreur inattendue s'est produite. Rien n'a été modifié.";

/**
 * `exportBackup` et `restoreBackup` lèvent une erreur au message affichable : `BackupSettingsScreen`
 * (lib) se charge de la confirmation et des alertes. `runRestore` sert hors de cet écran.
 */
export function useBackup({ collection, settings, onRestored }: Options) {
  const [restoring, setRestoring] = useState(false);

  const exportBackup = useCallback(async () => {
    if (collection) await shareBackup(collection, settings);
  }, [collection, settings]);

  const restoreBackup = useCallback(async () => {
    const result = await pickBackup();
    if (!result) return;
    if (!result.ok) throw new Error(result.error);
    try {
      await saveBackup(result.backup);
    } catch {
      throw new Error(UNEXPECTED);
    }
    onRestored(result.backup);
    const { games, importedAt } = result.backup.collection;
    const date = new Date(importedAt).toLocaleDateString('fr-FR');
    Alert.alert('Sauvegarde restaurée', `${games.length} jeux, importés de MyLudo le ${date}.`);
  }, [onRestored]);

  // Écran d'accueil : rien à remplacer, donc pas de confirmation.
  const runRestore = useCallback(async () => {
    setRestoring(true);
    try {
      await restoreBackup();
    } catch (error) {
      Alert.alert('Restauration impossible', error instanceof Error ? error.message : UNEXPECTED);
    } finally {
      setRestoring(false);
    }
  }, [restoreBackup]);

  return { exportBackup, restoreBackup, runRestore, restoring };
}
