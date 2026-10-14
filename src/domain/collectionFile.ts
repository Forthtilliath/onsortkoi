import { readBackup, type Backup } from './backup';
import { importCollection } from './importSchema';
import type { Game } from './types';

export type CollectionFileResult =
  | { ok: true; kind: 'myludo'; games: Game[] }
  | { ok: true; kind: 'backup'; backup: Backup }
  | { ok: false; error: string };

const UNKNOWN = "Ce fichier n'est ni un export MyLudo ni une sauvegarde Onsortkoi.\nRien n'a été importé.";

/**
 * Accueil : un seul bouton accepte les deux formats. Un export MyLudo est une liste de jeux,
 * une sauvegarde Onsortkoi un objet marqué `app`. Chacun est ensuite validé en entier par son schéma.
 */
export function readCollectionFile(text: string): CollectionFileResult {
  let data: unknown;
  try {
    data = JSON.parse(text.replace(/^﻿/, ''));
  } catch {
    return { ok: false, error: UNKNOWN };
  }

  if (Array.isArray(data)) {
    const result = importCollection(text);
    return result.ok ? { ok: true, kind: 'myludo', games: result.games } : result;
  }
  if (data !== null && typeof data === 'object' && 'app' in data) {
    const result = readBackup(text);
    return result.ok ? { ok: true, kind: 'backup', backup: result.backup } : result;
  }
  return { ok: false, error: UNKNOWN };
}
