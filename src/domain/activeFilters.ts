import { DURATION_BUCKETS } from './durations';
import { EMPTY_FILTERS, type Filters } from './filters';
import type { TagGroup } from './types';

export type ActiveFilter = {
  key: string;
  label: string;
  /** Retire ce critère (toute sa famille : toutes les durées, tous les mécanismes…). */
  clear: (filters: Filters) => Filters;
};

const TAG_GROUPS: TagGroup[] = ['categories', 'mechanisms', 'themes'];

/**
 * Critères actifs hors recherche texte (déjà visible), une puce par famille pour rester compact :
 * « Coopératif +4 » plutôt que cinq puces de mécanismes.
 */
export function describeActiveFilters(filters: Filters): ActiveFilter[] {
  const { players, youngestAge } = filters;
  const active: ActiveFilter[] = [];

  if (players !== null) {
    active.push({
      key: 'players',
      label: `${players} joueur${players > 1 ? 's' : ''}`,
      clear: (f) => ({ ...f, players: null }),
    });
  }
  const buckets = DURATION_BUCKETS.filter((bucket) => filters.durations.includes(bucket.key));
  if (buckets.length > 0) {
    active.push({
      key: 'durations',
      label: buckets.length === 1 ? buckets[0].hint : buckets.map((b) => b.label).join(', '),
      clear: (f) => ({ ...f, durations: [] }),
    });
  }
  if (youngestAge !== null) {
    active.push({
      key: 'youngestAge',
      label: `Dès ${youngestAge} ans`,
      clear: (f) => ({ ...f, youngestAge: null }),
    });
  }
  if (filters.includeExpansions) {
    active.push({
      key: 'includeExpansions',
      label: 'Avec extensions',
      clear: (f) => ({ ...f, includeExpansions: false }),
    });
  }
  for (const group of TAG_GROUPS) {
    const [first, ...others] = filters.tags[group];
    if (first === undefined) continue;
    active.push({
      key: group,
      label: others.length ? `${first} +${others.length}` : first,
      clear: (f) => ({ ...f, tags: { ...f.tags, [group]: [] } }),
    });
  }
  return active;
}

/** Efface tous les critères mais garde la recherche texte en cours. */
export const clearCriteria = (filters: Filters): Filters => ({ ...EMPTY_FILTERS, query: filters.query });
