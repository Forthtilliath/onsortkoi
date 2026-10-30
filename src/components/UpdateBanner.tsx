import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { UpdateNotifier } from '@forthtilliath/expo-release-updates-ui/UpdateNotifier';

import { EMPTY_UPDATE_CHECK, type UpdateCheck } from '../domain/updateCheck';
import { loadUpdateCheck, saveUpdateCheck } from '../storage';
import { useKitStyles } from '../ui/kitStyles';
import { spacing } from '../ui/theme';
import { checkForUpdateOnLaunch, currentVersion, installApk } from '../updates';

/**
 * Au lancement (au plus une fois toutes les 12 h) : annonce une nouvelle version publiée
 * sur GitHub, avec « Installer » (téléchargement puis confirmation Android) ou « Ignorer ».
 */
export function UpdateBanner() {
  const kit = useKitStyles();
  const storedRef = useRef<UpdateCheck>(EMPTY_UPDATE_CHECK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // loadUpdateCheck ne rejette jamais (état vide en cas de problème).
    void loadUpdateCheck().then((check) => {
      storedRef.current = check;
      setLoaded(true);
    });
  }, []);

  const record = (patch: Partial<UpdateCheck>) => {
    storedRef.current = { ...storedRef.current, ...patch };
    saveUpdateCheck(storedRef.current).catch(() => {
      /* échec d'écriture sans gravité : au pire, la vérification se refait au prochain lancement */
    });
  };

  return (
    <View style={styles.container}>
      <UpdateNotifier
        enabled={loaded}
        currentVersion={currentVersion}
        checkForUpdate={checkForUpdateOnLaunch}
        getLastCheck={() => storedRef.current}
        onChecked={(lastCheckedAt) => {
          record({ lastCheckedAt });
        }}
        onDismissVersion={(dismissedVersion) => {
          record({ dismissedVersion });
        }}
        downloadAndInstallApk={installApk}
        styles={kit.updateNotifier}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg },
});
