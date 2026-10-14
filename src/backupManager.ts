import { createBackupManager } from '@forthtilliath/expo-backup';

import { backupFileName, createBackup, readBackup, type Backup } from './domain/backup';
import { loadCollection, loadSettings, saveBackup } from './storage';

type Listener = (backup: Backup) => void;
let onApplied: Listener | null = null;

/** L'app se met à jour (collection et réglages en mémoire) après chaque restauration. */
export function setBackupAppliedListener(listener: Listener | null): void {
  onApplied = listener;
}

/** Enregistre une sauvegarde déjà validée (un seul `multiSet`), puis met l'app à jour. */
export async function applyBackupData(data: Backup): Promise<void> {
  await saveBackup(data);
  onApplied?.(data);
}

/**
 * Sauvegarde automatique sur Google Drive (dossier privé de l'app, scope `drive.appdata`)
 * et sauvegarde manuelle par fichier. Le format reste celui de `createBackup` : les fichiers
 * déjà exportés restent lisibles, et tout ce qui est relu passe par la validation zod de `readBackup`.
 */
export const backup = createBackupManager<Backup>({
  appId: 'onsortkoi', // noms de fichiers et clé du stockage sécurisé : ne jamais le changer
  encryption: 'off', // une ludothèque n'a rien de sensible
  async collect() {
    const collection = await loadCollection();
    // Rien à envoyer tant qu'aucune collection n'est importée : l'envoi attend le prochain changement.
    if (!collection) throw new Error('Aucune collection à sauvegarder.');
    return { collection, settings: await loadSettings() };
  },
  serialize: ({ collection, settings }) => createBackup(collection, settings),
  parse(text) {
    const result = readBackup(text);
    if (!result.ok) throw new Error(result.error);
    return result.backup;
  },
  apply: applyBackupData,
  exportFileName: backupFileName,
  exportDialogTitle: 'Enregistrer la sauvegarde',
});
