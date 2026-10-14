import type { Range } from './types';

export type DurationKey = 'express' | 'short' | 'medium' | 'long';

/** Tranches de durée, en minutes : bornes `(min, max]`, `max: null` = sans limite. */
export const DURATION_BUCKETS: { key: DurationKey; label: string; hint: string; min: number; max: number | null }[] = [
  { key: 'express', label: 'Express', hint: '30 min max', min: 0, max: 30 },
  { key: 'short', label: 'Courte', hint: '30 min à 1 h', min: 30, max: 60 },
  { key: 'medium', label: 'Moyenne', hint: '1 h à 2 h', min: 60, max: 120 },
  { key: 'long', label: 'Longue', hint: 'Plus de 2 h', min: 120, max: null },
];

/**
 * Le jeu peut-il durer dans l'une des tranches choisies ?
 * Une partie de 45–90 min est à la fois courte et moyenne ; une partie de 60 min est courte.
 */
export function matchesDurations(duration: Range | null, keys: DurationKey[]): boolean {
  if (keys.length === 0) return true;
  if (!duration) return false;
  const gameMax = duration.max ?? Infinity;
  return DURATION_BUCKETS.some(
    (bucket) => keys.includes(bucket.key) && gameMax > bucket.min && duration.min <= (bucket.max ?? Infinity),
  );
}
