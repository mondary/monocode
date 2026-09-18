---
id: 10
status: verified
upstream: v0.1.50
files:
  - src/chrome/SecondOpinionButton.tsx
  - src/chrome/PlanPreview.tsx
  - src/surfaces/AgentTranscript.tsx
  - src/surfaces/FilePane.tsx
  - src/lib/secondOpinion.ts
  - src/lib/handoff.ts
tests:
  - src/chrome/SecondOpinionButton.test.ts
---

# 10 — Choix modèle et effort

## Contrat à conserver

Second avis, transfert et build de plan transmettent le modèle et son effort ensemble.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

API ModelTarget rétablie de bout en bout ; ne pas réinjecter les réglages de l’ancien modèle.

## Fichiers concernés

- [src/chrome/SecondOpinionButton.tsx](../../src/chrome/SecondOpinionButton.tsx)
- [src/chrome/PlanPreview.tsx](../../src/chrome/PlanPreview.tsx)
- [src/surfaces/AgentTranscript.tsx](../../src/surfaces/AgentTranscript.tsx)
- [src/surfaces/FilePane.tsx](../../src/surfaces/FilePane.tsx)
- [src/lib/secondOpinion.ts](../../src/lib/secondOpinion.ts)
- [src/lib/handoff.ts](../../src/lib/handoff.ts)

## Vérification

`node scripts/pk-features.mjs check 10` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Dans un plan, choisir un autre modèle puis son effort ; vérifier la session créée. Répéter pour Second opinion.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
