# 36 — Groupes et organisation des projets

**Statut :** pending  
**Lot historique :** 14/15

## Fonction et raison

Les groupes organisent le rail quand le nombre de projets augmente, sans perdre tri, icône ou nom.

## Spécifications fonctionnelles

- Créer, renommer, ouvrir et replier un groupe.
- Déplacer un projet sans modifier son chemin.
- Combiner groupe et ordre choisi.
- Persister l’état d’ouverture.

## Impacts et diff

Comparer `projectGroups`, ProjectRail, project data et settings persistence.
Zones V44 : `src/lib/projectGroups.ts`, `src/chrome/ProjectGroups.test.ts`, `src/chrome/ProjectRail.tsx`.

## Migration

Porter le modèle upstream s’il existe ; migrer les groupes PK par identifiant stable. Tester projet non groupé, renommage, tri et relance.

