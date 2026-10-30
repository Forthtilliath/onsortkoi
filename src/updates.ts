import Constants from 'expo-constants';

import { downloadAndInstallApk } from '@forthtilliath/expo-release-updates/downloadAndInstallApk';
import {
  fetchLatestRelease,
  fetchReleaseHistory,
  releaseDownloadUrlPrefix,
} from '@forthtilliath/expo-release-updates/githubReleases';

/**
 * Mises à jour depuis les releases GitHub (dépôt public : aucun jeton embarqué dans l'APK).
 * Le téléchargement n'accepte que les releases de ce dépôt, l'APK doit correspondre au SHA-256
 * calculé par GitHub, et Android refuse d'installer un APK qui n'est pas signé avec la même clé
 * que l'app installée.
 */
const REPO = { owner: 'Forthtilliath', repo: 'onsortkoi' } as const;

export const currentVersion = Constants.expoConfig?.version ?? '0.0.0';

/** Une release sans SHA-256, ou hors de ce dépôt, n'est pas proposée : l'installation la refuserait. */
export const checkForUpdate = () => fetchLatestRelease({ ...REPO, requireVerifiedApk: true });

export const fetchHistory = () => fetchReleaseHistory({ ...REPO, limit: 10 });

export const installApk = (apkUrl: string, onProgress?: (fraction: number) => void, apkSha256?: string) =>
  downloadAndInstallApk({
    apkUrl,
    fileName: 'Onsortkoi-update.apk',
    onProgress,
    expectedSha256: apkSha256,
    allowedUrlPrefix: releaseDownloadUrlPrefix(REPO),
  });
