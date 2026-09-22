# 13 — Ordre des providers custom

**Statut :** pending  
**Lot historique :** 12

## Fonction et raison

L’ordre des providers custom doit être choisi dans Workspace pour placer les providers réellement
utilisés en premier.

## Spécifications fonctionnelles

- Réordonner par glisser-déposer ou contrôles accessibles.
- Appliquer le même ordre au picker, footer et section Workspace.
- Conserver les providers non configurés en fin de liste.
- Persister l’ordre par installation/utilisateur, pas par projet si upstream ne le permet pas.

## Impacts et diff

Comparer `UsageProviderChip`, settings, provider registry et composants Workspace.
Zones V44 : `src/chrome/UsageProviderChip.tsx`, `src/lib/settings.ts`, `src/surfaces/SettingsView.tsx`.

## Migration

Normaliser les anciens tableaux de providers et ajouter un identifiant stable. Tester ajout,
suppression, réordonnancement et migration d’une préférence absente.

