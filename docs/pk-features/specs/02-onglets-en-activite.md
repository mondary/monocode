# 02 — Focus des onglets qui travaillent

**Catégorie :** 🗂️ Onglets & Workspace  
**Audit 0.1.53 :** 🟡 OK*  
**Note d audit :** busyHarnesses/doneHarnesses natifs dans TitleBar ; vérifier visuel PK (glow)

**Statut :** pending  
**Lot historique :** 01/02

## Fonction et raison

Un onglet qui exécute une tâche doit afficher un état distinct sans devenir l’onglet sélectionné.
L’utilisateur voit immédiatement où un travail est en cours.

## Spécifications fonctionnelles

- Afficher `working`, succès, erreur et attente indépendamment de `selected`.
- Ne pas déplacer automatiquement le focus lorsqu’un worker répond.
- Conserver l’indication après navigation vers un autre onglet.

## Impacts et diff

Comparer `SurfaceTabs`, l’état session/transcript, les indicateurs de busy et les animations CSS.
Zones V44 : `src/chrome/SurfaceTabs.tsx`, `src/lib/session.ts`, `src/index.css`, tests tabs.

## Migration

Porter le contrat d’état, pas les anciens composants complets. Vérifier deux sessions simultanées,
une fermeture pendant exécution et une relance.

