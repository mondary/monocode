---
id: 01
status: verified
upstream: v0.1.50
files:
  - src/chrome/Sidebar.tsx
  - src/chrome/OrchestrationSidebarAgents.tsx
  - src/lib/orchestration.ts
  - src/lib/orchestrationPlan.ts
tests:
  - src/chrome/SidebarRename.test.ts
  - src/chrome/OrchestrationFlow.test.ts
---

# 01 — Orchestration dans la Sidebar

## Contrat à conserver

Les workers restent dans la carte du lead ; état sauvegardé, progression, tooltip et actions ne sélectionnent pas involontairement le lead.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Port du composant SessionCard complet depuis v0.1.50 ; suppression du montage des workers en dehors de la carte.

## Fichiers concernés

- [src/chrome/Sidebar.tsx](../../src/chrome/Sidebar.tsx)
- [src/chrome/OrchestrationSidebarAgents.tsx](../../src/chrome/OrchestrationSidebarAgents.tsx)
- [src/lib/orchestration.ts](../../src/lib/orchestration.ts)
- [src/lib/orchestrationPlan.ts](../../src/lib/orchestrationPlan.ts)

## Vérification

`node scripts/pk-features.mjs check 01` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Ouvrir une orchestration active puis sauvegardée ; déplier un worker, consulter son état, archiver le lead.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
