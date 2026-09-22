# 01 — Focus de l’onglet actif

**Statut :** pending  
**Lot historique :** 01/02  
**Dépendances :** modèle d’onglets upstream

## Fonction et raison

L’onglet sélectionné doit rester visuellement identifiable, même lorsqu’un autre onglet travaille.
Cela évite de modifier ou fermer le mauvais contexte.

## Spécifications fonctionnelles

- Un seul onglet possède l’état `selected`.
- Le focus visuel persiste pendant les changements de statut d’exécution.
- La sélection clavier, souris et raccourci produit le même état.
- L’état est accessible en clair et visible en mode clair/sombre.

## Impacts et diff

Comparer le rendu des tabs, le store de session active, les classes CSS et les tests de navigation.
Zones V44 probables : `src/chrome/SurfaceTabs.tsx`, `src/lib/sessionSelection.ts`, `src/index.css`.
Le diff doit isoler la sélection de l’état `working`.

## Migration

Remapper d’abord le modèle upstream d’onglets ; réappliquer uniquement le style et les assertions
PK. Tester sélection, fermeture, changement de workspace et relance.

