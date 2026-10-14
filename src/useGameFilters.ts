import { useMemo, useState } from 'react';

import type { TagOption } from './components/filters/TagFilterRows';
import { describeActiveFilters } from './domain/activeFilters';
import { applyFilters, collectTags, EMPTY_FILTERS, facetTags, type Filters } from './domain/filters';
import { filterableTags, pruneFilterTags, type Settings } from './domain/settings';
import type { Game, TagGroup } from './domain/types';

const FILTER_GROUPS: { group: TagGroup; label: string }[] = [
  { group: 'categories', label: 'Catégories' },
  { group: 'mechanisms', label: 'Mécanismes' },
  { group: 'themes', label: 'Thèmes' },
];

/** Filtres en cours, résultats et tags proposés selon les réglages. */
export function useGameFilters(games: Game[] | undefined, settings: Settings) {
  // Les tags non proposés ne sont retirés qu'au changement de réglages (pruneFor) : un tag choisi
  // depuis la fiche d'un jeu reste actif même s'il n'est pas proposé dans les filtres.
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const results = useMemo(() => (games ? applyFilters(games, filters) : []), [games, filters]);
  const criteria = useMemo(() => describeActiveFilters(filters), [filters]);

  const tagOptions = useMemo<TagOption[]>(() => {
    if (!games) return [];
    // Le groupe reste affiché tant que la collection a des tags proposés ou cochés ; dans la liste,
    // seuls les tags sans jeu sous les autres critères sont masqués (sauf s'ils sont cochés).
    return FILTER_GROUPS.flatMap(({ group, label }) => {
      const all = collectTags(games, group);
      const chosen = filters.tags[group];
      const offered = new Set([...filterableTags(settings, group, all.map((t) => t.name)), ...chosen]);
      if (offered.size === 0) return [];
      const counts = new Map(facetTags(games, filters, group).map((t) => [t.name, t.count]));
      const tags = all
        .filter((t) => offered.has(t.name))
        .map((t) => ({ name: t.name, count: counts.get(t.name) ?? 0 }))
        .filter((t) => t.count > 0 || chosen.includes(t.name));
      return [{ group, label, tags }];
    });
  }, [games, settings, filters]);

  /** À appeler après un changement de réglages : retire les tags qui ne sont plus proposés. */
  const pruneFor = (next: Settings) => setFilters((f) => pruneFilterTags(f, next));

  return { filters, setFilters, results, criteria, tagOptions, pruneFor };
}
