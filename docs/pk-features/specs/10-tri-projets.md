# 10 — Ordre de la liste des projets

**Catégorie :** 📁 Projets  
**Audit 0.1.53 :** 🟡 OK*  
**Note d audit :** reorderSubset/railOrder natifs dans ProjectRail

**Statut :** pending  
**Lot historique :** 14/15

## Fonction et raison

La liste projet doit s’adapter au mode de travail : alphabétique, dernière modification ou activité
récente, avec choix persistant.

## Spécifications fonctionnelles

- Proposer au minimum `name`, `modified` et `recent activity`.
- Utiliser un tie-breaker stable pour les égalités.
- Ne pas modifier l’ordre des données stockées.
- Appliquer le tri à tous les rails/listes concernés.

## Impacts et diff

Comparer `projectGroups`, `ProjectRail`, project data et settings storage.
Zones V44 : `src/lib/projectGroups.ts`, `src/lib/projectData.ts`, `src/chrome/ProjectRail.tsx`.

## Migration

Ajouter une fonction de tri pure et un réglage versionné. Tester changement de mode, égalités,
projet renommé et relance.

