import { defaultLabels, errorMessage } from '@forthtilliath/expo-backup-ui';
import { successFeedback } from '@forthtilliath/react-native-kit/utils/helpers/haptics';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { applyBackupData, backup } from './backupManager';
import type { Backup } from './domain/backup';
import type { Game } from './domain/types';
import { pickCollectionFile } from './importFile';
import { showToast } from './ui/Toast';

/** Action de l'accueil en cours : import d'un fichier ou restauration Drive. */
export type FirstImportTask = 'file' | 'drive';

function announceRestored({ collection }: Backup) {
  const date = new Date(collection.importedAt).toLocaleDateString('fr-FR');
  successFeedback();
  showToast(`Sauvegarde restaurée : ${collection.games.length} jeux, importés de MyLudo le ${date}.`);
}

/**
 * Accueil (aucune collection, donc rien à remplacer ni à confirmer) : import d'un fichier,
 * export MyLudo ou sauvegarde, et restauration depuis Google Drive.
 */
export function useFirstImport(importGames: (games: Game[]) => Promise<void>) {
  const [busy, setBusy] = useState<FirstImportTask | null>(null);

  const run = useCallback(async (task: FirstImportTask, work: () => Promise<void>) => {
    setBusy(task);
    try {
      await work();
    } catch (error) {
      Alert.alert('Import impossible', errorMessage(error, defaultLabels.fr));
    } finally {
      setBusy(null);
    }
  }, []);

  const importFile = useCallback(
    () =>
      run('file', async () => {
        const result = await pickCollectionFile();
        if (!result) return;
        if (!result.ok) {
          Alert.alert('Import impossible', result.error);
          return;
        }
        if (result.kind === 'myludo') {
          await importGames(result.games);
          return;
        }
        await applyBackupData(result.backup);
        backup.notifyDataChanged();
        announceRestored(result.backup);
      }),
    [run, importGames],
  );

  const restoreFromDrive = useCallback(
    () =>
      run('drive', async () => {
        const result = await backup.connectCloud();
        if (result.status === 'cancelled') return;
        if (result.status === 'connected') {
          Alert.alert(
            'Aucune sauvegarde',
            `Rien n'est encore sauvegardé sur ${result.email}. Importe ton export MyLudo : il y sera ensuite sauvegardé automatiquement.`,
          );
          return;
        }
        // Téléphone vide : `hasLocalData` évite à `resolveConflict` une copie de sécurité impossible.
        await backup.resolveConflict(result, 'cloud');
        announceRestored(result.remote);
      }),
    [run],
  );

  return { importFile, restoreFromDrive, busy };
}
