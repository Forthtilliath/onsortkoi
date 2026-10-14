import { clearCriteria, describeActiveFilters } from '../activeFilters';
import { EMPTY_FILTERS, type Filters } from '../filters';

const filters = (f: Partial<Filters>): Filters => ({ ...EMPTY_FILTERS, ...f });

describe('describeActiveFilters', () => {
  it("ne compte ni la recherche texte ni les filtres vides", () => {
    expect(describeActiveFilters(filters({ query: 'azul' }))).toEqual([]);
  });

  it('décrit une puce par famille de critère', () => {
    const active = describeActiveFilters(
      filters({
        players: 1,
        durations: ['long', 'express'],
        youngestAge: 8,
        includeExpansions: true,
        tags: { categories: ['Jeu de dés'], mechanisms: ['Coopératif', 'Dés', 'Bluff'], themes: [] },
      }),
    );
    expect(active.map((a) => a.label)).toEqual([
      '1 joueur',
      'Express, Longue',
      'Dès 8 ans',
      'Avec extensions',
      'Jeu de dés',
      'Coopératif +2',
    ]);
  });

  it("affiche l'indication d'une tranche de durée seule", () => {
    expect(describeActiveFilters(filters({ durations: ['short'] }))[0].label).toBe('30 min à 1 h');
  });

  it('retire toute la famille du critère', () => {
    const start = filters({
      players: 3,
      durations: ['short', 'medium'],
      tags: { categories: ['A', 'B'], mechanisms: ['C'], themes: [] },
    });
    const [players, durations, categories] = describeActiveFilters(start);
    expect(players.clear(start)).toEqual({ ...start, players: null });
    expect(durations.clear(start).durations).toEqual([]);
    expect(categories.clear(start).tags).toEqual({ categories: [], mechanisms: ['C'], themes: [] });
  });
});

describe('clearCriteria', () => {
  it('efface les critères en gardant la recherche', () => {
    expect(clearCriteria(filters({ query: 'azul', players: 2 }))).toEqual(filters({ query: 'azul' }));
  });
});
