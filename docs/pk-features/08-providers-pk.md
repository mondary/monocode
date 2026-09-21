---
id: 08
status: verified
upstream: v0.1.50
files:
  - src/lib/session.ts
  - src/lib/models.ts
  - src/lib/harness/register.ts
  - src/lib/harness/availability.ts
  - src/lib/harness/opencode.ts
  - src/lib/harness/opencodeAdapter.ts
  - src/lib/harness/opencodeCatalog.ts
  - src/lib/harness/opencodeProtocol.ts
  - src/chrome/HarnessIcon.tsx
tests:
  - src/lib/session.test.ts
  - src/lib/harness/opencodeProtocol.test.ts
  - src/chrome/ModelPicker.test.ts
---

# 08 — Fournisseurs supplémentaires PK

## Contrat à conserver

ZAI, MiMo, Gemini, Antigravity et les fournisseurs PK gardent leurs modèles et leur routage OpenCode.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Vérifier le routage sans modifier les identifiants ni exposer les clés.

## Fichiers concernés

- [src/lib/session.ts](../../src/lib/session.ts)
- [src/lib/models.ts](../../src/lib/models.ts)
- [src/lib/harness/register.ts](../../src/lib/harness/register.ts)
- [src/lib/harness/availability.ts](../../src/lib/harness/availability.ts)
- [src/lib/harness/opencode.ts](../../src/lib/harness/opencode.ts)
- [src/lib/harness/opencodeAdapter.ts](../../src/lib/harness/opencodeAdapter.ts)
- [src/lib/harness/opencodeCatalog.ts](../../src/lib/harness/opencodeCatalog.ts)
- [src/lib/harness/opencodeProtocol.ts](../../src/lib/harness/opencodeProtocol.ts)
- [src/chrome/HarnessIcon.tsx](../../src/chrome/HarnessIcon.tsx)

## Vérification

`node scripts/pk-features.mjs check 08` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Choisir un fournisseur PK déjà configuré et envoyer un court message ; vérifier le modèle et la réponse.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
