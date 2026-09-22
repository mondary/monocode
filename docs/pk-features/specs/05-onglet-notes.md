# 05 — Onglet Notes dans le workspace

**Catégorie :** 🗂️ Onglets & Workspace  
**Audit 0.1.53 :** 🟡 OK*  
**Note d audit :** NotesView natif + toggle App.tsx ; vérifier ouverture en onglet workspace

**Statut :** pending  
**Lot historique :** 03/04/05

## Fonction et raison

Notes doit être un onglet de workspace au même niveau que Session, Explorer et Changes, avec
filtrage par projet et ouverture dans la vue complète.

## Spécifications fonctionnelles

- Ajouter/retirer l’onglet sans perdre les notes.
- Filtrer par projet actif.
- Ouvrir, éditer, taguer, déplacer et revenir à la liste.
- Conserver les brouillons et le focus.

## Impacts et diff

Comparer `NotesView`, `ProjectNotes`, `NoteCard`, navigation surface et stockage notes.
Zones V44 : `src/surfaces/NotesView.tsx`, `src/chrome/ProjectNotes.tsx`, `src/lib/notes.ts`.

## Migration

Brancher la vue au routeur d’onglets upstream ; préserver l’événement `OPEN_NOTE_EVENT` et les
sauvegardes ordonnées. Tester deux projets et un déplacement immédiat.

