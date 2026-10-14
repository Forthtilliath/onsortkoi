# Onsortkoi

Application Android (Expo + TypeScript) pour importer sa ludothèque [MyLudo](https://www.myludo.fr) et trouver le bon jeu selon la situation.

## Fonctionnalités

- Import de l'export JSON MyLudo (*Mon compte → Exporter*), conservé sur le téléphone.
- Recherche par titre ; filtres (nombre de joueurs, durée, âge du plus jeune joueur, catégories, thèmes et mécanismes) dans un panneau dédié, critères actifs retirables d'un tap.
- Fiche détaillée de chaque jeu.
- Extensions et accessoires masqués par défaut.
- Sauvegarde de la collection et des réglages dans Google Drive (ou ailleurs) via le menu de partage Android, et restauration depuis le sélecteur de fichiers : pratique pour changer de téléphone.
- Tout fonctionne hors ligne : aucune donnée n'est envoyée sans action de ta part.

## Sauvegarde : vérifications

La restauration applique les mêmes règles que l'import : chaque jeu et les réglages sont validés par un schéma zod strict (types, bornes, longueurs), les clés inconnues sont supprimées, et à la première anomalie le fichier entier est rejeté sans rien modifier. Aucun compte Google n'est relié à l'app : c'est Android qui transmet le fichier à Drive.

## Import : vérifications

Chaque jeu du fichier est validé par un schéma [zod](https://zod.dev) (types, bornes, longueurs). À la première anomalie, le fichier entier est rejeté et rien n'est modifié. Seuls les champs utiles sont gardés : les données personnelles de l'export (prix d'achat, propriétaire, commentaire…) sont ignorées.

## Développement

```bash
npm install
npm start          # puis « a » pour Android
npm run check      # typecheck + tests
```

Tester l'import sur un vrai export :

```bash
MYLUDO_EXPORT=/chemin/collection.json npx jest importSchema
```
