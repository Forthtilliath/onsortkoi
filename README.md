# LudoCollec

Application Android (Expo + TypeScript) pour importer sa ludothèque [MyLudo](https://www.myludo.fr) et trouver le bon jeu selon la situation.

## Fonctionnalités

- Import de l'export JSON MyLudo (*Mon compte → Exporter*), conservé sur le téléphone.
- Filtres : titre, nombre de joueurs, temps disponible, âge du plus jeune joueur, catégories, thèmes et mécanismes.
- Extensions et accessoires masqués par défaut.
- Tout fonctionne hors ligne : aucune donnée n'est envoyée.

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
