# 29 — Build, identité PK, icône et distribution

**Catégorie :** 🎨 Identité & UI PK  
**Audit 0.1.53 :** 🔧 PORT  
**Note d audit :** tauri.pk.conf.json, scripts build, icônes — socle déjà posé en V45 (commit 4ed448e)

**Statut :** pending  
**Lot historique :** 22/23

## Fonction et raison

Le bundle doit être identifiable comme PK, porter l’icône blanche et être reproductible sans
confondre version officielle et version PK.

## Spécifications fonctionnelles

- Synchroniser `VERSION`, README et CHANGELOG pour chaque release PK.
- Conserver l’icône blanche et les métadonnées du bundle.
- Produire bundle, DMG et éventuel cask depuis la branche validée.
- Partager les données avec la version officielle selon la politique décidée, sans lancer deux
  variantes simultanément.

## Impacts et diff

Comparer package scripts, Tauri manifests/icons, version helpers, DMG workflow et Homebrew.
Zones V44 : `scripts/build-pk-app.sh`, `scripts/package-pk-dmg.sh`, `src-tauri/tauri.*.json`, `VERSION`.

## Migration

Ne porter les scripts qu’après compilation de l’application. Inspecter identifier, icon, version,
signature et chemin d’installation ; construire le DMG en dernier, sans publier automatiquement.

