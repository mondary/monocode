# 32 — Niveau d’effort et cible modèle

**Statut :** pending  
**Lot historique :** 10

## Fonction et raison

Le modèle et son niveau d’effort doivent rester liés dans les plans, le composeur, Second Opinion et les transferts.

## Spécifications fonctionnelles

- Afficher la cible effective avant exécution.
- Persister le choix dans le plan ou la session concernée.
- Ne pas réutiliser silencieusement un effort d’un autre modèle.

## Impacts et diff

Comparer `ModelTarget`, `PlanPreview`, `AgentTranscript`, composer et handoff.
Zones V44 : `src/chrome/PlanPreview.tsx`, `src/surfaces/AgentTranscript.tsx`, `src/lib/secondOpinion.ts`.

## Migration

Remapper le type upstream et ajouter les champs PK uniquement si absents. Tester changement avant création de session, valeur par défaut et provider incompatible.

