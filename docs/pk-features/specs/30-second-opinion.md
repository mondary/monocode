# 30 — Second Opinion

**Statut :** pending  
**Lot historique :** 10

## Fonction et raison

Second Opinion demande une seconde analyse avec un modèle et un effort choisis, sans perdre le contexte de la session principale.

## Spécifications fonctionnelles

- Transmettre le bon modèle et le bon effort.
- Préserver pièces jointes, projet et conversation source.
- Afficher état, erreur et résultat sans remplacer l’onglet principal.

## Impacts et diff

Comparer `SecondOpinionButton`, `SecondOpinionCard`, model target, handoff et session creation.
Zones V44 : `src/chrome/SecondOpinionButton.tsx`, `src/lib/secondOpinion.ts`.

## Migration

Adapter l’API session upstream par un wrapper ciblé. Tester modèle différent, effort différent, annulation et réponse en parallèle.

