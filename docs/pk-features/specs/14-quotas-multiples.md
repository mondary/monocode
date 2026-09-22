# 14 — Plusieurs quotas dans la barre inférieure

**Catégorie :** 📊 Quotas & usage  
**Audit 0.1.53 :** 🔧 PORT  
**Note d audit :** rateLimits.ts natif (525 l.) mais mono-provider ; V44 avait multi (751 l.)

**Statut :** pending  
**Lot historique :** 11/12

## Fonction et raison

La barre inférieure doit afficher plusieurs quotas simultanément, plutôt que de limiter l’utilisateur
à un provider ou une fenêtre.

## Spécifications fonctionnelles

- Afficher plusieurs chips sans chevauchement.
- Chaque chip indique provider, fenêtre, valeur et état de chargement.
- Masquer un provider sans supprimer ses données.
- Gérer erreur, absence de quota et dépassement.

## Impacts et diff

Comparer `UsageFooter`, `UsageProviderChip`, rate limits, CodexBar et layout responsive.
Zones V44 : `src/chrome/UsageFooter.tsx`, `src/chrome/UsageProviderChip.tsx`, `src/lib/rateLimits.ts`.

## Migration

Conserver le fetch/cache upstream et modifier le modèle d’affichage pour une liste. Tester deux
providers, données manquantes, fenêtre longue et petite largeur.

