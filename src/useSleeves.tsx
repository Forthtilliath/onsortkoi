import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { backup } from './backupManager';
import type { Sleeve } from './domain/sleeves';
import { loadSleeves, saveSleeves } from './storage';

type SleevesStore = {
  sleeves: Sleeve[];
  /** Applique une modification, l'enregistre et prévient la sauvegarde automatique. */
  change: (transform: (sleeves: Sleeve[]) => Sleeve[]) => void;
  /** Après une restauration : la liste est déjà enregistrée, seule la mémoire suit. */
  replace: (sleeves: Sleeve[]) => void;
};

const SleevesContext = createContext<SleevesStore | null>(null);

export function SleevesProvider({ children }: { children: ReactNode }) {
  const [sleeves, setSleeves] = useState<Sleeve[]>([]);
  // Liste à jour entre deux rendus, pour enchaîner les modifications sans en perdre.
  const current = useRef<Sleeve[]>([]);
  const loaded = useRef(false);

  useEffect(() => {
    loadSleeves().then((stored) => {
      // Une restauration arrivée pendant le chargement a la priorité.
      if (loaded.current) return;
      loaded.current = true;
      current.current = stored;
      setSleeves(stored);
    });
  }, []);

  const replace = useCallback((next: Sleeve[]) => {
    loaded.current = true;
    current.current = next;
    setSleeves(next);
  }, []);

  const change = useCallback(
    (transform: (sleeves: Sleeve[]) => Sleeve[]) => {
      // Avant la fin du chargement, enregistrer écraserait la liste stockée.
      if (!loaded.current) return;
      const next = transform(current.current);
      replace(next);
      saveSleeves(next)
        .then(() => backup.notifyDataChanged())
        .catch(() =>
          Alert.alert('Enregistrement impossible', 'La modification est visible mais sera perdue à la fermeture.'),
        );
    },
    [replace],
  );

  const store = useMemo(() => ({ sleeves, change, replace }), [sleeves, change, replace]);
  return <SleevesContext.Provider value={store}>{children}</SleevesContext.Provider>;
}

export function useSleeves(): SleevesStore {
  const store = useContext(SleevesContext);
  if (!store) throw new Error('useSleeves doit être utilisé sous SleevesProvider.');
  return store;
}
