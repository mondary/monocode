# 11 — Sélection des providers custom

**Statut :** pending  
**Lot historique :** 08/09

## Fonction et raison

Un provider custom doit être choisi dans le même picker qu’un provider standard, sans parcours
secondaire.

## Spécifications fonctionnelles

- Afficher nom, icône, modèles et état de disponibilité.
- Sélectionner un provider custom comme un provider natif.
- Préserver endpoint et configuration locale.
- Ne jamais afficher une clé secrète.

## Impacts et diff

Comparer `ModelPicker`, registry, custom providers et catalogue de modèles.
Zones V44 : `src/chrome/ModelPicker.tsx`, `src/lib/customProviders.ts`, `src-tauri/src/custom_providers.rs`.

## Migration

S’aligner sur le type de provider upstream ; ajouter un adaptateur uniquement pour les champs PK.
Tester sélection, modèle absent, endpoint invalide et relance.

