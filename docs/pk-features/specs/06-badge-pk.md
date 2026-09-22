# 06 — Badge PK sur les features modifiées

**Statut :** pending  
**Lot historique :** 22

## Fonction et raison

Les ajouts ou comportements propres à PK doivent être identifiables, afin de distinguer une
fonctionnalité PK d’une fonctionnalité officielle sans ambiguïté.

## Spécifications fonctionnelles

- Afficher un badge `PK` sur les contrôles concernés.
- Ne pas afficher le badge sur une fonctionnalité convergée avec upstream.
- Respecter thèmes, contraste et taille réduite.

## Impacts et diff

Comparer `pkVariant`, `pkVersion`, `TitleBar`, Settings, icônes et composants portés.
Zones V44 : `src/lib/pkVariant.ts`, `src/lib/pkVersion.ts`, `src/chrome/TitleBar.tsx`.

## Migration

Centraliser la décision de badge dans un helper PK ; ne pas dupliquer des conditions dans chaque
composant. Vérifier build officiel, Dev et PK.

