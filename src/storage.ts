import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

import type { Game } from './domain/types';

const KEY = 'ludocollec:collection:v1';

export type StoredCollection = { importedAt: string; games: Game[] };

const range = z.object({ min: z.number(), max: z.number().nullable() }).nullable();
const tags = z.array(z.string());

// Revalide ce qui a été enregistré : une donnée corrompue est ignorée plutôt que d'être affichée.
const storedSchema = z.object({
  importedAt: z.string(),
  games: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      subtitle: z.string(),
      type: z.string(),
      year: z.number().nullable(),
      players: range,
      duration: range,
      age: z.number().nullable(),
      categories: tags,
      themes: tags,
      mechanisms: tags,
      authors: tags,
      rating: z.number().nullable(),
      averageRating: z.number().nullable(),
    }),
  ),
});

export async function loadCollection(): Promise<StoredCollection | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const result = storedSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function saveCollection(games: Game[]): Promise<StoredCollection> {
  const collection = { importedAt: new Date().toISOString(), games };
  await AsyncStorage.setItem(KEY, JSON.stringify(collection));
  return collection;
}
