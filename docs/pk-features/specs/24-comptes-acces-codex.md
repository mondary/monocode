# 24 — Comptes, authentification et modes d’accès Codex

**Catégorie :** 🔌 Providers & modèles  
**Audit 0.1.53 :** ✅ OK  
**Note d audit :** providerAccounts.ts natif complet (création, renommage, credentials)

**Statut :** pending  
**Lot historique :** 11/13

## Fonction et raison

Les comptes, reconnexion, sélection de compte et modes d’accès doivent rester cohérents avec les
quotas et la session utilisée.

## Spécifications fonctionnelles

- Ouvrir sign-in/re-auth au bon provider.
- Sélectionner un compte sans remplacer un autre silencieusement.
- Associer les quotas au compte actif.
- Conserver les secrets dans le stockage prévu, jamais dans les logs.

## Impacts et diff

Comparer UsageFooter, ProviderSignInPanel, provider accounts, AccessPicker et Tauri credentials.
Zones V44 : `src/chrome/UsageFooter.tsx`, `src/chrome/ProviderSignInPanel.tsx`, `src/lib/providerAccounts.ts`.

## Migration

Adopter le modèle d’auth upstream puis ajouter les sélecteurs PK. Tester compte absent, plusieurs
comptes, reconnexion et quota correspondant.

