# 35 — Logos et icônes des providers

**Catégorie :** 🔌 Providers & modèles  
**Audit 0.1.53 :** 🔧 PORT  
**Note d audit :** 5 SVG manquants : gemini, mimo, nvidia, openrouter, zai

**Statut :** pending  
**Lot historique :** 08/11/12

## Fonction et raison

Les logos permettent d’identifier rapidement provider standard, custom et PK dans picker, footer et dialogues de compte.

## Spécifications fonctionnelles

- Utiliser l’asset correspondant au provider.
- Prévoir un fallback accessible pour provider custom ou asset absent.
- Ne pas charger une image distante non approuvée.

## Impacts et diff

Comparer `src/assets/providers`, HarnessIcon, provider marks, picker et UsageProviderChip.
Zones V44 : `src/assets/providers/*.svg`, `src/chrome/HarnessIcon.tsx`, `src/chrome/icons.tsx`.

## Migration

Conserver les assets upstream compatibles et ajouter seulement les logos PK manquants. Tester thèmes clair/sombre, custom provider et asset absent.

