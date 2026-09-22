# 08 — Actions Changes

**Statut :** pending  
**Lot historique :** 14/23

## Fonction et raison

Changes doit permettre `Open on GitHub` depuis un fichier modifié, avec repli explicite si aucun
remote GitHub n’est disponible.

## Spécifications fonctionnelles

- Détecter remote, branche et chemin fichier.
- Ouvrir l’URL web au bon emplacement.
- Ne jamais supposer que tout remote est GitHub.
- Conserver reload et les autres actions existantes.

## Impacts et diff

Comparer `GitChangesPanel`, git remote/branch helpers, opener Tauri et tests Changes.
Zones V44 : `src/chrome/GitChangesPanel.tsx`, `src/lib/gitText.ts`, `src/lib/platform.ts`.

## Migration

Porter d’abord la résolution d’URL upstream, puis ajouter l’action conditionnelle. Tester GitHub,
remote absent, GitLab et chemin avec espaces.

