import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_SETTINGS, type Settings } from './domain/settings';
import { backup } from './backupManager';
import { loadSettings, saveSettings } from './storage';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // loadSettings ne rejette jamais (réglages par défaut en cas de problème).
    void loadSettings().then(setSettings);
  }, []);

  const updateSettings = useCallback((next: Settings) => {
    setSettings(next);
    saveSettings(next)
      .then(() => {
        backup.notifyDataChanged();
      })
      .catch(() => {
        /* échec d'écriture sans gravité : les réglages restent valables pour la session */
      });
  }, []);

  return { settings, updateSettings };
}
