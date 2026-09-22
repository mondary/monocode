# 16 — Affichage used ou remaining

**Catégorie :** 📊 Quotas & usage  
**Audit 0.1.53 :** 🔧 PORT  
**Note d audit :** Dépend de 14 ; UsageFooter.tsx natif à étendre

**Statut :** pending  
**Lot historique :** 12

## Fonction et raison

Le choix `remaining` ou `used` permet de lire les quotas selon la préférence de l’utilisateur.

## Spécifications fonctionnelles

- Le réglage change l’affichage sans modifier les données sources.
- Le libellé et la couleur restent compréhensibles dans les deux modes.
- Le mode par défaut est rétrocompatible avec V44.

## Impacts et diff

Comparer formatter quota, UsageProviderChip, settings et tests rate limits.
Zones V44 : `src/lib/rateLimits.ts`, `src/chrome/UsageProviderChip.tsx`, `src/lib/settings.ts`.

## Migration

Conserver une valeur interne complète puis formatter en présentation. Tester pourcentage, valeur
absente, dépassement et relance.

