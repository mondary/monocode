---
id: 07
status: verified
upstream: v0.1.50
files:
  - src/surfaces/SettingsView.tsx
  - src/lib/settings.ts
tests:
  - src/surfaces/SettingsView.test.ts
---

# 07 — Paramètres, recherche et page Chat

## Contrat à conserver

Chaque résultat de recherche mène à un contrôle réel ; la page Chat amont et les réglages PK coexistent.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Les contrôles Chat et hooks migrent vers leurs pages 0.1.50 ; les réglages PK restent accessibles.

## Fichiers concernés

- [src/surfaces/SettingsView.tsx](../../src/surfaces/SettingsView.tsx)
- [src/lib/settings.ts](../../src/lib/settings.ts)

## Vérification

`node scripts/pk-features.mjs check 07` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Rechercher Notifications, Effort, Accent et Version ; vérifier navigation, surbrillance et persistance. Parcourir aussi les réglages PK.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
