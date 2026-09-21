---
id: 12
status: verified
upstream: v0.1.50
files:
  - src/chrome/UsageFooter.tsx
  - src/chrome/UsageProviderChip.tsx
  - src/lib/rateLimits.ts
  - src/lib/rateLimitsFetch.ts
  - src-tauri/src/rate_limits.rs
  - src/surfaces/SettingsView.tsx
tests:
  - src/lib/rateLimits.test.ts
  - src/chrome/UsageFooter.test.ts
  - src/chrome/UsageProviderChip.test.ts
---

# 12 — Quotas CodexBar et préférences PK

## Contrat à conserver

Choix des fournisseurs, ordre, scope, fenêtres et affichage utilisé/restant restent actifs.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Raccord aux contrôles natifs 0.1.50 ; conserver CodexBar pour les autres fournisseurs.

## Fichiers concernés

- [src/chrome/UsageFooter.tsx](../../src/chrome/UsageFooter.tsx)
- [src/chrome/UsageProviderChip.tsx](../../src/chrome/UsageProviderChip.tsx)
- [src/lib/rateLimits.ts](../../src/lib/rateLimits.ts)
- [src/lib/rateLimitsFetch.ts](../../src/lib/rateLimitsFetch.ts)
- [src-tauri/src/rate_limits.rs](../../src-tauri/src/rate_limits.rs)
- [src/surfaces/SettingsView.tsx](../../src/surfaces/SettingsView.tsx)

## Vérification

`node scripts/pk-features.mjs check 12` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Basculer Current chat/Choose, changer ordre et fenêtre, puis comparer Used/Remaining aux détails.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
