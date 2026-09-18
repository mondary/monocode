---
id: 11
status: verified
upstream: v0.1.50
files:
  - src/chrome/UsageFooter.tsx
  - src/chrome/UsageProviderChip.tsx
  - src/chrome/ProviderSignInPanel.tsx
  - src/lib/providerAccounts.ts
tests:
  - src/chrome/UsageFooterAuth.test.ts
  - src/chrome/UsageProviderChip.test.ts
---

# 11 — Authentification et comptes du footer

## Contrat à conserver

Connexion, reconnexion et sélection de compte natif restent accessibles dans le footer.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Les quotas du compte natif ne doivent pas être remplacés par ceux du compte par défaut de CodexBar.

## Fichiers concernés

- [src/chrome/UsageFooter.tsx](../../src/chrome/UsageFooter.tsx)
- [src/chrome/UsageProviderChip.tsx](../../src/chrome/UsageProviderChip.tsx)
- [src/chrome/ProviderSignInPanel.tsx](../../src/chrome/ProviderSignInPanel.tsx)
- [src/lib/providerAccounts.ts](../../src/lib/providerAccounts.ts)

## Vérification

`node scripts/pk-features.mjs check 11` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Ouvrir un fournisseur déconnecté, vérifier le panneau ; sélectionner un compte existant et contrôler le quota associé.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
