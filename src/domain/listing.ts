import { byTitle, normalize } from './filters';
import type { Game } from './types';

export type SortKey = 'title' | 'rating' | 'averageRating' | 'duration' | 'year';

export const SORT_OPTIONS: { value: SortKey; label: string; hint: string }[] = [
  { value: 'title', label: 'Titre', hint: 'De A à Z' },
  { value: 'rating', label: 'Ma note', hint: "La meilleure d'abord" },
  { value: 'averageRating', label: 'Note MyLudo', hint: "La meilleure d'abord" },
  { value: 'duration', label: 'Durée', hint: "La plus courte d'abord" },
  { value: 'year', label: "Année d'édition", hint: "La plus récente d'abord" },
];

/** Valeur triée et sens ; une valeur non renseignée (`null`) va toujours en fin de liste. */
const SORT_VALUES: Record<Exclude<SortKey, 'title'>, { value: (game: Game) => number | null; descending: boolean }> = {
  rating: { value: (g) => g.rating, descending: true },
  averageRating: { value: (g) => g.averageRating, descending: true },
  duration: { value: (g) => g.duration?.min ?? null, descending: false },
  year: { value: (g) => g.year, descending: true },
};

/** Copie triée ; à égalité, par titre. */
export function sortGames(games: Game[], sort: SortKey): Game[] {
  if (sort === 'title') return [...games].sort(byTitle);
  const { value, descending } = SORT_VALUES[sort];
  return [...games].sort((a, b) => {
    const va = value(a);
    const vb = value(b);
    if (va !== vb) {
      if (va === null) return 1;
      if (vb === null) return -1;
      return descending ? vb - va : va - vb;
    }
    return byTitle(a, b);
  });
}

/** Lettre d'index d'un titre, sans accent ; `#` pour un chiffre ou un symbole. */
export function indexLetter(title: string): string {
  const first = normalize(title).match(/[\p{L}\p{N}]/u)?.[0];
  return first && /\p{L}/u.test(first) ? first.toUpperCase() : '#';
}

export type ListRow = { kind: 'letter'; letter: string } | { kind: 'game'; game: Game };

/**
 * Lignes de la liste : en tri par titre, un en-tête par lettre (collé en haut pendant le défilement),
 * sinon les jeux seuls.
 */
export function listRows(games: Game[], withLetters: boolean): { rows: ListRow[]; stickyIndices: number[] } {
  if (!withLetters) return { rows: games.map((game) => ({ kind: 'game', game })), stickyIndices: [] };
  const rows: ListRow[] = [];
  const stickyIndices: number[] = [];
  let current: string | null = null;
  for (const game of games) {
    const letter = indexLetter(game.title);
    if (letter !== current) {
      current = letter;
      stickyIndices.push(rows.length);
      rows.push({ kind: 'letter', letter });
    }
    rows.push({ kind: 'game', game });
  }
  return { rows, stickyIndices };
}

/** Jeu tiré au hasard, différent du précédent quand il y a le choix. `null` sans jeu. */
export function pickRandom(games: Game[], previous: Game | null = null, random = Math.random): Game | null {
  const pool = previous && games.length > 1 ? games.filter((g) => g.id !== previous.id) : games;
  if (pool.length === 0) return null;
  return pool[Math.floor(random() * pool.length)];
}
