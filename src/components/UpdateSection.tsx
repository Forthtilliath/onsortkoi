import { useCallback, useEffect, useState } from 'react';

import { compareVersions } from '@forthtilliath/expo-release-updates/compareVersions';
import { UpdateSettingsScreen } from '@forthtilliath/react-native-kit/components/settings/UpdateSettingsScreen';

import { loadIncludePrereleases, saveIncludePrereleases } from '../storage';
import { useKitStyles } from '../ui/kitStyles';
import { checkForUpdate, currentVersion, fetchHistory, installApk } from '../updates';

/**
 * Réglages ▸ Mises à jour : version installée, vérification, historique, et choix des versions
 * de test. Rien n'est affiché avant la lecture du choix enregistré, pour ne pas interroger
 * GitHub deux fois (une avec la valeur par défaut, une avec la bonne).
 */
export function UpdateSection() {
  const kit = useKitStyles();
  const [includePrereleases, setIncludePrereleases] = useState<boolean | null>(null);

  useEffect(() => {
    // loadIncludePrereleases ne rejette jamais (désactivé en cas de problème).
    void loadIncludePrereleases().then(setIncludePrereleases);
  }, []);

  const history = useCallback(
    () => fetchHistory({ includePrereleases: includePrereleases ?? false }),
    [includePrereleases],
  );

  if (includePrereleases === null) return null;

  return (
    <UpdateSettingsScreen
      currentVersion={currentVersion}
      checkForUpdate={checkForUpdate}
      compareVersions={compareVersions}
      downloadAndInstallApk={installApk}
      fetchReleaseHistory={history}
      includePrereleases={includePrereleases}
      onIncludePrereleasesChange={(include) => {
        setIncludePrereleases(include);
        saveIncludePrereleases(include).catch(() => {
          /* échec d'écriture sans gravité : le choix reste appliqué jusqu'à la fermeture de l'app */
        });
      }}
      styles={kit.updateScreen}
    />
  );
}
