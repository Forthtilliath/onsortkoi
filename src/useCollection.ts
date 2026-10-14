import { confirmDestructive } from '@forthtilliath/react-native-kit/utils/helpers/confirmDestructive';
import { successFeedback } from '@forthtilliath/react-native-kit/utils/helpers/haptics';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { backup } from './backupManager';
import { isStandalone } from './domain/filters';
import type { Game } from './domain/types';
import { pickAndImport } from './importFile';
import { loadCollection, saveCollection, type StoredCollection } from './storage';
import { showToast } from './ui/Toast';

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

  const apply = useCallback(async (games: Game[]) => {
    try {
      setCollection(await saveCollection(games));
      backup.notifyDataChanged();
      successFeedback();
      showToast(`Import réussi : ${describe(games)}`);
    } catch {
      Alert.alert('Import impossible', "Une erreur inattendue s'est produite. Rien n'a été modifié.");
    }
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
      if (!collection) {
        await apply(result.games);
        return;
      }
      confirmDestructive('Remplacer la collection ?', () => void apply(result.games), {
        message: `Les ${collection.games.length} jeux actuels seront remplacés par le contenu du fichier.`,
        confirmLabel: 'Remplacer',
      });
    } catch {
      Alert.alert('Import impossible', "Une erreur inattendue s'est produite. Rien n'a été modifié.");
    } finally {
      setImporting(false);
    }
  }, [collection, apply]);

  // Pour une collection déjà enregistrée ailleurs (restauration d'une sauvegarde).
  return { collection, loading, importing, runImport, importGames: apply, replaceCollection: setCollection };
}

function describe(games: Game[]): string {
  const extras = games.filter((g) => !isStandalone(g)).length;
  const base = `${games.length} jeux importés`;
  return extras ? `${base}, dont ${extras} extensions ou accessoires.` : `${base}.`;
}
