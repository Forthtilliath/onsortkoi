import { z } from 'zod';

import { settingsSchema, storedCollectionSchema } from './gameSchema';
import type { Settings } from './settings';
import { type Sleeve, sleevesSchema } from './sleeves';
import type { StoredCollection } from './types';

const APP = 'onsortkoi';
const VERSION = 2;

const backupSchema = z.object({
  app: z.literal(APP),
  exportedAt: z.iso.datetime(),
  collection: storedCollectionSchema,
  settings: settingsSchema,
  sleeves: sleevesSchema,
});

export type Backup = { collection: StoredCollection; settings: Settings; sleeves: Sleeve[] };

export type RestoreResult = { ok: true; backup: Backup } | { ok: false; error: string };

/** Contenu du fichier de sauvegarde : collection, réglages et sleeves. */
export function createBackup({ collection, settings, sleeves }: Backup, now = new Date()): string {
  return JSON.stringify({ app: APP, version: VERSION, exportedAt: now.toISOString(), collection, settings, sleeves });
}

/** Nom du fichier proposé à l'enregistrement, daté du jour (heure locale). */
export function backupFileName(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `Onsortkoi-sauvegarde-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

const fail = (error: string): RestoreResult => ({ ok: false, error: `${error}\nRien n'a été modifié.` });

/** Valide une sauvegarde en entier : à la première anomalie, tout le fichier est rejeté. */
export function readBackup(text: string): RestoreResult {
  let data: unknown;
  try {
    data = JSON.parse(text.replace(/^﻿/, ''));
  } catch {
    return fail("Ce fichier n'est pas une sauvegarde Onsortkoi.");
  }

  const header = z.object({ app: z.literal(APP), version: z.number() }).safeParse(data);
  if (!header.success) return fail("Ce fichier n'est pas une sauvegarde Onsortkoi.");
  const { version } = header.data;
  if (version !== 1 && version !== VERSION) {
    return fail("Sauvegarde créée par une autre version de l'application.");
  }

  // Version 1 : antérieure aux sleeves, relue avec une liste vide.
  const input = version === 1 ? { ...(data as object), sleeves: [] } : data;
  const result = backupSchema.safeParse(input);
  if (!result.success) return fail(describeIssue(result.error.issues[0], input));
  const { collection, settings, sleeves } = result.data;
  return { ok: true, backup: { collection, settings, sleeves } };
}

/** Élément n°`index` d'une liste de la sauvegarde, nommé par `key` s'il en a un. */
function describeItem(kind: string, list: unknown, index: number, key: string, field: PropertyKey | undefined) {
  const raw = Array.isArray(list) ? (list[index] as Record<string, unknown> | null)?.[key] : undefined;
  const label = typeof raw === 'string' ? ` (« ${raw.slice(0, 60)} »)` : '';
  const where = field === undefined ? '' : ` — champ « ${String(field)} »`;
  return `${kind} n°${index + 1}${label}${where}`;
}

function describeIssue(issue: z.core.$ZodIssue, data: unknown): string {
  const [section, list, index, field] = issue.path;
  if (section === 'collection' && list === 'games' && typeof index === 'number') {
    const games = (data as { collection: { games: unknown } }).collection.games;
    return `${describeItem('Jeu', games, index, 'title', field)} : ${issue.message}`;
  }
  if (section === 'sleeves' && typeof list === 'number') {
    const sleeves = (data as { sleeves: unknown }).sleeves;
    return `${describeItem('Sleeves', sleeves, list, 'name', index)} : ${issue.message}`;
  }
  const where = issue.path.length ? `Champ « ${issue.path.join('.')} » : ` : '';
  return `${where}${issue.message}`;
}
