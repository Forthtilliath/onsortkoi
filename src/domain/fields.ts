import type { Range } from './types';

// MyLudo sépare les bornes par un tiret cadratin (« 2 — 4 ») ; on accepte aussi – et -.
const RANGE = /^(\d{1,4})\s*[—–-]\s*(\d{1,4})$/;
const OPEN = /^(\d{1,4})\s*\+$/;
const SINGLE = /^(\d{1,4})$/;

/**
 * Lit une valeur d'intervalle MyLudo.
 * Retourne `null` si la valeur est vide, `undefined` si elle est invalide.
 */
function parseRange(raw: string | number, limit: number): Range | null | undefined {
  if (typeof raw === 'number') {
    if (!Number.isInteger(raw) || raw < 0 || raw > limit) return undefined;
    return raw === 0 ? null : { min: raw, max: raw };
  }
  const value = raw.trim();
  if (value === '') return null;

  let match = RANGE.exec(value);
  if (match) {
    const min = Number(match[1]);
    const max = Number(match[2]);
    if (min > max || max > limit) return undefined;
    return { min, max };
  }
  match = OPEN.exec(value);
  if (match) {
    const min = Number(match[1]);
    return min > limit ? undefined : { min, max: null };
  }
  match = SINGLE.exec(value);
  if (match) return parseRange(Number(match[1]), limit);
  return undefined;
}

export const MAX_PLAYERS = 100;
export const MAX_DURATION = 24 * 60;
export const MAX_AGE = 99;

export function parsePlayers(raw: string | number): Range | null | undefined {
  if (typeof raw === 'string') {
    const word = raw.trim().toLowerCase();
    if (word === 'solo') return { min: 1, max: 1 };
    if (word === 'duo') return { min: 2, max: 2 };
  }
  return parseRange(raw, MAX_PLAYERS);
}

export function parseDuration(raw: string | number): Range | null | undefined {
  return parseRange(raw, MAX_DURATION);
}

/** « 10+ », « 10 » ou 10 → 10. */
export function parseAge(raw: string | number): number | null | undefined {
  const range = parseRange(raw, MAX_AGE);
  return range === undefined ? undefined : (range?.min ?? null);
}

export function formatRange(range: Range | null, unit = ''): string | null {
  if (!range) return null;
  const suffix = unit ? ` ${unit}` : '';
  if (range.max === null) return `${range.min}+${suffix}`;
  if (range.min === range.max) return `${range.min}${suffix}`;
  return `${range.min}–${range.max}${suffix}`;
}
