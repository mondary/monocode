---
id: 20
status: verified
upstream: v0.1.50
files:
  - src/lib/projectInit.ts
  - src/lib/fs.ts
  - src/lib/paths.ts
  - src-tauri/src/project_init.rs
  - src-tauri/src/skills.rs
  - src/surfaces/SkillsPage.tsx
  - src/chrome/FileTree.tsx
  - src/lib/explorerSettings.ts
tests:
  - src/lib/projectInit.test.ts
  - src/lib/explorerSettings.test.ts
  - src/surfaces/SkillsPage.test.ts
  - src/chrome/FileTree.test.ts
---

# 20 — Initialisation projet et skills

## Contrat à conserver

Initialize crée les liens et fichiers manquants sans écraser ; panneau PK et preview des skills amont sont présents.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Valider les sources configurées sans exécuter Initialize dans le dépôt courant.

## Fichiers concernés

- [src/lib/projectInit.ts](../../src/lib/projectInit.ts)
- [src/lib/fs.ts](../../src/lib/fs.ts)
- [src/lib/paths.ts](../../src/lib/paths.ts)
- [src-tauri/src/project_init.rs](../../src-tauri/src/project_init.rs)
- [src-tauri/src/skills.rs](../../src-tauri/src/skills.rs)
- [src/surfaces/SkillsPage.tsx](../../src/surfaces/SkillsPage.tsx)
- [src/chrome/FileTree.tsx](../../src/chrome/FileTree.tsx)
- [src/lib/explorerSettings.ts](../../src/lib/explorerSettings.ts)

## Vérification

`node scripts/pk-features.mjs check 20` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Dans un dossier de test, initialiser deux fois ; vérifier que les fichiers existants sont conservés et que la preview fonctionne.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
