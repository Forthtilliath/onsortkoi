import { shareTextFile } from '@forthtilliath/react-native-kit/utils/helpers/shareTextFile';

import { backupFileName, createBackup, readBackup, type RestoreResult } from './domain/backup';
import type { Settings } from './domain/settings';
import type { StoredCollection } from './domain/types';
import { pickJsonText } from './importFile';

/** Ouvre le menu de partage Android avec la sauvegarde : l'utilisateur choisit « Drive ». */
export async function shareBackup(collection: StoredCollection, settings: Settings): Promise<void> {
  await shareTextFile(backupFileName(), createBackup(collection, settings), {
    mimeType: 'application/json',
    dialogTitle: 'Enregistrer la sauvegarde',
  });
}

/** Ouvre le sélecteur de fichiers et valide la sauvegarde choisie. `null` si l'utilisateur annule. */
export async function pickBackup(): Promise<RestoreResult | null> {
  const picked = await pickJsonText();
  if (!picked) return null;
  return picked.ok ? readBackup(picked.text) : picked;
}
