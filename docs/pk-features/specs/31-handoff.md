# 31 — Handoff et transfert de session

**Statut :** pending  
**Lot historique :** 10

## Fonction et raison

Le handoff transfère explicitement le contexte vers un autre modèle ou agent sans perdre le projet et la demande originale.

## Spécifications fonctionnelles

- Transmettre modèle, effort, projet et contexte autorisé.
- Afficher clairement la nouvelle session cible.
- Conserver l’historique source et gérer l’échec du transfert.

## Impacts et diff

Comparer `handoff`, `HandoffMiniCard`, session creation et transcript.
Zones V44 : `src/lib/handoff.ts`, `src/lib/handoffTurn.ts`, `src/chrome/HandoffMiniCard.tsx`.

## Migration

Utiliser les primitives de session upstream et ne porter que le mapping PK. Tester transfert réussi, cible indisponible et retour à la session source.

