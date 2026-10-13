import type { Game, TagGroup } from './types';

export type Filters = {
  query: string;
  players: number | null;
  /** Durée disponible en minutes : le jeu doit pouvoir se jouer dans ce temps (durée mini). */
  maxDuration: number | null;
  /** Âge du plus jeune joueur : l'âge conseillé du jeu ne doit pas le dépasser. */
  youngestAge: number | null;
  includeExpansions: boolean;
  tags: Record<TagGroup, string[]>;
};

export const EMPTY_FILTERS: Filters = {
  query: '',
  players: null,
  maxDuration: null,
  youngestAge: null,
  includeExpansions: false,
  tags: { categories: [], themes: [], mechanisms: [] },
};

/** Types jouables seuls ; un type vide (non renseigné) est traité comme un jeu de base. */
const STANDALONE_TYPES = new Set(['', 'basegame', 'standalone']);

export const isStandalone = (game: Game) => STANDALONE_TYPES.has(game.type);

export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function matchesTags(game: Game, tags: Filters['tags']): boolean {
  // Dans un même groupe : au moins un tag (OU) ; entre groupes : tous (ET).
  return (Object.keys(tags) as TagGroup[]).every((group) => {
    const wanted = tags[group];
    return wanted.length === 0 || wanted.some((tag) => game[group].includes(tag));
  });
}

export function matches(game: Game, filters: Filters): boolean {
  if (!filters.includeExpansions && !isStandalone(game)) return false;

  const query = normalize(filters.query);
  if (query && !normalize(`${game.title} ${game.subtitle}`).includes(query)) return false;

  const { players, maxDuration, youngestAge } = filters;
  if (players !== null) {
    const range = game.players;
    if (!range || players < range.min || (range.max !== null && players > range.max)) return false;
  }
  if (maxDuration !== null && (!game.duration || game.duration.min > maxDuration)) return false;
  if (youngestAge !== null && (game.age === null || game.age > youngestAge)) return false;

  return matchesTags(game, filters.tags);
}

export function applyFilters(games: Game[], filters: Filters): Game[] {
  return games
    .filter((game) => matches(game, filters))
    .sort((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }));
}

export function countActiveFilters(filters: Filters): number {
  const tagCount = Object.values(filters.tags).reduce((sum, list) => sum + list.length, 0);
  return (
    (filters.query.trim() ? 1 : 0) +
    (filters.players !== null ? 1 : 0) +
    (filters.maxDuration !== null ? 1 : 0) +
    (filters.youngestAge !== null ? 1 : 0) +
    (filters.includeExpansions ? 1 : 0) +
    tagCount
  );
}

export type TagCount = { name: string; count: number };

/** Liste les tags d'un groupe présents dans la collection, avec leur nombre de jeux. */
export function collectTags(games: Game[], group: TagGroup): TagCount[] {
  const counts = new Map<string, number>();
  for (const game of games) {
    for (const tag of game[group]) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
}
