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
| Composants partagés | `@forthtilliath/react-native-kit` (`BottomSheet`, `SwitchRow`, `BackupSettingsScreen`, `shareTextFile`, `confirmDestructive`) |
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
│   ├── filters.ts       Filters, filtrage, tri, comptage des tags (facettes)
│   ├── durations.ts     tranches de durée et test de chevauchement
│   ├── activeFilters.ts critères actifs → puces { label, clear }
│   ├── settings.ts      réglages, tags proposés, nettoyage des filtres
│   └── __tests__/
├── storage.ts           AsyncStorage + revalidation zod au chargement
├── importFile.ts        sélecteur de fichier, limite de taille, lecture
├── backupFile.ts        partage et restauration d'une sauvegarde
├── useCollection.ts     chargement, import, remplacement de la collection
├── useSettings.ts       chargement et enregistrement des réglages
├── useGameFilters.ts    filtres en cours, résultats, tags proposés
├── useBackup.ts         export / restauration, alertes
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
4. **Sauvegarde** : `createBackup` → `shareTextFile` (menu de partage). **Restauration** : `pickJsonText` → `readBackup` → `saveBackup` (un seul `multiSet`) → `onRestored`.

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
| AsyncStorage | `storedCollectionSchema`, `settingsSchema` | donnée ignorée (collection absente, réglages par défaut) |

- Bornes : 10 Mo par fichier, 5 000 jeux, 100 tags par jeu, 100 caractères par tag, 200 par titre, joueurs ≤ 100, durée ≤ 24 h, âge ≤ 99, notes 0–10, identifiants uniques.
- zod supprime les clés inconnues : les données personnelles de l'export (prix, propriétaire, commentaire…) ne sont jamais enregistrées.
- `gameSchema` reprend les mêmes bornes que l'import : une collection restaurée ne peut pas contenir ce qu'un import aurait refusé.
- Aucune permission Android ; `READ/WRITE_EXTERNAL_STORAGE`, `SYSTEM_ALERT_WINDOW` et `RECORD_AUDIO` sont dans `blockedPermissions`.

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

## Conventions

- Commits : [Conventional Commits](https://www.conventionalcommits.org) en anglais (`feat:`, `fix:`, `docs:`…), un commit par changement logique.
- Pas de push direct sur `main` : branche dédiée puis pull request, intégrée en **rebase**.
- Textes de l'interface en français, tutoiement.
- Avant d'écrire un composant ou utilitaire générique, vérifier qu'il n'existe pas déjà dans `@forthtilliath/react-native-kit`.
- Les exports MyLudo personnels (`collection*.json`, `myludo*.json`) ne doivent jamais être commités (ignorés par git).
