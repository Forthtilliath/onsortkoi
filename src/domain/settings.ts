import type { Filters } from './filters';
import type { TagGroup } from './types';

export type Settings = {
  /** Affiche le filtre par catégorie (toutes les catégories de la collection). */
  showCategories: boolean;
  /** Thèmes proposés comme filtres. */
  themes: string[];
  /** Mécanismes proposés comme filtres. */
  mechanisms: string[];
};

export const DEFAULT_SETTINGS: Settings = { showCategories: true, themes: [], mechanisms: [] };

/** Tags proposés dans les filtres pour un groupe, parmi ceux présents dans la collection. */
export function filterableTags(settings: Settings, group: TagGroup, available: string[]): string[] {
  if (group === 'categories') return settings.showCategories ? available : [];
  const chosen = new Set(settings[group]);
  return available.filter((tag) => chosen.has(tag));
}

/** Retire des filtres actifs les tags qui ne sont plus proposés après un changement de réglages. */
export function pruneFilterTags(filters: Filters, settings: Settings): Filters {
  const keep = (group: TagGroup) =>
    group === 'categories'
      ? settings.showCategories
        ? filters.tags.categories
        : []
      : filters.tags[group].filter((tag) => settings[group].includes(tag));
  return {
    ...filters,
    tags: { categories: keep('categories'), themes: keep('themes'), mechanisms: keep('mechanisms') },
  };
}
