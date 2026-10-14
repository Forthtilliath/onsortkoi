import { applyFilters, collectTags, EMPTY_FILTERS, facetTags, type Filters } from '../filters';
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

  it('filtre par tranches de durée', () => {
    expect(filter({ durations: ['express'] })).toEqual([2]);
    expect(filter({ durations: ['short'] })).toEqual([3, 1]);
    expect(filter({ durations: ['medium'] })).toEqual([1]);
    expect(filter({ durations: ['long'] })).toEqual([]);
    expect(filter({ durations: ['express', 'medium'] })).toEqual([2, 1]);
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
    expect(filter({ players: 3, durations: ['express', 'short'], youngestAge: 10 })).toEqual([3, 2]);
    expect(filter({ players: 5, durations: ['express', 'short'], youngestAge: 10 })).toEqual([2]);
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

describe('facetTags', () => {
  const lcg = [...games, game({ id: 6, title: 'Extension JCE', type: 'extension', categories: ['Jeu de cartes évolutif'] })];
  const facet = (f: Partial<Filters>) => facetTags(lcg, { ...EMPTY_FILTERS, ...f }, 'categories');

  it('ignore les extensions masquées', () => {
    expect(facet({})).toEqual([
      { name: "Jeu d'Ambiance", count: 1 },
      { name: 'Jeu de tuiles', count: 1 },
    ]);
    expect(facet({ includeExpansions: true })).toContainEqual({ name: 'Jeu de cartes évolutif', count: 1 });
  });

  it('tient compte des autres critères mais pas des tags du groupe', () => {
    expect(facet({ players: 8 })).toEqual([{ name: "Jeu d'Ambiance", count: 1 }]);
    const tags = { ...EMPTY_FILTERS.tags, categories: ['Jeu de tuiles'] };
    expect(facet({ tags })).toHaveLength(2);
    expect(facet({ tags: { ...tags, mechanisms: ['Coopératif'] } })).toEqual([]);
  });
});
