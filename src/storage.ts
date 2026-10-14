import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Backup } from './domain/backup';
import { settingsSchema, storedCollectionSchema } from './domain/gameSchema';
import { DEFAULT_SETTINGS, type Settings } from './domain/settings';
import type { Game, StoredCollection } from './domain/types';

export type { StoredCollection } from './domain/types';

const KEY = 'onsortkoi:collection:v1';
const SETTINGS_KEY = 'onsortkoi:settings:v1';

// Revalide ce qui a été enregistré : une donnée corrompue est ignorée plutôt que d'être affichée.
export async function loadCollection(): Promise<StoredCollection | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const result = storedCollectionSchema.safeParse(JSON.parse(raw));
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

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const result = settingsSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** Enregistre une sauvegarde validée : collection et réglages en une seule écriture. */
export async function saveBackup({ collection, settings }: Backup): Promise<void> {
  await AsyncStorage.multiSet([
    [KEY, JSON.stringify(collection)],
    [SETTINGS_KEY, JSON.stringify(settings)],
  ]);
}
