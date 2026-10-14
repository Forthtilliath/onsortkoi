import { applyFilters, collectTags, countActiveFilters, EMPTY_FILTERS, type Filters } from '../filters';
import type { Game } from '../types';

const game = (overrides: Partial<Game>): Game => ({
  id: 1,
  title: 'Jeu',
  subtitle: '',
  type: 'basegame',
  year: null,
  players: { min: 2, max: 4 },
  duration: { min: 30, max: 30 },
  age: 10,
  categories: [],
  themes: [],
  mechanisms: [],
  authors: [],
  rating: null,
  averageRating: null,
  ...overrides,
});

const games: Game[] = [
  game({ id: 1, title: 'Zombicide', players: { min: 1, max: 6 }, duration: { min: 60, max: 120 }, age: 14, mechanisms: ['Coopératif', 'Dés'] }),
  game({ id: 2, title: 'Écoute-moi', players: { min: 2, max: null }, duration: { min: 15, max: 15 }, age: 8, categories: ["Jeu d'Ambiance"] }),
  game({ id: 3, title: 'Azul', players: { min: 2, max: 4 }, duration: { min: 45, max: 45 }, age: 8, categories: ['Jeu de tuiles'] }),
  game({ id: 4, title: 'Azul : extension', type: 'extension' }),
  game({ id: 5, title: 'Sans infos', players: null, duration: null, age: null }),
];

const filter = (f: Partial<Filters>) => applyFilters(games, { ...EMPTY_FILTERS, ...f }).map((g) => g.id);

describe('applyFilters', () => {
  it('masque les extensions par défaut et trie par titre', () => {
    expect(filter({})).toEqual([3, 2, 5, 1]);
    expect(filter({ includeExpansions: true })).toEqual([3, 4, 2, 5, 1]);
  });

  it('cherche dans le titre sans tenir compte des accents ni de la casse', () => {
    expect(filter({ query: 'ecoute' })).toEqual([2]);
  });

  it('filtre par nombre de joueurs, y compris « 2+ »', () => {
    expect(filter({ players: 1 })).toEqual([1]);
    expect(filter({ players: 8 })).toEqual([2]);
    expect(filter({ players: 4 })).toEqual([3, 2, 1]);
  });

  it('garde les jeux faisables dans le temps disponible (durée mini)', () => {
    expect(filter({ maxDuration: 30 })).toEqual([2]);
    expect(filter({ maxDuration: 60 })).toEqual([3, 2, 1]);
  });

  it('garde les jeux qui peuvent durer au moins le temps voulu (durée maxi)', () => {
    expect(filter({ minDuration: 45 })).toEqual([3, 1]);
    expect(filter({ minDuration: 90 })).toEqual([1]);
  });

  it('combine durée minimum et maximum', () => {
    expect(filter({ minDuration: 30, maxDuration: 60 })).toEqual([3, 1]);
  });

  it("garde les jeux adaptés à l'âge du plus jeune", () => {
    expect(filter({ youngestAge: 8 })).toEqual([3, 2]);
  });

  it('combine les tags : OU dans un groupe, ET entre groupes', () => {
    const tags = { ...EMPTY_FILTERS.tags, categories: ["Jeu d'Ambiance", 'Jeu de tuiles'] };
    expect(filter({ tags })).toEqual([3, 2]);
    expect(filter({ tags: { ...tags, mechanisms: ['Coopératif'] } })).toEqual([]);
  });

  it('combine tous les critères', () => {
    expect(filter({ players: 3, maxDuration: 45, youngestAge: 10 })).toEqual([3, 2]);
    expect(filter({ players: 5, maxDuration: 45, youngestAge: 10 })).toEqual([2]);
  });
});

describe('collectTags', () => {
  it('compte les tags par groupe', () => {
    expect(collectTags(games, 'mechanisms')).toEqual([
      { name: 'Coopératif', count: 1 },
      { name: 'Dés', count: 1 },
    ]);
  });
});

describe('countActiveFilters', () => {
  it('compte chaque critère actif et chaque tag', () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
    expect(countActiveFilters({ ...EMPTY_FILTERS, players: 2, tags: { ...EMPTY_FILTERS.tags, themes: ['a', 'b'] } })).toBe(3);
  });
});
