import { formatRange, parseAge, parseDuration, parsePlayers } from '../fields';

describe('parsePlayers', () => {
  it.each([
    ['2 — 4', { min: 2, max: 4 }],
    ['1-5', { min: 1, max: 5 }],
    ['Duo', { min: 2, max: 2 }],
    ['Solo', { min: 1, max: 1 }],
    ['2+', { min: 2, max: null }],
    ['3', { min: 3, max: 3 }],
    [4, { min: 4, max: 4 }],
  ])('lit %p', (raw, expected) => {
    expect(parsePlayers(raw)).toEqual(expected);
  });

  it('retourne null pour une valeur vide', () => {
    expect(parsePlayers('')).toBeNull();
    expect(parsePlayers('  ')).toBeNull();
  });

  it.each(['4 — 2', 'beaucoup', '2 — 999', '-1', '1.5'])('refuse %p', (raw) => {
    expect(parsePlayers(raw)).toBeUndefined();
  });
});

describe('parseDuration', () => {
  it('lit un nombre ou un intervalle', () => {
    expect(parseDuration(30)).toEqual({ min: 30, max: 30 });
    expect(parseDuration('60 — 120')).toEqual({ min: 60, max: 120 });
  });

  it('traite 0 comme non renseigné', () => {
    expect(parseDuration(0)).toBeNull();
  });

  it('refuse une durée négative, décimale ou démesurée', () => {
    expect(parseDuration(-5)).toBeUndefined();
    expect(parseDuration(12.5)).toBeUndefined();
    expect(parseDuration(100000)).toBeUndefined();
  });
});

describe('parseAge', () => {
  it('lit « 10+ » et 10', () => {
    expect(parseAge('10+')).toBe(10);
    expect(parseAge(8)).toBe(8);
    expect(parseAge('')).toBeNull();
    expect(parseAge('dix ans')).toBeUndefined();
  });
});

describe('formatRange', () => {
  it('formate les intervalles', () => {
    expect(formatRange({ min: 2, max: 4 })).toBe('2–4');
    expect(formatRange({ min: 2, max: null })).toBe('2+');
    expect(formatRange({ min: 30, max: 30 }, 'min')).toBe('30 min');
    expect(formatRange(null)).toBeNull();
  });
});
