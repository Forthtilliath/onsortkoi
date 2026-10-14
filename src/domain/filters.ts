import { type DurationKey, matchesDurations } from './durations';
import type { Game, TagGroup } from './types';

export type Filters = {
  query: string;
  players: number | null;
  /** Tranches de durée acceptées (OU) ; vide = toutes. */
  durations: DurationKey[];
  /** Âge du plus jeune joueur : l'âge conseillé du jeu ne doit pas le dépasser. */
  youngestAge: number | null;
  includeExpansions: boolean;
  tags: Record<TagGroup, string[]>;
};

export const EMPTY_FILTERS: Filters = {
  query: '',
  players: null,
  durations: [],
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

  const { players, youngestAge } = filters;
  if (players !== null) {
    const range = game.players;
    if (!range || players < range.min || (range.max !== null && players > range.max)) return false;
  }
  if (!matchesDurations(game.duration, filters.durations)) return false;
  if (youngestAge !== null && (game.age === null || game.age > youngestAge)) return false;

  return matchesTags(game, filters.tags);
}

export function applyFilters(games: Game[], filters: Filters): Game[] {
  return games
    .filter((game) => matches(game, filters))
    .sort((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }));
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

/**
 * Compte les tags d'un groupe parmi les jeux retenus par les autres critères
 * (extensions comprises) : c'est le nombre de jeux visibles si on coche ce seul tag.
 */
export function facetTags(games: Game[], filters: Filters, group: TagGroup): TagCount[] {
  const others: Filters = { ...filters, tags: { ...filters.tags, [group]: [] } };
  return collectTags(
    games.filter((game) => matches(game, others)),
    group,
  );
}
