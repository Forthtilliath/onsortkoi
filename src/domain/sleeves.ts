import { z } from 'zod';

import { compareText } from './filters';
import { MAX_GAMES } from './importSchema';

export const MAX_SLEEVES = 500;
export const MAX_STOCK = 99_999;
export const MAX_NAME_LENGTH = 60;
export const MAX_NOTE_LENGTH = 100;
/** Bornes d'un côté de carte, en millimètres. */
export const MIN_SIDE = 10;
export const MAX_SIDE = 300;

/** Jeu protégé par un produit, avec une note libre (ex. « violet : némésis »). */
export type SleeveLink = { gameId: number; note: string };

/** Produit de sleeves : format en mm (largeur ≤ hauteur), stock restant et jeux qui l'utilisent. */
export type Sleeve = { id: number; name: string; width: number; height: number; stock: number; games: SleeveLink[] };

// Les sleeves sont saisies à la main : stockage et sauvegardes relus avec les mêmes bornes que la saisie.

/** Au dixième de millimètre près (63,5). */
const side = z
  .number()
  .min(MIN_SIDE)
  .max(MAX_SIDE)
  .refine((v) => Math.abs(v * 10 - Math.round(v * 10)) < 1e-6, { message: 'au dixième de millimètre près' });

const linkSchema = z.object({
  gameId: z.number().int().positive(),
  note: z.string().max(MAX_NOTE_LENGTH),
});

const sleeveSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string().trim().min(1).max(MAX_NAME_LENGTH),
    width: side,
    height: side,
    stock: z.number().int().min(0).max(MAX_STOCK),
    games: z
      .array(linkSchema)
      .max(MAX_GAMES)
      .refine((links) => new Set(links.map((l) => l.gameId)).size === links.length, {
        message: 'jeu associé en double',
      }),
  })
  .refine((s) => s.width <= s.height, { message: 'largeur supérieure à la hauteur' });

export const sleevesSchema = z
  .array(sleeveSchema)
  .max(MAX_SLEEVES)
  .refine((list) => new Set(list.map((s) => s.id)).size === list.length, {
    message: 'identifiant de sleeves en double',
  });

/** Millimètres saisis (« 63,5 », « 88 ») ; `null` si ce n'est pas un nombre au dixième près dans les bornes. */
export function parseMillimeters(text: string): number | null {
  const trimmed = text.trim().replace(',', '.');
  if (!/^\d{1,3}(\.\d)?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return value >= MIN_SIDE && value <= MAX_SIDE ? value : null;
}

/** Nombre entier positif saisi ; `null` sinon. */
export function parseCount(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d{1,5}$/.test(trimmed)) return null;
  return Number(trimmed);
}

const mm = (value: number) => value.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

/** « 63,5 × 88 mm ». */
export const formatLabel = ({ width, height }: Pick<Sleeve, 'width' | 'height'>) => `${mm(width)} × ${mm(height)} mm`;

export const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
  `${count} ${count > 1 ? pluralForm : singular}`;

export type FormatGroup = { key: string; width: number; height: number; stock: number; sleeves: Sleeve[] };

const byName = (a: Sleeve, b: Sleeve) => compareText(a.name, b.name);

/** Produits regroupés par format (du plus petit au plus grand), avec le stock total de chaque format. */
export function groupByFormat(sleeves: Sleeve[]): FormatGroup[] {
  const groups = new Map<string, FormatGroup>();
  for (const sleeve of sleeves) {
    const key = `${sleeve.width}x${sleeve.height}`;
    const group = groups.get(key) ?? { key, width: sleeve.width, height: sleeve.height, stock: 0, sleeves: [] };
    group.stock += sleeve.stock;
    group.sleeves.push(sleeve);
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((group) => ({ ...group, sleeves: group.sleeves.sort(byName) }))
    .sort((a, b) => a.width - b.width || a.height - b.height);
}

export type GameSleeve = { sleeve: Sleeve; note: string };

/** Produits utilisés par un jeu, triés par format puis par nom. */
export function sleevesForGame(sleeves: Sleeve[], gameId: number): GameSleeve[] {
  return groupByFormat(sleeves).flatMap((group) =>
    group.sleeves.flatMap((sleeve) => {
      const link = sleeve.games.find((l) => l.gameId === gameId);
      return link ? [{ sleeve, note: link.note }] : [];
    }),
  );
}

export type SleeveDraft = Pick<Sleeve, 'name' | 'width' | 'height' | 'stock'>;

/** Ajoute un produit (nouvel identifiant) ou modifie celui qui porte `id`. Le format est mis en portrait. */
export function saveSleeve(sleeves: Sleeve[], draft: SleeveDraft, id?: number): { sleeves: Sleeve[]; id: number } {
  const fields = {
    name: draft.name.trim(),
    width: Math.min(draft.width, draft.height),
    height: Math.max(draft.width, draft.height),
    stock: clampStock(draft.stock),
  };
  if (id !== undefined) {
    return { sleeves: sleeves.map((s) => (s.id === id ? { ...s, ...fields } : s)), id };
  }
  const newId = sleeves.reduce((max, s) => Math.max(max, s.id), 0) + 1;
  return { sleeves: [...sleeves, { id: newId, ...fields, games: [] }], id: newId };
}

export const removeSleeve = (sleeves: Sleeve[], id: number) => sleeves.filter((s) => s.id !== id);

const clampStock = (stock: number) => Math.min(MAX_STOCK, Math.max(0, Math.round(stock)));

/** Ajoute (ou retire, si `delta` est négatif) des sleeves au stock, sans descendre sous 0. */
export function adjustStock(sleeves: Sleeve[], id: number, delta: number): Sleeve[] {
  return sleeves.map((s) => (s.id === id ? { ...s, stock: clampStock(s.stock + delta) } : s));
}

/** Associe un jeu à un produit, ou met à jour la note d'une association existante. */
export function linkGame(sleeves: Sleeve[], id: number, gameId: number, note: string): Sleeve[] {
  const trimmed = note.trim().slice(0, MAX_NOTE_LENGTH);
  return sleeves.map((s) => {
    if (s.id !== id) return s;
    const exists = s.games.some((l) => l.gameId === gameId);
    const games = exists
      ? s.games.map((l) => (l.gameId === gameId ? { gameId, note: trimmed } : l))
      : [...s.games, { gameId, note: trimmed }];
    return { ...s, games };
  });
}

export function unlinkGame(sleeves: Sleeve[], id: number, gameId: number): Sleeve[] {
  return sleeves.map((s) => (s.id === id ? { ...s, games: s.games.filter((l) => l.gameId !== gameId) } : s));
}
