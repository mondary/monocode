# 09 — Icône de projet depuis icon.png ou icon.jpg

**Catégorie :** 📁 Projets  
**Audit 0.1.53 :** 🟡 OK*  
**Note d audit :** projectLogos.ts natif (droppable + src) ; vérifier icon.png/icon.jpg

**Statut :** pending  
**Lot historique :** 15

## Fonction et raison

Les projets doivent être reconnaissables automatiquement sans configuration manuelle, en utilisant
`icon.png` puis `icon.jpg` comme sources conventionnelles.

## Spécifications fonctionnelles

- Chercher `icon.png`, puis `icon.jpg` à la racine du projet.
- Afficher un fallback stable si aucun fichier n’existe.
- Ne pas charger un fichier hors du projet.
- Rafraîchir après ajout ou suppression de l’icône.

## Impacts et diff

Comparer project data, logos, cache et rail. Zones V44 : `src/lib/projectLogos.ts`,
`src/chrome/ProjectMascot.tsx`, `src/chrome/ProjectRail.tsx`.

## Migration

Conserver le cache upstream et ajouter l’ordre de recherche PK. Tester PNG, JPG, aucun fichier,
fichier invalide et relance.

