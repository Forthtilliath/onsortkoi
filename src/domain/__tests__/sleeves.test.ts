import {
  adjustStock,
  formatLabel,
  groupByFormat,
  linkGame,
  MAX_STOCK,
  parseCount,
  parseMillimeters,
  removeSleeve,
  saveSleeve,
  type Sleeve,
  sleevesForGame,
  sleevesSchema,
  unlinkGame,
} from '../sleeves';

const sleeve = (overrides: Partial<Sleeve> = {}): Sleeve => ({
  id: 1,
  name: 'Mayday Premium',
  width: 63.5,
  height: 88,
  stock: 100,
  games: [],
  ...overrides,
});

const AEONS_END = 191189;

describe('parseMillimeters', () => {
  it.each([
    ['63,5', 63.5],
    ['63.5', 63.5],
    [' 88 ', 88],
    ['41', 41],
  ])('lit « %s »', (text, expected) => {
    expect(parseMillimeters(text)).toBe(expected);
  });

  it.each(['', 'abc', '63,55', '5', '400', '-63', '63,5 mm', '1e2'])('refuse « %s »', (text) => {
    expect(parseMillimeters(text)).toBeNull();
  });
});

describe('parseCount', () => {
  it('lit un entier positif', () => {
    expect(parseCount(' 150 ')).toBe(150);
    expect(parseCount('0')).toBe(0);
  });

  it.each(['', '-3', '2,5', '100000', 'dix'])('refuse « %s »', (text) => {
    expect(parseCount(text)).toBeNull();
  });
});

describe('formatLabel', () => {
  it('écrit le format avec une virgule décimale', () => {
    expect(formatLabel({ width: 63.5, height: 88 })).toBe('63,5 × 88 mm');
  });
});

describe('groupByFormat', () => {
  it('regroupe par format, du plus petit au plus grand, avec le stock total', () => {
    const groups = groupByFormat([
      sleeve({ id: 1, name: 'Transparent', stock: 100 }),
      sleeve({ id: 2, name: 'Mini euro', width: 45, height: 68, stock: 12 }),
      sleeve({ id: 3, name: 'Fond jaune', stock: 30 }),
    ]);
    expect(groups.map((g) => [g.key, g.stock, g.sleeves.map((s) => s.name)])).toEqual([
      ['45x68', 12, ['Mini euro']],
      ['63.5x88', 130, ['Fond jaune', 'Transparent']],
    ]);
  });
});

describe('sleevesForGame', () => {
  it('liste tous les produits utilisés par un jeu, avec leur note', () => {
    const sleeves = [
      sleeve({ id: 1, name: 'Fond violet', games: [{ gameId: AEONS_END, note: 'némésis' }] }),
      sleeve({ id: 2, name: 'Transparent', games: [{ gameId: 42, note: '' }] }),
      sleeve({ id: 3, name: 'Fond jaune', games: [{ gameId: AEONS_END, note: '' }] }),
    ];
    expect(sleevesForGame(sleeves, AEONS_END).map(({ sleeve: s, note }) => [s.name, note])).toEqual([
      ['Fond jaune', ''],
      ['Fond violet', 'némésis'],
    ]);
  });
});

describe('saveSleeve', () => {
  it('ajoute un produit avec un nouvel identifiant, format mis en portrait', () => {
    const result = saveSleeve([sleeve({ id: 4 })], { name: '  Tarot ', width: 120, height: 70, stock: 50 });
    expect(result.id).toBe(5);
    expect(result.sleeves[1]).toEqual({ id: 5, name: 'Tarot', width: 70, height: 120, stock: 50, games: [] });
  });

  it('modifie un produit en gardant ses jeux associés', () => {
    const games = [{ gameId: AEONS_END, note: '' }];
    const result = saveSleeve([sleeve({ games })], { name: 'Mayday', width: 63.5, height: 88, stock: 20 }, 1);
    expect(result.sleeves).toEqual([sleeve({ name: 'Mayday', stock: 20, games })]);
  });
});

describe('stock', () => {
  it('ajoute et retire sans descendre sous 0 ni dépasser le maximum', () => {
    expect(adjustStock([sleeve()], 1, -30)[0].stock).toBe(70);
    expect(adjustStock([sleeve()], 1, -500)[0].stock).toBe(0);
    expect(adjustStock([sleeve()], 1, MAX_STOCK)[0].stock).toBe(MAX_STOCK);
  });
});

describe('associations', () => {
  it('associe un jeu, met sa note à jour sans doublon, puis le retire', () => {
    let sleeves = linkGame([sleeve()], 1, AEONS_END, ' jaune : joueur 1 ');
    expect(sleeves[0].games).toEqual([{ gameId: AEONS_END, note: 'jaune : joueur 1' }]);
    sleeves = linkGame(sleeves, 1, AEONS_END, '');
    expect(sleeves[0].games).toEqual([{ gameId: AEONS_END, note: '' }]);
    expect(unlinkGame(sleeves, 1, AEONS_END)[0].games).toEqual([]);
  });

  it('supprime un produit', () => {
    expect(removeSleeve([sleeve({ id: 1 }), sleeve({ id: 2 })], 1).map((s) => s.id)).toEqual([2]);
  });
});

describe('sleevesSchema', () => {
  it('accepte une liste valide et supprime les clés inconnues', () => {
    const result = sleevesSchema.safeParse([{ ...sleeve(), prix: 9.9 }]);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([sleeve()]);
  });

  it.each<[string, Partial<Sleeve> | Record<string, unknown>]>([
    ['un nom vide', { name: ' ' }],
    ['un nom trop long', { name: 'x'.repeat(61) }],
    ['un format trop petit', { width: 5 }],
    ['un format au centième', { width: 63.55 }],
    ['un format en paysage', { width: 88, height: 63.5 }],
    ['un stock négatif', { stock: -1 }],
    ['un stock décimal', { stock: 2.5 }],
    ['une note trop longue', { games: [{ gameId: 1, note: 'x'.repeat(101) }] }],
    ['un jeu associé en double', { games: [{ gameId: 1, note: '' }, { gameId: 1, note: 'b' }] }],
    ['un identifiant de jeu invalide', { games: [{ gameId: -1, note: '' }] }],
  ])('refuse %s', (_label, overrides) => {
    expect(sleevesSchema.safeParse([{ ...sleeve(), ...overrides }]).success).toBe(false);
  });

  it('refuse deux produits de même identifiant', () => {
    expect(sleevesSchema.safeParse([sleeve(), sleeve({ name: 'Autre' })]).success).toBe(false);
  });
});
