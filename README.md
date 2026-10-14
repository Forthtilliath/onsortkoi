# Onsortkoi

**Ta ludothèque dans ta poche : le bon jeu pour la soirée, en quelques taps.**

Onsortkoi est une application Android qui reprend ta collection de jeux de société [MyLudo](https://www.myludo.fr) et t'aide à choisir quoi sortir selon la situation : combien vous êtes, combien de temps vous avez, l'âge du plus jeune joueur, l'envie du moment.

Tout fonctionne hors ligne. Seule la sauvegarde automatique, si tu l'actives, envoie une copie sur ton Google Drive.

> Développeurs : voir [README-DEV.md](README-DEV.md).

## Installer l'app

Télécharge le fichier `.apk` de la dernière version sur la page [Releases](https://github.com/Forthtilliath/onsortkoi/releases), ouvre-le sur ton téléphone et autorise l'installation quand Android le demande.

## Démarrer

1. Sur [myludo.fr](https://www.myludo.fr) : *Mon compte → Exporter*, au format **JSON**.
2. Copie le fichier sur ton téléphone (ou dans ton Google Drive).
3. Dans Onsortkoi : **Importer un fichier**, puis choisis le fichier.

Tu utilisais déjà Onsortkoi ? **Restaurer depuis Google Drive** récupère ta sauvegarde automatique (connecte le même compte Google). Un fichier de sauvegarde se restaure aussi avec **Importer un fichier**.

## Trouver un jeu

### Recherche

La barre de recherche filtre par titre et sous-titre, sans tenir compte des accents ni des majuscules.

### Filtres

Le bouton à droite de la recherche ouvre le panneau des filtres. Un badge indique le nombre de critères actifs.

| Filtre | Fonctionnement |
| --- | --- |
| **Nombre de joueurs** | De 1 à 10+. Garde les jeux jouables à ce nombre. |
| **Durée de partie** | Express (30 min max), Courte (30 min à 1 h), Moyenne (1 h à 2 h), Longue (plus de 2 h). Plusieurs choix possibles : un jeu de 45 à 90 min apparaît en Courte comme en Moyenne. |
| **Âge du plus jeune** | 4 à 14 ans. Garde les jeux dont l'âge conseillé ne dépasse pas cet âge. |
| **Extensions et accessoires** | Masqués par défaut ; un interrupteur les affiche. |
| **Catégories, mécanismes, thèmes** | Listes à cocher. Dans un même groupe, il suffit d'un tag (« Coopératif *ou* Deck-building ») ; entre groupes, tous doivent correspondre. |

À côté de chaque tag, un nombre indique combien de jeux resteront si tu le coches, en tenant compte des autres critères. Les tags qui ne donneraient aucun résultat sont masqués.

Sous la recherche, chaque critère actif s'affiche en puce : un tap sur la puce le retire, **Tout effacer** les retire tous (la recherche texte est conservée). Le nombre de jeux trouvés s'affiche à côté.

Un second tap sur une valeur déjà choisie (nombre de joueurs, âge) la désélectionne.

### Fiche d'un jeu

Un tap sur un jeu ouvre sa fiche : joueurs, durée, âge, ta note et la moyenne MyLudo, catégories, mécanismes, thèmes, auteurs et année d'édition.

Un tap sur un tag de la fiche affiche tous les jeux de ta collection qui le portent.

## Réglages

L'icône en haut à droite ouvre les réglages.

- **Filtres proposés** : les catégories sont toutes proposées (désactivables). Les mécanismes et thèmes sont souvent très nombreux : coche seulement ceux qui t'intéressent pour qu'ils apparaissent dans le panneau des filtres.
- **Collection** : nombre de jeux, date d'import, et **Réimporter un export MyLudo** pour mettre à jour la collection après des achats. L'app demande confirmation avant de remplacer la collection.
- **Sauvegarde** : voir ci-dessous.

## Sauvegarde et changement de téléphone

### Sauvegarde automatique (Google Drive)

Dans les réglages, **Connecter Google Drive** relie un compte Google. Ensuite, ta collection et tes réglages y sont envoyés automatiquement après chaque modification (import, réglage changé). Sans réseau, l'envoi attend le prochain lancement.

La copie est rangée dans un dossier privé de l'app : elle n'apparaît pas dans ton Drive, et l'app n'a accès à aucun autre de tes fichiers.

Sur un nouveau téléphone, **Restaurer depuis Google Drive** (écran d'accueil) récupère tout en connectant le même compte. **Déconnecter** arrête les envois ; la copie reste sur Drive.

### Sauvegarde manuelle (fichier)

**Exporter mes données** ouvre le menu de partage Android avec un fichier `Onsortkoi-sauvegarde-AAAA-MM-JJ.json`. **Importer une sauvegarde** le relit, après confirmation, et **Annuler la dernière restauration** remet les données d'avant.

## Confidentialité et sécurité

- **Réseau seulement pour la sauvegarde** : rien n'est envoyé tant que tu ne connectes pas Google Drive. Une fois connecté, seule ta collection et tes réglages partent vers ton propre Drive (accès limité au dossier privé de l'app).
- **Aucune permission sensible** demandée ; l'accès au stockage, au micro et à la superposition d'écran est explicitement bloqué.
- **Données minimales** : seuls les champs utiles sont gardés de l'export MyLudo. Prix d'achat, propriétaire, commentaires et autres données personnelles sont ignorés à l'import.
- **Fichiers vérifiés** : chaque jeu d'un export ou d'une sauvegarde est contrôlé (types, bornes, longueurs ; 10 Mo et 5 000 jeux maximum). À la première anomalie, le fichier entier est refusé avec un message qui indique le jeu et le champ en cause, et **rien n'est modifié**.
- Une sauvegarde créée par une autre version de l'app est refusée plutôt que mal interprétée.

## Limites connues

- Android uniquement.
- Collection en lecture seule : pour ajouter ou modifier un jeu, passe par MyLudo puis réimporte.
- Seul le format d'export JSON de MyLudo est pris en charge.
