---
id: 04
status: verified
upstream: v0.1.50
files:
  - src/surfaces/NotesView.tsx
  - src/chrome/SearchableProjectPicker.tsx
  - src/lib/notes.ts
tests:
  - src/surfaces/NotesView.test.ts
  - src/lib/notes.test.ts
---

# 04 — Édition, tags et déplacement des notes

## Contrat à conserver

Les sauvegardes restent ordonnées lors d’un changement de note ; déplacer une note conserve les modifications et les tags.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Port de la file de sauvegardes et du picker de déplacement de v0.1.50.

## Fichiers concernés

- [src/surfaces/NotesView.tsx](../../src/surfaces/NotesView.tsx)
- [src/chrome/SearchableProjectPicker.tsx](../../src/chrome/SearchableProjectPicker.tsx)
- [src/lib/notes.ts](../../src/lib/notes.ts)

## Vérification

`node scripts/pk-features.mjs check 04` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Modifier une note, changer immédiatement de projet puis revenir ; vérifier texte et tags. Échap ferme d’abord le sélecteur.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
