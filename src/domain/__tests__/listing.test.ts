import { indexLetter, listRows, pickRandom, sortGames } from '../listing';
import type { Game } from '../types';

const game = (overrides: Partial<Game>): Game => ({
  id: 1,
  title: 'Jeu',
  subtitle: '',
  type: 'basegame',
  year: null,
  players: null,
  duration: null,
  age: null,
  categories: [],
  themes: [],
  mechanisms: [],
  authors: [],
  rating: null,
  averageRating: null,
  ...overrides,
});

const games: Game[] = [
  game({ id: 1, title: 'Zombicide', rating: 7, averageRating: 8.1, duration: { min: 60, max: 120 }, year: 2012 }),
  game({ id: 2, title: 'écoute-moi', rating: 9, duration: { min: 15, max: 15 }, year: 2020 }),
  game({ id: 3, title: 'Azul', rating: 9, averageRating: 8.4, duration: { min: 45, max: 45 } }),
  game({ id: 4, title: '7 Wonders', averageRating: 8.4, year: 2010 }),
];

const ids = (list: Game[]) => list.map((g) => g.id);

describe('sortGames', () => {
  it('trie par titre sans tenir compte des accents ni de la casse', () => {
    expect(ids(sortGames(games, 'title'))).toEqual([4, 3, 2, 1]);
  });

  it('met la meilleure note en tête, les jeux non notés en fin, à égalité par titre', () => {
    expect(ids(sortGames(games, 'rating'))).toEqual([3, 2, 1, 4]);
    expect(ids(sortGames(games, 'averageRating'))).toEqual([4, 3, 1, 2]);
  });

  it('trie par durée croissante et par année décroissante', () => {
    expect(ids(sortGames(games, 'duration'))).toEqual([2, 3, 1, 4]);
    expect(ids(sortGames(games, 'year'))).toEqual([2, 1, 4, 3]);
  });

  it('ne modifie pas la liste reçue', () => {
    const copy = [...games];
    sortGames(games, 'rating');
    expect(games).toEqual(copy);
  });
});

describe('indexLetter', () => {
  it('donne la première lettre sans accent, ou # pour un chiffre', () => {
    expect(indexLetter('écoute-moi')).toBe('E');
    expect(indexLetter('« Azul »')).toBe('A');
    expect(indexLetter('7 Wonders')).toBe('#');
  });
});

describe('listRows', () => {
  it('ajoute un en-tête collant par lettre', () => {
    const sorted = sortGames(games, 'title');
    const { rows, stickyIndices } = listRows(sorted, true);
    expect(rows.map((r) => (r.kind === 'letter' ? r.letter : r.game.id))).toEqual(['#', 4, 'A', 3, 'E', 2, 'Z', 1]);
    expect(stickyIndices).toEqual([0, 2, 4, 6]);
  });

  it('ne met aucun en-tête sans lettres', () => {
    expect(listRows(games, false)).toEqual({ rows: games.map((g) => ({ kind: 'game', game: g })), stickyIndices: [] });
  });
});

describe('pickRandom', () => {
  it('tire un jeu de la liste, null si elle est vide', () => {
    expect(pickRandom([], null)).toBeNull();
    expect(pickRandom(games, null, () => 0)).toBe(games[0]);
    expect(pickRandom(games, null, () => 0.99)).toBe(games[3]);
  });

  it('évite le jeu précédent quand il y a le choix', () => {
    expect(pickRandom(games, games[0], () => 0)).toBe(games[1]);
    expect(pickRandom([games[0]], games[0], () => 0)).toBe(games[0]);
  });
});
