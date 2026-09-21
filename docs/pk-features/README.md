# Migration PK par fonctionnalité

> **Règle impérative de migration (ne pas inverser le sens).**
>
> La branche de travail doit toujours partir de `upstream/main` (ou du
> dernier tag officiel), puis recevoir les commits/features PK par-dessus :
> `version officielle à jour → réapplication des features PK`.
>
> Il ne faut jamais prendre une branche PK ancienne comme base et y
> cherry-picker les nouveautés officielles. Avant toute reprise, créer une
> branche de sauvegarde, faire `git fetch upstream`, repositionner la branche
> sur `upstream/main`, puis rejouer uniquement les commits PK. Vérifier enfin
> `git log` et `npx tsc --noEmit` avant de déclarer la migration terminée.
