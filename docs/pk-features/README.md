# Migration PK par fonctionnalité

La base amont est configurable avec `PK_FEATURE_BASE`. Elle peut être un tag, une branche ou un SHA. La base de cette reprise est `v0.1.50` (`c985fb2657e8f7289935f66a93d23e4e8d956221`).

Une fiche décrit une fonctionnalité observable, ses fichiers, les adaptations PK, ses tests et son scénario manuel. Le catalogue initial contient 23 features ; ce nombre peut évoluer si l’audit découvre une fonctionnalité distincte. Ce n’est pas un pourcentage des lignes de code ni une certification de tous les écarts du fork.

## Avancement

```bash
node scripts/pk-features.mjs
node scripts/pk-features.mjs check 04
node scripts/pk-features.mjs diff 04
node scripts/pk-features.mjs patch 08 > feature-08.patch
node scripts/pk-features.mjs apply 08
node scripts/pk-features.mjs audit
PK_FEATURE_BASE=upstream/main node scripts/pk-features.mjs audit
```

Le compteur est calculé depuis les fiches. `audit` signale les fichiers divergents non rattachés et ceux partagés entre plusieurs features. `check` ne déclare jamais un test manuel réussi.

| Statut | Signification |
|---|---|
| `pending` | Inventorié ; compatibilité à vérifier |
| `ported` | Code raccordé ; vérifications incomplètes |
| `verified` | Tests concernés et vérification de compilation réussis ; preuves consignées |
| `manual` | Vérifications précédentes et scénario réellement testé dans l’application |

## Boucle pour chaque migration

1. Fixer le tag officiel et préserver la version quotidienne. Pour la prochaine migration, créer une branche depuis le nouveau tag puis reporter les features PK identifiées, avec leurs dépendances.
2. Reprendre les fiches, remettre leurs statuts à `pending` pour la nouvelle version et examiner les écarts. Une fiche reste utile même si son diff ne s’applique plus.
3. Porter une feature et ses appels, exécuter ses vérifications, noter les preuves et les limites.
4. Créer un commit par feature lorsque ses modifications sont séparables. Les fichiers partagés demandent une sélection des changements ; ne jamais inclure silencieusement les autres features.
5. Construire un palier Dev utilisable, puis suivre les scénarios manuels de ses fiches. Certaines features dépendent du même socle : les regrouper explicitement dans le palier.
6. Après les paliers : suite complète, build natif, DMG et contrôle de lancement. Publier seulement après validation de la livraison.

## Diff et patch

Git applique un patch à partir du contexte, pas seulement d’un numéro de ligne. Beaucoup de reports restent automatiques. Un agent est utile lorsque les API ou comportements ont changé, mais n’est pas requis pour chaque mise à jour.

`diff ID` produit le diff technique entre la base choisie et l’arbre courant, y compris les changements des autres features qui partagent ces fichiers. Pour un patch réellement autonome, exporter le commit isolé de la feature avec `git format-patch`. Ne pas appliquer successivement des diffs contenant les mêmes changements.

`patch ID` produit le même diff au format Git utilisable. Le script déclare `auto` quand aucun fichier de la fiche n’est partagé avec une autre fiche ; dans ce cas `apply ID` vérifie puis applique avec `git apply --3way`. Il déclare `contextual` dès qu’un fichier est partagé, et bloque `apply` pour forcer la revue. Cette règle est volontairement conservatrice : un patch peut être techniquement applicable tout en embarquant les changements d’une autre feature dans le même fichier.

## Limite du palier actuel

La branche reprise contenait déjà une intégration partielle. Elle n’est pas reconstruite rétroactivement comme une série de 23 commits indépendants. Le premier palier doit rétablir la compilation et les raccords communs ; les fiches permettent ensuite de vérifier et tester chaque comportement séparément. Aucun scénario manuel n’est déclaré réussi sans observation dans l’application.
