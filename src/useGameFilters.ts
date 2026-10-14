import { useMemo, useState } from 'react';

import type { TagOption } from './components/filters/TagFilterRows';
import { describeActiveFilters } from './domain/activeFilters';
import { applyFilters, collectTags, EMPTY_FILTERS, type Filters } from './domain/filters';
import { filterableTags, pruneFilterTags, type Settings } from './domain/settings';
import type { Game, TagGroup } from './domain/types';

const FILTER_GROUPS: { group: TagGroup; label: string }[] = [
  { group: 'categories', label: 'Catégories' },
  { group: 'mechanisms', label: 'Mécanismes' },
  { group: 'themes', label: 'Thèmes' },
];

/** Filtres en cours, résultats et tags proposés selon les réglages. */
export function useGameFilters(games: Game[] | undefined, settings: Settings) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const activeFilters = useMemo(() => pruneFilterTags(filters, settings), [filters, settings]);
  const results = useMemo(() => (games ? applyFilters(games, activeFilters) : []), [games, activeFilters]);
  const criteria = useMemo(() => describeActiveFilters(activeFilters), [activeFilters]);

  const tagOptions = useMemo<TagOption[]>(() => {
    if (!games) return [];
    return FILTER_GROUPS.map(({ group, label }) => {
      const all = collectTags(games, group);
      const offered = new Set(filterableTags(settings, group, all.map((t) => t.name)));
      return { group, label, tags: all.filter((t) => offered.has(t.name)) };
    }).filter((option) => option.tags.length > 0);
  }, [games, settings]);

  /** À appeler après un changement de réglages : retire les tags qui ne sont plus proposés. */
  const pruneFor = (next: Settings) => setFilters((f) => pruneFilterTags(f, next));

  return { filters: activeFilters, setFilters, results, criteria, tagOptions, pruneFor };
}
