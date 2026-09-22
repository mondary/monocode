# 26 — Initialisation projet et skills

**Catégorie :** 📁 Projets  
**Audit 0.1.53 :** 🔧 PORT  
**Note d audit :** projectInit.ts + backend absents ; SkillsPage.tsx natif à étendre

**Statut :** pending  
**Lot historique :** 20

## Fonction et raison

Initialize doit préparer un projet sans écraser l’existant, et l’utilisateur doit pouvoir consulter
et utiliser les skills dans l’application.

## Spécifications fonctionnelles

- Créer seulement les fichiers/liens absents.
- Afficher une preview des skills.
- Respecter les sources configurées.
- Signaler clairement permission ou fichier invalide.

## Impacts et diff

Comparer projectInit, fs/paths, Tauri project_init/skills, SkillsPage et FileTree.
Zones V44 : `src/lib/projectInit.ts`, `src/lib/paths.ts`, `src/surfaces/SkillsPage.tsx`.

## Migration

Porter les contrats de chemin upstream ; ne pas exécuter Initialize sur le dépôt de migration.
Tester deux initialisations dans un dossier temporaire et une preview.

