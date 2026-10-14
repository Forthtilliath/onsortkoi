import { File } from 'expo-file-system';

import { readCollectionFile, type CollectionFileResult } from './domain/collectionFile';
import { importCollection, MAX_FILE_BYTES, type ImportResult } from './domain/importSchema';

type PickedText = { ok: true; text: string } | { ok: false; error: string };

/**
 * Taille en octets, 0 si inconnue. Le sélecteur la donne parfois à 0 : elle est alors redemandée
 * au descripteur du fichier ouvert, sans rien lire.
 */
function fileSize(file: File): number {
  if (file.size > 0) return file.size;
  try {
    const handle = file.open();
    try {
      return handle.size ?? 0;
    } finally {
      handle.close();
    }
  } catch {
    return 0;
  }
}

/** Ouvre le sélecteur de fichiers (Drive compris) et lit le JSON choisi. `null` si l'utilisateur annule. */
export async function pickJsonText(): Promise<PickedText | null> {
  // Le sélecteur système donne un fichier (URI content://) lisible directement, sans copie.
  // Selon l'appareil, un .json peut être vu comme application/json, text/plain ou octet-stream.
  const picked = await File.pickFileAsync({
    mimeTypes: ['application/json', 'text/plain', 'application/octet-stream'],
  });
  if (picked.canceled) return null;

  const tooLarge = { ok: false, error: "Fichier trop volumineux (10 Mo maximum).\nRien n'a été modifié." } as const;
  try {
    // Taille vérifiée avant toute lecture : un fichier énorme saturerait la mémoire.
    if (fileSize(picked.result) > MAX_FILE_BYTES) return tooLarge;
    const text = await picked.result.text();
    // Fournisseur qui ne donne aucune taille (flux) : la longueur lue est vérifiée aussi.
    if (text.length > MAX_FILE_BYTES) return tooLarge;
    return { ok: true, text };
  } catch (error) {
    if (__DEV__) console.warn('Lecture du fichier impossible', error);
    return { ok: false, error: "Impossible de lire ce fichier.\nRien n'a été modifié." };
  }
}

/** Ouvre le sélecteur de fichiers et valide l'export MyLudo choisi. `null` si l'utilisateur annule. */
export async function pickAndImport(): Promise<ImportResult | null> {
  const picked = await pickJsonText();
  if (!picked) return null;
  return picked.ok ? importCollection(picked.text) : picked;
}

/** Accueil : accepte un export MyLudo ou une sauvegarde Onsortkoi. `null` si l'utilisateur annule. */
export async function pickCollectionFile(): Promise<CollectionFileResult | null> {
  const picked = await pickJsonText();
  if (!picked) return null;
  return picked.ok ? readCollectionFile(picked.text) : picked;
}
