# 03 — Terminal comme onglet

**Catégorie :** 🗂️ Onglets & Workspace  
**Audit 0.1.53 :** 🟡 OK*  
**Note d audit :** terminalTab.ts natif (OSC cwd, running) ; vérifier parité avec V44

**Statut :** pending  
**Lot historique :** 18

## Fonction et raison

Le terminal doit être un onglet au même niveau que Chat, et non uniquement un panneau inférieur.
Cela permet plusieurs terminaux, leur restauration et un focus cohérent.

## Spécifications fonctionnelles

- Créer, sélectionner, renommer et fermer un onglet Terminal.
- Supporter plusieurs terminaux dans un workspace.
- Conserver le panneau inférieur seulement comme option éventuelle, jamais comme dépendance.
- Préserver PTY, redimensionnement et état lors d’un changement d’onglet.

## Impacts et diff

Comparer `TerminalView`, `TerminalGridBackground`, PTY Tauri, tabs et persistance workspace.
Zones V44 : `src/surfaces/TerminalView.tsx`, `src/lib/pty.test.ts`, `src-tauri/src/pty.rs`.

## Migration

Réutiliser les commandes PTY upstream ; adapter le conteneur tabulaire par une couche dédiée.
Valider deux onglets simultanés, fermeture, relance et absence de fuite de processus.

