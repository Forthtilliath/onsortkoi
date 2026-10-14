import { z } from 'zod';

/** Suivi de la vérification des mises à jour : propre au téléphone, hors des sauvegardes. */
export type UpdateCheck = {
  /** Dernière vérification (ms epoch), pour n'interroger GitHub qu'une fois toutes les 12 h. */
  lastCheckedAt: number | null;
  /** Version ignorée par l'utilisateur : plus annoncée, contrairement aux suivantes. */
  dismissedVersion: string | null;
};

export const EMPTY_UPDATE_CHECK: UpdateCheck = { lastCheckedAt: null, dismissedVersion: null };

const updateCheckSchema = z.object({
  lastCheckedAt: z.number().int().nonnegative().nullable(),
  dismissedVersion: z
    .string()
    .max(32)
    .regex(/^v?\d+(\.\d+)*(-[0-9A-Za-z.-]+)?$/)
    .nullable(),
});

/** Relit ce qui a été enregistré : une donnée absente ou invalide repart de zéro. */
export function parseUpdateCheck(raw: string | null): UpdateCheck {
  if (!raw) return EMPTY_UPDATE_CHECK;
  try {
    const result = updateCheckSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : EMPTY_UPDATE_CHECK;
  } catch {
    return EMPTY_UPDATE_CHECK;
  }
}
