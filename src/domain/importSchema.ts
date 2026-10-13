import { z } from 'zod';

import { parseAge, parseDuration, parsePlayers } from './fields';
import type { Game } from './types';

z.config(z.locales.fr());

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_GAMES = 5000;
const MAX_TAGS = 100;
const MAX_TAG_LENGTH = 100;

const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .nullish()
    .transform((v) => v?.trim() ?? '');

const tagList = z
  .array(z.string().trim().min(1).max(MAX_TAG_LENGTH))
  .max(MAX_TAGS)
  .nullish()
  .transform((list) => [...new Set(list ?? [])]);

/** Note sur 10 ; 0 signifie « pas de note » chez MyLudo. */
const rating = z
  .number()
  .min(0)
  .max(10)
  .nullish()
  .transform((v) => (v ? v : null));

/** Champ texte ou nombre interprété par `parse` ; une valeur non reconnue rejette le fichier. */
function parsedField<T>(parse: (raw: string | number) => T | null | undefined) {
  return z
    .union([z.string().max(20), z.number()])
    .nullish()
    .transform((raw, ctx) => {
      if (raw === null || raw === undefined) return null;
      const value = parse(raw);
      if (value === undefined) {
        ctx.issues.push({ code: 'custom', message: `valeur « ${raw} » non reconnue`, input: raw });
        return z.NEVER;
      }
      return value;
    });
}

// Seuls les champs utiles sont gardés : les clés inconnues ou personnelles
// (prix d'achat, propriétaire, commentaire…) sont supprimées par zod.
const entrySchema = z.object({
  ID: z.number().int().positive(),
  Titre: z.string().trim().min(1).max(200),
  'Sous-titre': optionalText(200),
  Type: z
    .string()
    .trim()
    .max(30)
    .regex(/^[\p{L}_-]*$/u)
    .nullish()
    .transform((v) => v?.toLowerCase() ?? ''),
  Édition: z
    .union([z.number().int().min(0).max(2100), z.literal('')])
    .nullish()
    .transform((v) => (typeof v === 'number' && v > 0 ? v : null)),
  'Joueur(s)': parsedField(parsePlayers),
  Durée: parsedField(parseDuration),
  'Age(s)': parsedField(parseAge),
  'Catégorie(s)': tagList,
  'Thème(s)': tagList,
  'Mécanisme(s)': tagList,
  'Auteur(s)': tagList,
  'Note personnelle': rating,
  'Note moyenne': rating,
});

const collectionSchema = z.array(entrySchema).min(1).max(MAX_GAMES);

export type ImportResult = { ok: true; games: Game[] } | { ok: false; error: string };

const fail = (error: string): ImportResult => ({ ok: false, error: `${error}\nRien n'a été importé.` });

/** Valide un export JSON MyLudo en entier : à la première anomalie, tout le fichier est rejeté. */
export function importCollection(text: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text.replace(/^﻿/, ''));
  } catch {
    return fail("Ce fichier n'est pas un export JSON MyLudo valide.");
  }
  if (!Array.isArray(data)) {
    return fail("Format inattendu : l'export MyLudo doit être une liste de jeux.");
  }

  const result = collectionSchema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    const [index, field] = issue.path;
    if (typeof index !== 'number') return fail(issue.message);
    const raw = data[index] as { Titre?: unknown } | null;
    const title = typeof raw?.Titre === 'string' ? ` (« ${raw.Titre.slice(0, 60)} »)` : '';
    const where = field === undefined ? '' : ` — champ « ${String(field)} »`;
    return fail(`Jeu n°${index + 1}${title}${where} : ${issue.message}`);
  }

  const seen = new Set<number>();
  for (const entry of result.data) {
    if (seen.has(entry.ID)) return fail(`Identifiant ${entry.ID} en double (« ${entry.Titre} »).`);
    seen.add(entry.ID);
  }

  return {
    ok: true,
    games: result.data.map((e) => ({
      id: e.ID,
      title: e.Titre,
      subtitle: e['Sous-titre'],
      type: e.Type,
      year: e.Édition,
      players: e['Joueur(s)'],
      duration: e.Durée,
      age: e['Age(s)'],
      categories: e['Catégorie(s)'],
      themes: e['Thème(s)'],
      mechanisms: e['Mécanisme(s)'],
      authors: e['Auteur(s)'],
      rating: e['Note personnelle'],
      averageRating: e['Note moyenne'],
    })),
  };
}
