import { UpdateNotifier } from '@forthtilliath/expo-release-updates-ui/UpdateNotifier';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EMPTY_UPDATE_CHECK, type UpdateCheck } from '../domain/updateCheck';
import { loadUpdateCheck, saveUpdateCheck } from '../storage';
import { updateNotifierStyles } from '../ui/kitStyles';
import { spacing } from '../ui/theme';
import { checkForUpdate, currentVersion, installApk } from '../updates';

/**
 * Au lancement (au plus une fois toutes les 12 h) : annonce une nouvelle version publiée
 * sur GitHub, avec « Installer » (téléchargement puis confirmation Android) ou « Ignorer ».
 */
export function UpdateBanner() {
  const stored = useRef<UpdateCheck>(EMPTY_UPDATE_CHECK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadUpdateCheck().then((check) => {
      stored.current = check;
      setLoaded(true);
    });
  }, []);

  const record = (patch: Partial<UpdateCheck>) => {
    stored.current = { ...stored.current, ...patch };
    // Échec d'écriture sans gravité : au pire, la vérification se refait au prochain lancement.
    saveUpdateCheck(stored.current).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <UpdateNotifier
        enabled={loaded}
        currentVersion={currentVersion}
        checkForUpdate={checkForUpdate}
        getLastCheck={() => stored.current}
        onChecked={(lastCheckedAt) => record({ lastCheckedAt })}
        onDismissVersion={(dismissedVersion) => record({ dismissedVersion })}
        downloadAndInstallApk={installApk}
        styles={updateNotifierStyles}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg },
});
