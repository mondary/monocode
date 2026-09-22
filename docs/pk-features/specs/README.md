# Spécifications atomiques des features PK

Ce dossier décompose les 23 anciens lots en fonctionnalités testables. Chaque fichier est une
unité de migration indépendante à reprendre depuis `upstream/main` vers une branche d’intégration.

Chaque fiche précise : le comportement attendu, la raison produit, les impacts, les fichiers à
comparer dans le diff, la méthode d’application et la validation. Les chemins indiqués sont ceux
de la V44 ; ils doivent être remappés vers le nouvel arbre upstream avant toute modification.

Statuts : `pending` → `adapted` → `verified` → `manual`. Aucun statut ne doit être avancé par la
seule présence d’un fichier ou d’un ancien patch.

## Fiches

01 onglet actif · 02 onglets en activité · 03 terminal en onglet · 04 titre Workspace/projet ·
05 onglet Notes · 06 badge PK · 07 actions Explorer · 08 actions Changes · 09 icône projet ·
10 tri des projets · 11 providers custom · 12 providers activables · 13 ordre des providers ·
14 quotas multiples · 15 fenêtre de quota · 16 affichage used/remaining · 17 Check for Updates ·
18 thèmes presets · 19 accent et working glow · 20 custom actions/highlight · 21 keybindings ·
22 auto-export notes · 23 providers PK et modèles · 24 comptes et accès Codex · 25 notes et export ·
26 initialisation et skills · 27 rail activité/revue · 28 updater et notification · 29 build et identité ·
30 second opinion · 31 handoff · 32 effort · 33 rappels · 34 notifications par projet · 35 logos providers ·
36 groupes projets · 37 notification de livraison.

Les fiches historiques `../01-*.md` à `../23-*.md` restent les preuves de l’ancienne intégration.
