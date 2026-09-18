---
id: 21
status: verified
upstream: v0.1.50
files:
  - src/lib/updater.ts
  - src/lib/pkUpdateDialog.ts
  - src/chrome/UpdateFlowDialog.tsx
  - src/chrome/UpdateRailCard.tsx
  - src/chrome/WhatsNewDialog.tsx
  - scripts/sync-pk-update.sh
tests:
  - src/lib/updater.test.ts
  - src/lib/updaterConfig.test.ts
  - src/lib/pkUpdateDialog.test.ts
  - src/chrome/UpdateRailCard.test.ts
  - src/chrome/WhatsNewDialog.test.ts
---

# 21 — Mise à jour officielle et PK

## Contrat à conserver

Deux axes de version, dialogue commits, conservation du WIP et relance de la bonne variante.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

La branche d’intégration n’est pas une mise à jour stable publiée.

## Fichiers concernés

- [src/lib/updater.ts](../../src/lib/updater.ts)
- [src/lib/pkUpdateDialog.ts](../../src/lib/pkUpdateDialog.ts)
- [src/chrome/UpdateFlowDialog.tsx](../../src/chrome/UpdateFlowDialog.tsx)
- [src/chrome/UpdateRailCard.tsx](../../src/chrome/UpdateRailCard.tsx)
- [src/chrome/WhatsNewDialog.tsx](../../src/chrome/WhatsNewDialog.tsx)
- [scripts/sync-pk-update.sh](../../scripts/sync-pk-update.sh)

## Vérification

`node scripts/pk-features.mjs check 21` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Ouvrir Check for updates et vérifier les deux axes, sans installer la migration sur la version quotidienne.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
