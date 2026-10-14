import { z } from 'zod';

import { settingsSchema, storedCollectionSchema } from './gameSchema';
import type { Settings } from './settings';
import type { StoredCollection } from './types';

const APP = 'onsortkoi';
const VERSION = 1;

const backupSchema = z.object({
  app: z.literal(APP),
  version: z.literal(VERSION),
  exportedAt: z.iso.datetime(),
  collection: storedCollectionSchema,
  settings: settingsSchema,
});

export type Backup = { collection: StoredCollection; settings: Settings };

export type RestoreResult = { ok: true; backup: Backup } | { ok: false; error: string };

/** Contenu du fichier de sauvegarde : collection et réglages. */
export function createBackup(collection: StoredCollection, settings: Settings, now = new Date()): string {
  return JSON.stringify({ app: APP, version: VERSION, exportedAt: now.toISOString(), collection, settings });
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
  if (header.data.version !== VERSION) {
    return fail("Sauvegarde créée par une autre version de l'application.");
  }

  const result = backupSchema.safeParse(data);
  if (!result.success) return fail(describeIssue(result.error.issues[0], data));
  return { ok: true, backup: { collection: result.data.collection, settings: result.data.settings } };
}

function describeIssue(issue: z.core.$ZodIssue, data: unknown): string {
  const [section, list, index, field] = issue.path;
  if (section === 'collection' && list === 'games' && typeof index === 'number') {
    const games = (data as { collection: { games: { title?: unknown }[] } }).collection.games;
    const raw = games[index]?.title;
    const title = typeof raw === 'string' ? ` (« ${raw.slice(0, 60)} »)` : '';
    const where = field === undefined ? '' : ` — champ « ${String(field)} »`;
    return `Jeu n°${index + 1}${title}${where} : ${issue.message}`;
  }
  const where = issue.path.length ? `Champ « ${issue.path.join('.')} » : ` : '';
  return `${where}${issue.message}`;
}
