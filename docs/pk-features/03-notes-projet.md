---
id: 03
status: verified
upstream: v0.1.50
files:
  - src/chrome/ProjectNotes.tsx
  - src/chrome/NoteCard.tsx
  - src/lib/notes.ts
  - src/chrome/Sidebar.tsx
  - src/surfaces/NotesView.tsx
tests:
  - src/lib/notes.test.ts
  - src/surfaces/NotesView.test.ts
---

# 03 — Notes par projet

## Contrat à conserver

L’onglet Notes PK filtre par projet et ouvre la note choisie dans la vue complète.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Conserver le mécanisme OPEN_NOTE_EVENT et la carte de note PK.

## Fichiers concernés

- [src/chrome/ProjectNotes.tsx](../../src/chrome/ProjectNotes.tsx)
- [src/chrome/NoteCard.tsx](../../src/chrome/NoteCard.tsx)
- [src/lib/notes.ts](../../src/lib/notes.ts)
- [src/chrome/Sidebar.tsx](../../src/chrome/Sidebar.tsx)
- [src/surfaces/NotesView.tsx](../../src/surfaces/NotesView.tsx)

## Vérification

`node scripts/pk-features.mjs check 03` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Créer deux notes dans deux projets ; ouvrir chacune depuis son onglet Notes ; vérifier le titre et le filtre.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
