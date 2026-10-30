import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import type { Sleeve } from './domain/sleeves';
import { backup } from './backupManager';
import { loadSleeves, saveSleeves } from './storage';
import { SleevesContext } from './useSleeves';

export function SleevesProvider({ children }: { children: ReactNode }) {
  const [sleeves, setSleeves] = useState<Sleeve[]>([]);
  // Liste à jour entre deux rendus, pour enchaîner les modifications sans en perdre.
  const currentRef = useRef<Sleeve[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    // loadSleeves ne rejette jamais (liste vide en cas de problème).
    void loadSleeves().then((stored) => {
      // Une restauration arrivée pendant le chargement a la priorité.
      if (loadedRef.current) return;
      loadedRef.current = true;
      currentRef.current = stored;
      setSleeves(stored);
    });
  }, []);

  const replace = useCallback((next: Sleeve[]) => {
    loadedRef.current = true;
    currentRef.current = next;
    setSleeves(next);
  }, []);

  const change = useCallback(
    (transform: (sleeves: Sleeve[]) => Sleeve[]) => {
      // Avant la fin du chargement, enregistrer écraserait la liste stockée.
      if (!loadedRef.current) return;
      const next = transform(currentRef.current);
      replace(next);
      saveSleeves(next)
        .then(() => {
          backup.notifyDataChanged();
        })
        .catch(() => {
          Alert.alert('Enregistrement impossible', 'La modification est visible mais sera perdue à la fermeture.');
        });
    },
    [replace],
  );

  const store = useMemo(() => ({ sleeves, change, replace }), [sleeves, change, replace]);
  return <SleevesContext value={store}>{children}</SleevesContext>;
}
