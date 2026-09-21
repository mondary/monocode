---
id: 16
status: verified
upstream: v0.1.50
files:
  - src/chrome/Composer.tsx
  - src/lib/composerResize.ts
  - src/chrome/TitleBar.tsx
  - src/index.css
tests:
  - src/chrome/Composer.test.ts
  - src/chrome/ComposerFileDrop.test.ts
---

# 16 — Composeur PK

## Contrat à conserver

Croissance jusqu’à dix lignes, texte synchronisé, boutons steer/queue et sélection d’onglet restent utilisables.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Conserver la hauteur et les actions PK pendant le port du picker amont.

## Fichiers concernés

- [src/chrome/Composer.tsx](../../src/chrome/Composer.tsx)
- [src/lib/composerResize.ts](../../src/lib/composerResize.ts)
- [src/chrome/TitleBar.tsx](../../src/chrome/TitleBar.tsx)
- [src/index.css](../../src/index.css)

## Vérification

`node scripts/pk-features.mjs check 16` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Saisir douze lignes ; vérifier le défilement, puis steer/queue pendant une réponse et la barre d’onglet sélectionné.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
