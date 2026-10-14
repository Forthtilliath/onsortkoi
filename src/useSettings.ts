import { useCallback, useEffect, useState } from 'react';

import { backup } from './backupManager';
import { DEFAULT_SETTINGS, type Settings } from './domain/settings';
import { loadSettings, saveSettings } from './storage';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const updateSettings = useCallback((next: Settings) => {
    setSettings(next);
    // Échec d'écriture sans gravité : les réglages restent valables pour la session.
    saveSettings(next)
      .then(() => backup.notifyDataChanged())
      .catch(() => {});
  }, []);

  return { settings, updateSettings };
}
