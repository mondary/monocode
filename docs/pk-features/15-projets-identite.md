---
id: 15
status: verified
upstream: v0.1.50
files:
  - src/chrome/TitleBar.tsx
  - src/chrome/ProjectLogoIcon.tsx
  - src/hooks/useTabGroupLogos.ts
  - src/surfaces/SearchView.tsx
  - src/lib/paths.ts
  - src/lib/tabGroups.ts
tests:
  - src/lib/paths.test.ts
  - src/chrome/ProjectGroups.test.ts
---

# 15 — Nom et icône des projets

## Contrat à conserver

Nom du projet dans le header, logo détecté à la racine et logo personnalisé fonctionnent dans rail et recherche.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Le picker partagé conserve les marques et labels PK.

## Fichiers concernés

- [src/chrome/TitleBar.tsx](../../src/chrome/TitleBar.tsx)
- [src/chrome/ProjectLogoIcon.tsx](../../src/chrome/ProjectLogoIcon.tsx)
- [src/hooks/useTabGroupLogos.ts](../../src/hooks/useTabGroupLogos.ts)
- [src/surfaces/SearchView.tsx](../../src/surfaces/SearchView.tsx)
- [src/lib/paths.ts](../../src/lib/paths.ts)
- [src/lib/tabGroups.ts](../../src/lib/tabGroups.ts)

## Vérification

`node scripts/pk-features.mjs check 15` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Ouvrir un projet avec icon.png, puis un logo personnalisé ; vérifier header, rail et recherche.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
