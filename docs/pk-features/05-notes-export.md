---
id: 05
status: verified
upstream: v0.1.50
files:
  - src/surfaces/NotesView.tsx
  - src/lib/notes.ts
  - src-tauri/src/notes.rs
  - src/surfaces/SettingsView.tsx
tests:
  - src/lib/notes.test.ts
  - src/surfaces/NotesView.test.ts
---

# 05 — Export Markdown des notes

## Contrat à conserver

Export manuel et miroir automatique des notes du projet restent disponibles.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Sauvegarder avant l’export. Le test réel du dialogue système et du fichier exporté reste nécessaire.

## Fichiers concernés

- [src/surfaces/NotesView.tsx](../../src/surfaces/NotesView.tsx)
- [src/lib/notes.ts](../../src/lib/notes.ts)
- [src-tauri/src/notes.rs](../../src-tauri/src/notes.rs)
- [src/surfaces/SettingsView.tsx](../../src/surfaces/SettingsView.tsx)

## Vérification

`node scripts/pk-features.mjs check 05` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Exporter une note avec une modification récente, puis activer le miroir projet et vérifier le Markdown généré.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
