import type { ThemePreference } from '@forthtilliath/react-native-kit/hooks/useEffectiveColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

import type { Backup } from './domain/backup';
import { settingsSchema, storedCollectionSchema } from './domain/gameSchema';
import { DEFAULT_SETTINGS, type Settings } from './domain/settings';
import type { Game, StoredCollection } from './domain/types';
import { EMPTY_UPDATE_CHECK, parseUpdateCheck, type UpdateCheck } from './domain/updateCheck';

export type { StoredCollection } from './domain/types';

const KEY = 'onsortkoi:collection:v1';
const SETTINGS_KEY = 'onsortkoi:settings:v1';
const UPDATE_CHECK_KEY = 'onsortkoi:update-check:v1';
const THEME_KEY = 'onsortkoi:theme:v1';

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

export async function loadUpdateCheck(): Promise<UpdateCheck> {
  try {
    return parseUpdateCheck(await AsyncStorage.getItem(UPDATE_CHECK_KEY));
  } catch {
    return EMPTY_UPDATE_CHECK;
  }
}

export async function saveUpdateCheck(check: UpdateCheck): Promise<void> {
  await AsyncStorage.setItem(UPDATE_CHECK_KEY, JSON.stringify(check));
}

// Thème clair / sombre / système : propre au téléphone, hors des sauvegardes.
const themePreferenceSchema = z.enum(['light', 'dark', 'system']);

export async function loadThemePreference(): Promise<ThemePreference | null> {
  try {
    const result = themePreferenceSchema.safeParse(await AsyncStorage.getItem(THEME_KEY));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function saveThemePreference(preference: ThemePreference): Promise<void> {
  // Échec d'écriture sans gravité : le thème choisi reste appliqué pour la session.
  await AsyncStorage.setItem(THEME_KEY, preference).catch(() => {});
}

/** Enregistre une sauvegarde validée : collection et réglages en une seule écriture. */
export async function saveBackup({ collection, settings }: Backup): Promise<void> {
  await AsyncStorage.multiSet([
    [KEY, JSON.stringify(collection)],
    [SETTINGS_KEY, JSON.stringify(settings)],
  ]);
}
