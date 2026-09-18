---
id: 14
status: verified
upstream: v0.1.50
files:
  - src/chrome/ProjectRail.tsx
  - src/lib/busyGlowSettings.ts
  - src/lib/tabGroups.ts
  - src/App.tsx
tests:
  - src/lib/busyGlowSettings.test.ts
  - src/chrome/ProjectGroups.test.ts
---

# 14 — Rail projets : activité et revue

## Contrat à conserver

Glow de travail, couleur configurable, marque terminé à vérifier et agents actifs restent visibles.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Contrôler la transmission des busyPaths/donePaths et la disparition du badge après consultation.

## Fichiers concernés

- [src/chrome/ProjectRail.tsx](../../src/chrome/ProjectRail.tsx)
- [src/lib/busyGlowSettings.ts](../../src/lib/busyGlowSettings.ts)
- [src/lib/tabGroups.ts](../../src/lib/tabGroups.ts)
- [src/App.tsx](../../src/App.tsx)

## Vérification

`node scripts/pk-features.mjs check 14` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Lancer deux sessions, consulter un autre projet, attendre une fin puis ouvrir le projet terminé.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
