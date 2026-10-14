import { downloadAndInstallApk } from '@forthtilliath/expo-release-updates/downloadAndInstallApk';
import { fetchLatestRelease, fetchReleaseHistory } from '@forthtilliath/expo-release-updates/githubReleases';
import Constants from 'expo-constants';

/**
 * Mises à jour depuis les releases GitHub (dépôt public : aucun jeton embarqué dans l'APK).
 * Le téléchargement n'accepte que `https://github.com`, et Android refuse d'installer un APK
 * qui n'est pas signé avec la même clé que l'app installée.
 */
const REPO = { owner: 'Forthtilliath', repo: 'onsortkoi' } as const;

export const currentVersion = Constants.expoConfig?.version ?? '0.0.0';

export const checkForUpdate = () => fetchLatestRelease(REPO);

export const fetchHistory = () => fetchReleaseHistory({ ...REPO, limit: 10 });

export const installApk = (apkUrl: string, onProgress?: (fraction: number) => void) =>
  downloadAndInstallApk({ apkUrl, fileName: 'Onsortkoi-update.apk', onProgress });
