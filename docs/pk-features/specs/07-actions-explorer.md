# 07 — Actions Explorer

**Catégorie :** 📁 Projets  
**Audit 0.1.53 :** 🔧 PORT  
**Note d audit :** Reveal in Finder/Initialize project absents ; backend project_init.rs à porter

**Statut :** pending  
**Lot historique :** 20/23

## Fonction et raison

Explorer doit proposer directement `Reveal in Finder` et `Initialize project`, pour éviter des
détours par le menu contextuel ou le terminal.

## Spécifications fonctionnelles

- `Reveal in Finder` cible le fichier ou dossier sélectionné.
- `Initialize project` demande confirmation si nécessaire et n’écrase aucun fichier.
- Les actions sont désactivées lorsque la sélection ne les permet pas.

## Impacts et diff

Comparer `FileTree`, `ExplorerMenu`, fs/paths et la commande Tauri d’initialisation.
Zones V44 : `src/chrome/FileTree.tsx`, `src/lib/projectInit.ts`, `src-tauri/src/project_init.rs`.

## Migration

Réutiliser les commandes upstream de fichier et raccorder les actions PK au nouveau menu. Tester
fichier, dossier, projet non initialisé et second passage sans écrasement.

