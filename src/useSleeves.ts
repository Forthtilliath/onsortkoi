import { createContext, use } from 'react';

import type { Sleeve } from './domain/sleeves';

export interface SleevesStore {
  sleeves: Sleeve[];
  /** Applique une modification, l'enregistre et prévient la sauvegarde automatique. */
  change: (transform: (sleeves: Sleeve[]) => Sleeve[]) => void;
  /** Après une restauration : la liste est déjà enregistrée, seule la mémoire suit. */
  replace: (sleeves: Sleeve[]) => void;
}

export const SleevesContext = createContext<SleevesStore | null>(null);

export function useSleeves(): SleevesStore {
  const store = use(SleevesContext);
  if (!store) throw new Error('useSleeves doit être utilisé sous SleevesProvider.');
  return store;
}
