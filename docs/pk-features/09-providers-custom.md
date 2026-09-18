---
id: 09
status: verified
upstream: v0.1.50
files:
  - src/lib/customProviders.ts
  - src-tauri/src/custom_providers.rs
  - src/chrome/ModelPicker.tsx
  - src/surfaces/SettingsView.tsx
tests:
  - src/lib/customProviders.test.ts
  - src/chrome/ModelPicker.test.ts
---

# 09 — Fournisseurs OpenAI compatibles personnalisés

## Contrat à conserver

Configuration locale, bouton Test, modèles et onglet dédié restent fonctionnels.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Conserver les titres dynamiques harnessTitle/harnessLabel.

## Fichiers concernés

- [src/lib/customProviders.ts](../../src/lib/customProviders.ts)
- [src-tauri/src/custom_providers.rs](../../src-tauri/src/custom_providers.rs)
- [src/chrome/ModelPicker.tsx](../../src/chrome/ModelPicker.tsx)
- [src/surfaces/SettingsView.tsx](../../src/surfaces/SettingsView.tsx)

## Vérification

`node scripts/pk-features.mjs check 09` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Avec un endpoint déjà configuré, lancer Test et vérifier sa présence dans le picker ; ne pas recopier sa clé dans les journaux.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
