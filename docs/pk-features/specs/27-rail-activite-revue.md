# 27 — Rail activité, revue et projets

**Catégorie :** 📁 Projets  
**Audit 0.1.53 :** 🔧 PORT  
**Note d audit :** ProjectRail natif ; hooks PK d activité à reporter

**Statut :** pending  
**Lot historique :** 06/14/15

## Fonction et raison

Le rail doit réunir projets, activité et revue sans perdre le workspace ni la session courante.

## Spécifications fonctionnelles

- Ouvrir activité et revue du bon projet.
- Afficher notifications et actions rapides au bon endroit.
- Préserver onglet et focus lors d’un changement de projet.
- Supporter groupes, tri et identité du projet.

## Impacts et diff

Comparer ProjectRail, Sidebar, notifications, project groups et session selection.
Zones V44 : `src/chrome/ProjectRail.tsx`, `src/lib/projectGroups.ts`, `src/hooks/projectNotificationFlow.test.ts`.

## Migration

Garder le routeur upstream et raccorder les cartes PK une par une. Tester deux projets, activité,
revue, notification et retour à la session.

