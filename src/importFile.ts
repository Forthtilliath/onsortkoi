import { pickTextFile } from '@forthtilliath/react-native-kit/utils/files/pickTextFile';

import { type CollectionFileResult, readCollectionFile } from './domain/collectionFile';
import { importCollection, type ImportResult, MAX_FILE_BYTES } from './domain/importSchema';

type PickedText = { ok: true; text: string } | { ok: false; error: string };

/**
 * Ouvre le sélecteur de fichiers (Drive compris) et lit le JSON choisi, sans copie (`pickTextFile`
 * du kit : taille vérifiée avant toute lecture, puis la longueur lue). `null` si l'utilisateur annule.
 */
export async function pickJsonText(): Promise<PickedText | null> {
  const picked = await pickTextFile({
    maxBytes: MAX_FILE_BYTES,
    labels: { tooLarge: () => "Fichier trop volumineux (10 Mo maximum).\nRien n'a été modifié." },
  });
  if (!picked) return null;
  return picked.ok ? { ok: true, text: picked.text } : { ok: false, error: picked.error };
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
