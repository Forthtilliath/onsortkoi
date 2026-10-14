import { backupFileName, createBackup, readBackup } from '../backup';
import { DEFAULT_SETTINGS } from '../settings';
import type { Game, StoredCollection } from '../types';

const game = (overrides: Partial<Game> = {}): Game => ({
  id: 4680,
  title: '7 Wonders',
  subtitle: '',
  type: 'basegame',
  year: 2010,
  players: { min: 2, max: 7 },
  duration: { min: 30, max: 30 },
  age: 10,
  categories: ['Jeu de Cartes'],
  themes: ['Antiquité'],
  mechanisms: ['Draft'],
  authors: ['Antoine Bauza'],
  rating: null,
  averageRating: 7.9,
  ...overrides,
});

const collection: StoredCollection = { importedAt: '2026-10-01T18:30:00.000Z', games: [game()] };
const settings = { showCategories: false, themes: ['Antiquité'], mechanisms: [] };

/** Sauvegarde valide, modifiable avant d'être relue. */
const backupData = () => JSON.parse(createBackup(collection, settings)) as Record<string, any>;
const read = (data: unknown) => readBackup(JSON.stringify(data));

describe('readBackup', () => {
  it('relit une sauvegarde créée par createBackup', () => {
    const result = readBackup(createBackup(collection, settings));
    expect(result).toEqual({ ok: true, backup: { collection, settings } });
  });

  it('supprime les clés inconnues', () => {
    const data = backupData();
    data.extra = 'x';
    data.collection.games[0].prixAchat = 42;
    data.settings.token = 'secret';
    const result = read(data);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.backup.collection.games[0]).not.toHaveProperty('prixAchat');
    expect(result.backup.settings).toEqual(settings);
  });

  it.each([
    ['du texte', 'pas du json'],
    ['un export MyLudo', '[{"ID":1,"Titre":"x"}]'],
    ['une autre app', JSON.stringify({ app: 'autre', version: 1 })],
  ])('refuse %s', (_label, text) => {
    const result = readBackup(text);
    expect(result).toEqual({ ok: false, error: expect.stringContaining("pas une sauvegarde Onsortkoi") });
  });

  it('refuse une autre version du format', () => {
    const data = backupData();
    data.version = 2;
    expect(read(data)).toEqual({ ok: false, error: expect.stringContaining('autre version') });
  });

  it.each<[string, (data: Record<string, any>) => void]>([
    ['un titre vide', (d) => (d.collection.games[0].title = '')],
    ['un titre trop long', (d) => (d.collection.games[0].title = 'x'.repeat(201))],
    ['une note hors bornes', (d) => (d.collection.games[0].rating = 11)],
    ['un intervalle inversé', (d) => (d.collection.games[0].players = { min: 5, max: 2 })],
    ['une durée excessive', (d) => (d.collection.games[0].duration = { min: 10, max: 100000 })],
    ['un tag non textuel', (d) => (d.collection.games[0].themes = [42])],
    ['un type suspect', (d) => (d.collection.games[0].type = '<script>')],
    ['une collection vide', (d) => (d.collection.games = [])],
    ['un identifiant en double', (d) => d.collection.games.push(d.collection.games[0])],
    ['une date invalide', (d) => (d.collection.importedAt = 'hier')],
    ['des réglages invalides', (d) => (d.settings.showCategories = 'oui')],
    ['des réglages absents', (d) => delete d.settings],
  ])('rejette tout le fichier pour %s', (_label, corrupt) => {
    const data = backupData();
    corrupt(data);
    const result = read(data);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Rien n'a été modifié\.$/);
  });

  it('situe une erreur sur un jeu', () => {
    const data = backupData();
    data.collection.games.push({ ...game({ id: 2, title: 'Azul' }), age: -1 });
    const result = read(data);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain('Jeu n°2 (« Azul ») — champ « age »');
  });

  it('accepte les réglages par défaut', () => {
    expect(readBackup(createBackup(collection, DEFAULT_SETTINGS)).ok).toBe(true);
  });
});

describe('backupFileName', () => {
  it("contient le nom de l'app et la date locale", () => {
    expect(backupFileName(new Date(2026, 0, 5, 23, 59))).toBe('Onsortkoi-sauvegarde-2026-01-05.json');
  });
});
