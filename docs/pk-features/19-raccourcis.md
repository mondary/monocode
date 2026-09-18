---
id: 19
status: verified
upstream: v0.1.50
files:
  - src/lib/keybindings.ts
  - src/lib/tabKeys.ts
  - src-tauri/src/keybindings.rs
  - src-tauri/src/menu.rs
  - keybindings.defaults.json
  - src/surfaces/SettingsView.tsx
tests:
  - src/lib/keybindings.test.ts
  - src/lib/tabKeys.test.ts
---

# 19 — Raccourcis personnalisables

## Contrat à conserver

Capture de touches, conflits, menu natif et cycle chat/terminal fonctionnent.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Conserver les commandes natives PK et leurs préférences.

## Fichiers concernés

- [src/lib/keybindings.ts](../../src/lib/keybindings.ts)
- [src/lib/tabKeys.ts](../../src/lib/tabKeys.ts)
- [src-tauri/src/keybindings.rs](../../src-tauri/src/keybindings.rs)
- [src-tauri/src/menu.rs](../../src-tauri/src/menu.rs)
- [keybindings.defaults.json](../../keybindings.defaults.json)
- [src/surfaces/SettingsView.tsx](../../src/surfaces/SettingsView.tsx)

## Vérification

`node scripts/pk-features.mjs check 19` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Modifier un raccourci sans conflit ; vérifier le menu puis parcourir les onglets chat et terminal.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
