import { type DurationKey, matchesDurations } from './durations';
import type { Game, Range, TagGroup } from './types';

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

/** Dernier choix du filtre joueurs, « 10+ » : 10 joueurs ou plus. */
export const PLAYERS_OR_MORE = 10;

/** « 3 joueurs », « 10+ joueurs ». */
export function playersLabel(players: number): string {
  const plus = players >= PLAYERS_OR_MORE ? '+' : '';
  return `${players}${plus} joueur${players > 1 ? 's' : ''}`;
}

/** Types jouables seuls ; un type vide (non renseigné) est traité comme un jeu de base. */
const STANDALONE_TYPES = new Set(['', 'basegame', 'standalone']);

/**
 * Filtres qui montrent tous les jeux portant un tag : les autres critères et la recherche sont
 * effacés, seul le choix d'afficher les extensions est conservé.
 */
export function filtersForTag(current: Filters, group: TagGroup, tag: string): Filters {
  return {
    ...EMPTY_FILTERS,
    includeExpansions: current.includeExpansions,
    tags: { ...EMPTY_FILTERS.tags, [group]: [tag] },
  };
}

export const isStandalone = (game: Game) => STANDALONE_TYPES.has(game.type);

export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

// Un seul comparateur réutilisé : `localeCompare` avec une langue en recrée un à chaque appel (lent sur Hermes).
const collator = new Intl.Collator('fr', { sensitivity: 'base' });

/** Ordre alphabétique français, sans tenir compte de la casse ni des accents. */
export const compareText = (a: string, b: string) => collator.compare(a, b);

export const byTitle = (a: Game, b: Game) => compareText(a.title, b.title);

/** Texte où porte la recherche : titre et sous-titre, normalisés. */
export const searchText = (game: Game) => normalize(`${game.title} ${game.subtitle}`);

/** Texte de recherche de chaque jeu, calculé une fois par collection plutôt qu'à chaque frappe. */
export type SearchIndex = Map<Game, string>;

export const buildSearchIndex = (games: Game[]): SearchIndex => new Map(games.map((game) => [game, searchText(game)]));

function playable(range: Range | null, players: number): boolean {
  if (!range) return false;
  const max = range.max ?? Infinity;
  // « 10+ » : le jeu doit accepter au moins 10 joueurs, quel que soit son minimum.
  if (players >= PLAYERS_OR_MORE) return max >= players;
  return players >= range.min && players <= max;
}

function matchesTags(game: Game, tags: Filters['tags']): boolean {
  // Dans un même groupe : au moins un tag (OU) ; entre groupes : tous (ET).
  return (Object.keys(tags) as TagGroup[]).every((group) => {
    const wanted = tags[group];
    return wanted.length === 0 || wanted.some((tag) => game[group].includes(tag));
  });
}

/** Test d'un jeu contre les filtres ; la recherche n'est normalisée qu'une fois. */
export function createMatcher(filters: Filters, index?: SearchIndex): (game: Game) => boolean {
  const query = normalize(filters.query);
  const { players, durations, youngestAge, includeExpansions, tags } = filters;

  return (game) => {
    if (!includeExpansions && !isStandalone(game)) return false;
    if (query && !(index?.get(game) ?? searchText(game)).includes(query)) return false;
    if (players !== null && !playable(game.players, players)) return false;
    if (!matchesDurations(game.duration, durations)) return false;
    if (youngestAge !== null && (game.age === null || game.age > youngestAge)) return false;
    return matchesTags(game, tags);
  };
}

/** Jeux retenus, dans l'ordre reçu (la collection est triée une seule fois, en amont). */
export const filterGames = (games: Game[], filters: Filters, index?: SearchIndex): Game[] =>
  games.filter(createMatcher(filters, index));

/** Jeux retenus, triés par titre. */
export const applyFilters = (games: Game[], filters: Filters): Game[] => filterGames(games, filters).sort(byTitle);

export type TagCount = { name: string; count: number };

/** Liste les tags d'un groupe présents dans la collection, avec leur nombre de jeux. */
export function collectTags(games: Game[], group: TagGroup): TagCount[] {
  const counts = new Map<string, number>();
  for (const game of games) {
    for (const tag of game[group]) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => compareText(a.name, b.name));
}

/**
 * Compte les tags d'un groupe parmi les jeux retenus par les autres critères
 * (extensions comprises) : c'est le nombre de jeux visibles si on coche ce seul tag.
 */
export function facetTags(games: Game[], filters: Filters, group: TagGroup, index?: SearchIndex): TagCount[] {
  const others: Filters = { ...filters, tags: { ...filters.tags, [group]: [] } };
  return collectTags(filterGames(games, others, index), group);
}
