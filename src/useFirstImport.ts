import { defaultLabels, errorMessage } from '@forthtilliath/expo-backup-ui';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { applyBackupData, backup } from './backupManager';
import type { Backup } from './domain/backup';
import type { Game } from './domain/types';
import { pickCollectionFile } from './importFile';

function announceRestored({ collection }: Backup) {
  const date = new Date(collection.importedAt).toLocaleDateString('fr-FR');
  Alert.alert('Sauvegarde restaurée', `${collection.games.length} jeux, importés de MyLudo le ${date}.`);
}

/**
 * Accueil (aucune collection, donc rien à remplacer ni à confirmer) : import d'un fichier,
 * export MyLudo ou sauvegarde, et restauration depuis Google Drive.
 */
export function useFirstImport(importGames: (games: Game[]) => Promise<void>) {
  const [busy, setBusy] = useState(false);

  const run = useCallback(async (task: () => Promise<void>) => {
    setBusy(true);
    try {
      await task();
    } catch (error) {
      Alert.alert('Import impossible', errorMessage(error, defaultLabels.fr));
    } finally {
      setBusy(false);
    }
  }, []);

  const importFile = useCallback(
    () =>
      run(async () => {
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
      run(async () => {
        const result = await backup.connectCloud();
        if (result.status === 'cancelled') return;
        if (result.status === 'connected') {
          Alert.alert(
            'Aucune sauvegarde',
            `Rien n'est encore sauvegardé sur ${result.email}. Importe ton export MyLudo : il y sera ensuite sauvegardé automatiquement.`,
          );
          return;
        }
        // Le téléphone est vide : la sauvegarde Drive s'applique d'abord, pour que la copie
        // de sécurité faite par `resolveConflict` ait des données à copier.
        await applyBackupData(result.remote);
        await backup.resolveConflict(result, 'cloud');
        announceRestored(result.remote);
      }),
    [run],
  );

  return { importFile, restoreFromDrive, busy };
}
