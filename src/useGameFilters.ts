import { useDeferredValue, useMemo, useState } from 'react';

import type { TagOption } from './components/filters/TagFilterRows';
import { describeActiveFilters } from './domain/activeFilters';
import { buildSearchIndex, collectTags, EMPTY_FILTERS, facetTags, type Filters, filterGames } from './domain/filters';
import { type SortKey, sortGames } from './domain/listing';
import { filterableTags, pruneFilterTags, type Settings } from './domain/settings';
import type { Game, TagGroup } from './domain/types';

const FILTER_GROUPS: { group: TagGroup; label: string }[] = [
  { group: 'categories', label: 'Catégories' },
  { group: 'mechanisms', label: 'Mécanismes' },
  { group: 'themes', label: 'Thèmes' },
];

/**
 * Filtres en cours, tri, résultats et tags proposés selon les réglages.
 * `facetsVisible` : le panneau des filtres est ouvert, ses compteurs de tags doivent être à jour.
 */
export function useGameFilters(games: Game[] | undefined, settings: Settings, facetsVisible: boolean) {
  // Les tags non proposés ne sont retirés qu'au changement de réglages (pruneFor) : un tag choisi
  // depuis la fiche d'un jeu reste actif même s'il n'est pas proposé dans les filtres.
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>('title');

  // Calculés une fois par collection (ou par tri), pas à chaque frappe ni à chaque critère.
  const index = useMemo(() => (games ? buildSearchIndex(games) : null), [games]);
  const sorted = useMemo(() => (games ? sortGames(games, sort) : []), [games, sort]);

  // La saisie reste fluide : la liste suit la recherche dès que le téléphone a le temps.
  const deferredFilters = useDeferredValue(filters);
  const results = useMemo(
    () => (index ? filterGames(sorted, deferredFilters, index) : []),
    [sorted, deferredFilters, index],
  );
  const criteria = useMemo(() => describeActiveFilters(filters), [filters]);

  // Les compteurs de tags (3 passes sur la collection) ne suivent les filtres que panneau ouvert :
  // fermé, il garde ses dernières valeurs, pour ne pas changer pendant son animation de fermeture.
  const [facetFilters, setFacetFilters] = useState(filters);
  if (facetsVisible && facetFilters !== filters) setFacetFilters(filters);

  const tagOptions = useMemo<TagOption[]>(() => {
    if (!games) return [];
    // Le groupe reste affiché tant que la collection a des tags proposés ou cochés ; dans la liste,
    // seuls les tags sans jeu sous les autres critères sont masqués (sauf s'ils sont cochés).
    return FILTER_GROUPS.flatMap(({ group, label }) => {
      const all = collectTags(games, group);
      const chosen = facetFilters.tags[group];
      const offered = new Set([...filterableTags(settings, group, all.map((t) => t.name)), ...chosen]);
      if (offered.size === 0) return [];
      const counts = new Map(facetTags(games, facetFilters, group, index ?? undefined).map((t) => [t.name, t.count]));
      const tags = all
        .filter((t) => offered.has(t.name))
        .map((t) => ({ name: t.name, count: counts.get(t.name) ?? 0 }))
        .filter((t) => t.count > 0 || chosen.includes(t.name));
      return [{ group, label, tags }];
    });
  }, [games, settings, facetFilters, index]);

  /** À appeler après un changement de réglages : retire les tags qui ne sont plus proposés. */
  const pruneFor = (next: Settings) => setFilters((f) => pruneFilterTags(f, next));

  return { filters, setFilters, sort, setSort, results, criteria, tagOptions, pruneFor };
}
