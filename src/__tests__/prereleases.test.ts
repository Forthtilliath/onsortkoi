import AsyncStorage from '@react-native-async-storage/async-storage';

import { loadIncludePrereleases, saveIncludePrereleases } from '../storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual<typeof AsyncStorage>('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const KEY = 'onsortkoi:prereleases:v1';

describe('versions de test', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('sont désactivées par défaut', async () => {
    expect(await loadIncludePrereleases()).toBe(false);
  });

  it('relisent le choix enregistré', async () => {
    await saveIncludePrereleases(true);
    expect(await loadIncludePrereleases()).toBe(true);
    await saveIncludePrereleases(false);
    expect(await loadIncludePrereleases()).toBe(false);
  });

  it('ignorent une valeur inattendue', async () => {
    await AsyncStorage.setItem(KEY, 'true');
    expect(await loadIncludePrereleases()).toBe(false);
  });
});
