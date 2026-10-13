import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { isStandalone } from './domain/filters';
import type { Game } from './domain/types';
import { pickAndImport } from './importFile';
import { loadCollection, saveCollection, type StoredCollection } from './storage';

function confirmReplace(count: number): Promise<boolean> {
  return new Promise((resolve) =>
    Alert.alert(
      'Remplacer la collection ?',
      `Les ${count} jeux actuels seront remplacés par le contenu du fichier.`,
      [
        { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Remplacer', style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    ),
  );
}

export function useCollection() {
  const [collection, setCollection] = useState<StoredCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadCollection().then((stored) => {
      setCollection(stored);
      setLoading(false);
    });
  }, []);

  const runImport = useCallback(async () => {
    setImporting(true);
    try {
      const result = await pickAndImport();
      if (!result) return;
      if (!result.ok) {
        Alert.alert('Import impossible', result.error);
        return;
      }
      if (collection && !(await confirmReplace(collection.games.length))) return;

      const saved = await saveCollection(result.games);
      setCollection(saved);
      Alert.alert('Import réussi', describe(result.games));
    } catch {
      Alert.alert('Import impossible', "Une erreur inattendue s'est produite. Rien n'a été modifié.");
    } finally {
      setImporting(false);
    }
  }, [collection]);

  return { collection, loading, importing, runImport };
}

function describe(games: Game[]): string {
  const extras = games.filter((g) => !isStandalone(g)).length;
  const base = `${games.length} jeux importés`;
  return extras ? `${base}, dont ${extras} extensions ou accessoires.` : `${base}.`;
}
