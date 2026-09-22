# 22 — Auto-export des notes vers le projet

**Catégorie :** 📝 Notes  
**Audit 0.1.53 :** 🔧 PORT  
**Note d audit :** Absent ; à porter (notes.ts, notes.rs)

**Statut :** pending  
**Lot historique :** 05/07

## Fonction et raison

Les notes doivent pouvoir être exportées automatiquement vers le projet afin d’être versionnées,
consultables hors application et récupérables.

## Spécifications fonctionnelles

- Activer/désactiver l’auto-export.
- Sauvegarder avant export.
- Écrire dans le projet courant sans écraser un fichier non géré.
- Afficher erreur et chemin de sortie de manière compréhensible.

## Impacts et diff

Comparer notes store, NotesView, SettingsView, Tauri notes et réglages.
Zones V44 : `src/lib/notes.ts`, `src-tauri/src/notes.rs`, `src/surfaces/SettingsView.tsx`.

## Migration

Porter la clé de réglage une seule fois et éviter les doublons. Tester export manuel, auto-export,
projet en lecture seule et modification récente.

