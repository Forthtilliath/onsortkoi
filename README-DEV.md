# Onsortkoi — guide développeur

Présentation fonctionnelle de l'app : [README.md](README.md).

## Stack

| Élément | Version / choix |
| --- | --- |
| Expo SDK | 57 (`expo ~57.0.28`), React Native 0.86, React 19.2 |
| Langage | TypeScript 6, mode strict |
| Validation | [zod 4](https://zod.dev), messages en français (`z.locales.fr()`) |
| Stockage | `@react-native-async-storage/async-storage` |
| Fichiers | `expo-file-system` (sélecteur + lecture), `expo-sharing` (menu de partage) |
| Composants partagés | `@forthtilliath/react-native-kit` (`BottomSheet`, `SwitchRow`, `confirmDestructive`) |
| Sauvegarde | `@forthtilliath/expo-backup` (Drive `appDataFolder`, fichier, annulation) + `@forthtilliath/expo-backup-ui` (`BackupScreen`) |
| Tests | Jest 29 + `jest-expo` |
| Cible | **Android uniquement**, identifiant `com.forthtilliath.onsortkoi` |

Pas d'Expo Router : l'app tient sur un seul écran ([App.tsx](App.tsx)) et ouvre des panneaux (filtres, fiche de jeu, réglages) gérés par un état `panel`.

Les dossiers `android/` et `ios/` sont générés (Continuous Native Generation) et ignorés par git : toute configuration native passe par [app.json](app.json) et les plugins de config.

## Démarrer

```bash
npm install
npm start            # serveur Metro, puis « a » pour Android
npm run android      # build natif de debug (expo run:android) sur l'appareil branché
```

Les modules utilisés font partie d'Expo Go : `npm start` suffit tant qu'aucune bibliothèque native n'est ajoutée.

Ajouter une dépendance : toujours `npx expo install <paquet>` (versions compatibles avec le SDK), jamais `npm install <paquet>`.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Jest |
| `npm run check` | typecheck + tests (à lancer avant chaque commit) |
| `npm run lint` | `expo lint` (ESLint, config `eslint-config-expo`) |
| `npx expo-doctor` | diagnostic des dépendances et de la config |

Tester l'import sur un vrai export MyLudo (jamais commité) :

```bash
MYLUDO_EXPORT=/chemin/collection.json npx jest importSchema
```

## Architecture

```
App.tsx                  écran unique : liste, recherche, panneaux
src/
├── domain/              logique pure, sans React ni API native (testée)
│   ├── types.ts         Game, Range, StoredCollection, TagGroup
│   ├── fields.ts        lecture des champs MyLudo (« 2 — 4 », « 10+ », « solo »…) et bornes
│   ├── importSchema.ts  schéma zod de l'export MyLudo → Game[]
│   ├── gameSchema.ts    schéma zod d'un Game, de la collection et des réglages enregistrés
│   ├── backup.ts        format de sauvegarde versionné (création, lecture, nom de fichier)
│   ├── collectionFile.ts accueil : reconnaît un export MyLudo ou une sauvegarde
│   ├── filters.ts       Filters, filtrage, tri, comptage des tags (facettes)
│   ├── durations.ts     tranches de durée et test de chevauchement
│   ├── activeFilters.ts critères actifs → puces { label, clear }
│   ├── settings.ts      réglages, tags proposés, nettoyage des filtres
│   ├── updateCheck.ts   suivi des vérifications de mise à jour (zod)
│   └── __tests__/
├── storage.ts           AsyncStorage + revalidation zod au chargement
├── importFile.ts        sélecteur de fichier, limite de taille, lecture
├── useCollection.ts     chargement, import, remplacement de la collection
├── useSettings.ts       chargement et enregistrement des réglages
├── useGameFilters.ts    filtres en cours, résultats, tags proposés
├── backupManager.ts     gestionnaire expo-backup : collect / parse (readBackup) / apply
├── useFirstImport.ts    accueil : import d'un fichier (MyLudo ou sauvegarde), restauration Drive
├── updates.ts           releases GitHub : version installée, vérification, téléchargement de l'APK
├── components/          écrans et panneaux propres à l'app
│   ├── filters/         SearchBar, FilterSheet, TagFilterRows, ActiveFilterBar
│   └── game/            GameCard, GameTile, GameSheet, libellés
└── ui/                  briques génériques : thème, Sheet, Chip, ChoiceGrid, boutons…
```

Règle de découpage : la logique métier va dans `src/domain/` (fonctions pures, testables sans mock), les accès natifs dans les modules à la racine de `src/`, l'état React dans les hooks `use*`. Pas de fichier de plus de 300 lignes.

### Flux de données

1. **Import** : `pickJsonText` (sélecteur système, fichier `content://` lu directement) → `importCollection` (zod) → `saveCollection` → état de `useCollection`.
2. **Filtrage** : `useGameFilters` combine collection, filtres et réglages. `applyFilters` trie par titre (`localeCompare` en français). `facetTags` compte, pour chaque tag, les jeux retenus par les *autres* critères : c'est le nombre affiché à côté du tag.
3. **Réglages** : un changement passe par `pruneFor`, qui retire des filtres actifs les tags qui ne sont plus proposés. Un tag choisi depuis la fiche d'un jeu reste actif même s'il n'est pas proposé dans les filtres.
4. **Sauvegarde** : `backup` ([backupManager.ts](src/backupManager.ts)), créé avec `createBackupManager`. `serialize` = `createBackup`, `parse` = `readBackup` (zod, le message d'erreur est affiché tel quel), `apply` = `saveBackup` (un seul `multiSet`) puis mise à jour de l'état via `setBackupAppliedListener`. `useCollection` et `useSettings` appellent `backup.notifyDataChanged()` après chaque écriture : envoi sur Drive 3 s plus tard, ou au passage en arrière-plan. `collect` lève une erreur tant qu'aucune collection n'existe : rien n'est envoyé.
5. **Restauration Drive depuis l'accueil** ([useFirstImport.ts](src/useFirstImport.ts)) : `connectCloud` ; en cas de sauvegarde existante (`conflict`), elle est appliquée **avant** `resolveConflict(…, 'cloud')`, car `restore` fait d'abord une copie de sécurité des données locales via `collect`, impossible sur un téléphone vide.

### Règles de filtrage

- Extensions, accessoires et goodies sont exclus sauf si `includeExpansions` ; un `type` vide compte comme un jeu de base.
- Tags : OU dans un groupe, ET entre groupes.
- Durées : un jeu correspond à une tranche si sa plage la chevauche (bornes `(min, max]`).
- Âge : le jeu est gardé si son âge conseillé est inférieur ou égal à l'âge du plus jeune ; un jeu sans âge est exclu dès que le filtre est actif (idem pour joueurs et durée).

## Sécurité des données

Toute donnée venant de l'extérieur ou relue depuis le stockage est validée par zod avant usage :

| Entrée | Schéma | En cas d'anomalie |
| --- | --- | --- |
| Export MyLudo | `importSchema.ts` (par entrée) | fichier entier rejeté, message localisé (n° de jeu, titre, champ) |
| Sauvegarde | en-tête `app` + `version`, puis `backupSchema` | fichier entier rejeté ; version différente refusée |
| AsyncStorage | `storedCollectionSchema`, `settingsSchema`, `updateCheckSchema` | donnée ignorée (collection absente, réglages par défaut) |

- Bornes : 10 Mo par fichier, 5 000 jeux, 100 tags par jeu, 100 caractères par tag, 200 par titre, joueurs ≤ 100, durée ≤ 24 h, âge ≤ 99, notes 0–10, identifiants uniques.
- zod supprime les clés inconnues : les données personnelles de l'export (prix, propriétaire, commentaire…) ne sont jamais enregistrées.
- `gameSchema` reprend les mêmes bornes que l'import : une collection restaurée ne peut pas contenir ce qu'un import aurait refusé.
- Seule permission Android ajoutée : `REQUEST_INSTALL_PACKAGES` (mises à jour intégrées) ; `READ/WRITE_EXTERNAL_STORAGE`, `SYSTEM_ALERT_WINDOW`, `RECORD_AUDIO`, `USE_BIOMETRIC` et `USE_FINGERPRINT` sont dans `blockedPermissions`.

Tout nouvel import (nouveau format, nouveau champ) suit le même modèle : schéma zod par entrée, rejet total à la première anomalie, message affichable.

### Faire évoluer le format de sauvegarde

Le format est versionné (`VERSION` dans [backup.ts](src/domain/backup.ts)). Si `Game` ou `Settings` changent de forme, incrémenter `VERSION` et prévoir la lecture de l'ancienne version (migration) plutôt que de refuser les sauvegardes existantes des utilisateurs. Les clés AsyncStorage (`onsortkoi:*:v1`) suivent la même logique.

## Build et publication

L'APK est construit en local et publié dans les [releases GitHub](https://github.com/Forthtilliath/onsortkoi/releases). Plugins de config de [`@forthtilliath/expo-config-plugins`](https://www.npmjs.com/package/@forthtilliath/expo-config-plugins) :

- `withReleaseSigning` (préfixe `ONSORTKOI`) : la release est signée avec la clé d'upload de l'app, **jamais** avec le `debug.keystore` public de React Native. Sans la clé, `assembleRelease` échoue (« Keystore file not set »).
- `withAndroidAbis` : code natif ARM uniquement (pas d'x86, qui ne sert qu'aux émulateurs).
- `withShortCxxPath` : évite le dépassement de 260 caractères des chemins CMake sous Windows.

La clé, hors du dépôt, est `C:/Users/Forth/keys/onsortkoi-upload.keystore` (alias `onsortkoi-upload`, PKCS12, SHA-1 `3B:26:48:D1:26:D4:0A:3B:BE:70:1D:AE:AD:08:38:62:63:F1:FD:4C`, SHA-256 `7D:64:4F:25:…:56:C7:40:95`). Ses identifiants sont dans `~/.gradle/gradle.properties` :

```properties
ONSORTKOI_UPLOAD_STORE_FILE=C:/Users/Forth/keys/onsortkoi-upload.keystore
ONSORTKOI_UPLOAD_STORE_PASSWORD=...
ONSORTKOI_UPLOAD_KEY_ALIAS=onsortkoi-upload
ONSORTKOI_UPLOAD_KEY_PASSWORD=...
```

**La sauvegarder (fichier + mot de passe) dans un gestionnaire de mots de passe** : la perdre empêche toute mise à jour de l'app installée.

```bash
npx expo prebuild --platform android --clean
cd android && ./gradlew assembleRelease   # → app/build/outputs/apk/release/app-release.apk
```

- Avant chaque version : incrémenter `version` dans [package.json](package.json) et [app.json](app.json), et `android.versionCode`.
- Vérifier la signature : `apksigner verify --print-certs` doit afficher les empreintes ci-dessus.
- Nommer l'APK publié avec l'app et la version : `Onsortkoi-1.0.0.apk`, pas `app-release.apk`.
- Ne jamais changer `android.package` après une première distribution : Android verrait une autre app (pas de mise à jour, données perdues).

## Google Drive (sauvegarde automatique)

Scope `drive.appdata` uniquement (classé « non sensible » par Google) : l'app ne voit que son dossier privé `appDataFolder`, invisible dans l'interface de Drive. Pas de secret dans l'APK : le client OAuth Android est reconnu par le nom de package et l'empreinte de signature.

À faire une fois dans la [console Google Cloud](https://console.cloud.google.com/) :

1. Un projet → **API et services ▸ Bibliothèque** → activer **Google Drive API**.
2. **Écran de consentement OAuth** : externe, ajouter le scope `…/auth/drive.appdata`, s'ajouter comme utilisateur test (ou publier l'app).
3. **Identifiants ▸ Créer un ID client OAuth ▸ Android** : package `com.forthtilliath.onsortkoi`, SHA-1 `3B:26:48:D1:26:D4:0A:3B:BE:70:1D:AE:AD:08:38:62:63:F1:FD:4C` (clé d'upload). Un build debug, signé autrement, demande son propre client.
4. Reconstruire l'APK (module natif `@react-native-google-signin/google-signin`).

`oauth-misconfigured` (DEVELOPER_ERROR) : l'étape 3 ne correspond pas à l'APK. `drive-api-disabled` : étape 1 oubliée. Détails : README de [`@forthtilliath/expo-backup`](https://www.npmjs.com/package/@forthtilliath/expo-backup).

## Mises à jour intégrées

L'app se met à jour depuis les releases GitHub du dépôt (public : aucun jeton dans l'APK), via [`@forthtilliath/expo-release-updates`](https://www.npmjs.com/package/@forthtilliath/expo-release-updates) ([updates.ts](src/updates.ts)) :

- **Au lancement** ([UpdateBanner.tsx](src/components/UpdateBanner.tsx), `UpdateNotifier`) : au plus une vérification toutes les 12 h ; bannière « Installer / Ignorer ». Une version ignorée n'est plus annoncée, la suivante si. Date de vérification et version ignorée : clé `onsortkoi:update-check:v1`, validée par zod ([updateCheck.ts](src/domain/updateCheck.ts)), hors des sauvegardes.
- **Réglages ▸ Mises à jour** (`UpdateSettingsScreen` du kit) : version installée, vérification manuelle, historique des 10 dernières releases.
- La version comparée est `version` d'[app.json](app.json) ; la release la plus récente doit porter un tag `vX.Y.Z` et un asset `.apk` (son nom est libre : `Onsortkoi-X.Y.Z.apk`). Ses notes sont affichées (sous-ensemble Markdown : `### titre`, `- élément`, `**gras**`).

Sécurité : le téléchargement n'accepte qu'une URL `https://github.com`, et Android refuse d'installer un APK qui n'est pas signé avec la même clé que l'app installée. La protection repose donc sur la clé d'upload (hors du dépôt) et sur qui peut publier une release. Permission requise : `REQUEST_INSTALL_PACKAGES` (l'utilisateur doit en plus autoriser l'app comme source d'installation, à la première mise à jour).

## Conventions

- Commits : [Conventional Commits](https://www.conventionalcommits.org) en anglais (`feat:`, `fix:`, `docs:`…), un commit par changement logique.
- Pas de push direct sur `main` : branche dédiée puis pull request, intégrée en **rebase**.
- Textes de l'interface en français, tutoiement.
- Avant d'écrire un composant ou utilitaire générique, vérifier qu'il n'existe pas déjà dans `@forthtilliath/react-native-kit`.
- Les exports MyLudo personnels (`collection*.json`, `myludo*.json`) ne doivent jamais être commités (ignorés par git).
