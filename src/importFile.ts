import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

import { importCollection, MAX_FILE_BYTES, type ImportResult } from './domain/importSchema';

/** Ouvre le sélecteur de fichiers et valide l'export choisi. `null` si l'utilisateur annule. */
export async function pickAndImport(): Promise<ImportResult | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    // Selon l'appareil, un .json peut être vu comme application/json, text/plain ou octet-stream.
    type: ['application/json', 'text/plain', 'application/octet-stream'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (picked.canceled || picked.assets.length === 0) return null;

  const file = new File(picked.assets[0].uri);
  try {
    const size = picked.assets[0].size ?? file.size ?? 0;
    if (size > MAX_FILE_BYTES) {
      return { ok: false, error: 'Fichier trop volumineux (10 Mo maximum).\nRien n\'a été importé.' };
    }
    return importCollection(await file.text());
  } catch {
    return { ok: false, error: 'Impossible de lire ce fichier.\nRien n\'a été importé.' };
  } finally {
    // Supprime la copie temporaire faite par le sélecteur.
    try {
      if (file.exists) file.delete();
    } catch {
      // Copie déjà nettoyée par le système : rien à faire.
    }
  }
}
