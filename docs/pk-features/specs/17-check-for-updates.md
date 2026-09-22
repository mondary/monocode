# 17 — Check for Updates en haut des Settings

**Catégorie :** 🔄 Mises à jour  
**Audit 0.1.53 :** 🔧 PORT  
**Note d audit :** UpdateRow natif mais en bas (About) ; déplacer + style PK

**Statut :** pending  
**Lot historique :** 21/22

## Fonction et raison

La mise à jour doit être visible immédiatement et distinguer l’amont officiel de MonoCode PK.

## Spécifications fonctionnelles

- Positionner le contrôle en haut des Settings.
- Afficher version officielle et version PK séparément.
- Lister les commits de chaque axe indépendamment.
- Ne pas lancer de merge sans confirmation explicite.

## Impacts et diff

Comparer SettingsView, updater, `pkUpdateDialog`, rail et script de synchronisation.
Zones V44 : `src/lib/updater.ts`, `src/lib/pkUpdateDialog.ts`, `scripts/sync-pk-update.sh`.

## Migration

Reprendre l’updater upstream puis réinjecter le second axe PK. Tester arbre sale, retard des deux
axes, annulation et relance.

