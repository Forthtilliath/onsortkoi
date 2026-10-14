import { EMPTY_FILTERS } from '../filters';
import { DEFAULT_SETTINGS, filterableTags, pruneFilterTags } from '../settings';

const settings = { showCategories: true, themes: ['Pirates'], mechanisms: ['Draft', 'Bluff'] };

describe('filterableTags', () => {
  it('propose toutes les catégories si le filtre est activé, aucune sinon', () => {
    expect(filterableTags(settings, 'categories', ['Cartes', 'Plateau'])).toEqual(['Cartes', 'Plateau']);
    expect(filterableTags({ ...settings, showCategories: false }, 'categories', ['Cartes'])).toEqual([]);
  });

  it('ne propose que les mécanismes et thèmes choisis présents dans la collection', () => {
    expect(filterableTags(settings, 'mechanisms', ['Bluff', 'Dés', 'Draft'])).toEqual(['Bluff', 'Draft']);
    expect(filterableTags(settings, 'themes', ['Animaux'])).toEqual([]);
  });

  it("ne propose aucun mécanisme ni thème par défaut", () => {
    expect(filterableTags(DEFAULT_SETTINGS, 'mechanisms', ['Draft'])).toEqual([]);
  });
});

describe('pruneFilterTags', () => {
  it('retire les filtres qui ne sont plus proposés', () => {
    const filters = {
      ...EMPTY_FILTERS,
      players: 3,
      tags: { categories: ['Cartes'], themes: ['Pirates', 'Animaux'], mechanisms: ['Dés'] },
    };
    expect(pruneFilterTags(filters, { ...settings, showCategories: false })).toEqual({
      ...filters,
      tags: { categories: [], themes: ['Pirates'], mechanisms: [] },
    });
  });
});
