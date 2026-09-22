# 28 — Updater à deux axes et notification après relance

**Catégorie :** 🔄 Mises à jour  
**Audit 0.1.53 :** 🔧 PORT  
**Note d audit :** Updater natif mono-axe (plugin-updater) ; port pkUpdateDialog + sync-pk-update.sh + releaseNotes.ts

**Statut :** pending  
**Lot historique :** 21

## Fonction et raison

L’utilisateur doit savoir ce qui vient de MonoCode officiel et ce qui vient de PK, puis voir ce qui
a été installé après le redémarrage.

## Spécifications fonctionnelles

- Deux panneaux : officiel et MonoCode PK.
- Conservation du WIP et refus d’écraser un arbre sale.
- Journal explicite des conflits et échecs.
- Notification persistée avant arrêt, avec version, nouveautés et bouton Redémarrer.

## Impacts et diff

Comparer updater, update dialogs, release notes, app lifecycle et `scripts/sync-pk-update.sh`.
Zones V44 : `src/lib/updater.ts`, `src/lib/pkUpdateDialog.ts`, `src/chrome/WhatsNewDialog.tsx`.

## Migration

Fusionner la mécanique officielle d’abord, puis conserver le calcul PK séparé. Tester succès,
annulation, conflit, relance et notification réellement visible.

