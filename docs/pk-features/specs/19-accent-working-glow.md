# 19 — Accent color et Working glow color

**Statut :** pending  
**Lot historique :** 17

## Fonction et raison

Une couleur d’accent et une couleur de glow de travail permettent de personnaliser l’interface
et de repérer les tâches actives.

## Spécifications fonctionnelles

- Choisir, prévisualiser, réinitialiser et persister les deux couleurs.
- Fournir une valeur sûre si la couleur est invalide.
- Préserver contraste en clair et sombre.
- Le glow ne doit pas provoquer de mouvement ou coût graphique excessif.

## Impacts et diff

Comparer color picker, appearance storage, CSS variables et indicateurs working.
Zones V44 : `src/lib/colorUtils.ts`, `src/chrome/ColorPickerPopover.tsx`, `src/index.css`.

## Migration

Adapter les tokens au système de thème upstream et migrer les anciennes clés. Tester reset, relance
et onglets en activité.

