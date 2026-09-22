# 25 — Notes, tags, déplacement et export Markdown

**Catégorie :** 📝 Notes  
**Audit 0.1.53 :** 🟡 OK*  
**Note d audit :** Notes natives ; vérifier tags/export vs V44

**Statut :** pending  
**Lot historique :** 03/04/05

## Fonction et raison

Une note est un objet de travail complet : édition, tags, déplacement, export et miroir doivent
fonctionner sans perte de contenu.

## Spécifications fonctionnelles

- Sauvegarder l’édition dans l’ordre des opérations.
- Conserver tags et projet lors d’un déplacement.
- Exporter le contenu le plus récent.
- Ouvrir une note depuis la liste et revenir au bon contexte.

## Impacts et diff

Comparer NotesView, NoteCard, ProjectNotes, SearchableProjectPicker, notes store et backend Tauri.
Zones V44 : `src/surfaces/NotesView.tsx`, `src/chrome/NoteCard.tsx`, `src/lib/notes.ts`.

## Migration

Reprendre d’abord le stockage upstream puis réappliquer les événements et UI PK. Tester changement
rapide de projet, tags, export et relance.

