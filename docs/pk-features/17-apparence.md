---
id: 17
status: verified
upstream: v0.1.50
files:
  - src/lib/appearance.ts
  - src/index.css
  - src/surfaces/SettingsView.tsx
tests:
  - src/lib/appearance.test.ts
---

# 17 — Thèmes et fonds PK

## Contrat à conserver

Dracula, Catppuccin, transparence et fonds par panneau restent disponibles.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

La couleur d’accent 0.1.50 doit coexister avec les presets PK.

## Fichiers concernés

- [src/lib/appearance.ts](../../src/lib/appearance.ts)
- [src/index.css](../../src/index.css)
- [src/surfaces/SettingsView.tsx](../../src/surfaces/SettingsView.tsx)

## Vérification

`node scripts/pk-features.mjs check 17` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Alterner Latte/Mocha/Dracula et changer un fond pour Chat/Workspace/Terminal ; vérifier la persistance.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
