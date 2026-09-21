---
id: 02
status: verified
upstream: v0.1.50
files:
  - src/chrome/Sidebar.tsx
  - src/chrome/SessionFiltersMenu.tsx
tests:
  - src/chrome/SidebarRename.test.ts
---

# 02 — Sélection, navigation et rappels

## Contrat à conserver

Ctrl/Cmd et Shift sélectionnent les sessions sans déplacer le focus ; le survol précharge ; les rappels affichent leur échéance.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

L’onglet Notes PK explique les quatre onglets au lieu des trois de l’amont.

## Fichiers concernés

- [src/chrome/Sidebar.tsx](../../src/chrome/Sidebar.tsx)
- [src/chrome/SessionFiltersMenu.tsx](../../src/chrome/SessionFiltersMenu.tsx)

## Vérification

`node scripts/pk-features.mjs check 02` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Sélectionner plusieurs sessions, créer un dossier, renommer avec F2 et programmer puis annuler un rappel.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
