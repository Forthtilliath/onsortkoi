import { z } from 'zod';

import { MAX_AGE, MAX_DURATION, MAX_PLAYERS } from './fields';
import { MAX_GAMES } from './importSchema';

// Mêmes bornes qu'à l'import MyLudo : une collection enregistrée ou restaurée
// ne peut pas contenir ce qu'un import aurait refusé.

const range = (limit: number) =>
  z
    .object({
      min: z.number().int().min(0).max(limit),
      max: z.number().int().min(0).max(limit).nullable(),
    })
    .refine((r) => r.max === null || r.min <= r.max, { message: 'intervalle inversé' })
    .nullable();

const tags = z.array(z.string().min(1).max(100)).max(100);
const rating = z.number().min(0).max(10).nullable();

export const gameSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200),
  type: z
    .string()
    .max(30)
    .regex(/^[\p{L}_-]*$/u),
  year: z.number().int().min(1).max(2100).nullable(),
  players: range(MAX_PLAYERS),
  duration: range(MAX_DURATION),
  age: z.number().int().min(0).max(MAX_AGE).nullable(),
  categories: tags,
  themes: tags,
  mechanisms: tags,
  authors: tags,
  rating,
  averageRating: rating,
});

export const storedCollectionSchema = z.object({
  importedAt: z.iso.datetime(),
  games: z
    .array(gameSchema)
    .min(1)
    .max(MAX_GAMES)
    .refine((games) => new Set(games.map((g) => g.id)).size === games.length, {
      message: 'identifiant de jeu en double',
    }),
});

const tagChoice = z.array(z.string().max(100)).max(500);

export const settingsSchema = z.object({ showCategories: z.boolean(), themes: tagChoice, mechanisms: tagChoice });
