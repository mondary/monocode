# 21 — Keybindings personnalisables

**Statut :** pending  
**Lot historique :** 19

## Fonction et raison

L’utilisateur doit pouvoir modifier les raccourcis que l’application officielle ne permettait pas
de personnaliser.

## Spécifications fonctionnelles

- Modifier, réinitialiser et rechercher un raccourci.
- Détecter et expliquer les conflits.
- Persister la configuration et refléter les menus.
- Conserver les valeurs par défaut lors d’une nouvelle version.

## Impacts et diff

Comparer keybindings model, SettingsView, menu Tauri, defaults et tests.
Zones V44 : `src/lib/keybindings.test.ts`, `src-tauri/src/keybindings.rs`, `keybindings.defaults.json`.

## Migration

Migrer les identifiants de commandes plutôt que les touches affichées. Tester conflit, reset,
raccourci global et relance.

