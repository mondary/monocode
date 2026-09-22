# 04 — Titre Workspace ou nom du projet

**Catégorie :** 🗂️ Onglets & Workspace  
**Audit 0.1.53 :** 🔧 PORT  
**Note d audit :** Titre = conversation uniquement ; PK ajoutait mode projet (projectTitle.ts à recréer dans src/features/settings/model/)

**Statut :** pending  
**Lot historique :** 15/22

## Fonction et raison

L’utilisateur doit choisir si l’interface affiche `Workspace`, le nom de l’application ou le nom
du projet. Le contexte doit être compréhensible sans ouvrir le rail.

## Spécifications fonctionnelles

- Réglage persistant : `Workspace`, application ou projet.
- Fallback déterministe si aucun nom de projet n’est disponible.
- Mise à jour immédiate après renommage.
- Aucun changement du chemin réel du projet.

## Impacts et diff

Comparer `TitleBar`, project data, settings storage et tests de renommage. Zones V44 :
`src/chrome/TitleBar.tsx`, `src/lib/projectData.ts`, `src/lib/settings.ts`.

## Migration

Conserver le modèle de projet upstream et ajouter seulement le sélecteur de libellé. Tester
renommage, projet sans nom et relance.

