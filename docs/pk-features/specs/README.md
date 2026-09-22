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

## Stratégie V45 (septembre 2026)

Base d’intégration : branche `integration/pk-v45` créée depuis `upstream/main` (`de95d66`,
MonoCode 0.1.53). Une feature est appliquée par livraison : V45 = feature 01, V46 = feature 02,
etc. Chaque feature est testée en build Dev (`MonoCodePK-Dev.app`) puis rapatriée sur
`perso/pk` pour le build Stable.

**Statuts du tableau :**
- **OK** — l’upstream 0.1.53 couvre déjà la fonctionnalité (nativement ou presque) ;
  vérification visuelle seulement, puis statut `verified`.
- **PORT** — à porter depuis la V44 (`recovery/pk-v43-plus-local`) vers le nouvel arbre ;
  fichiers remappés (`src/lib/*` → `src/features/*/model`, `src/chrome/*` → `src/app/shell`
  ou `src/features/*/ui`).

## Tableau d’état des 37 features (audit vs upstream 0.1.53)

| #  | Feature                              | Statut | Notes d’audit                                                            |
|----|--------------------------------------|--------|--------------------------------------------------------------------------|
| 01 | Focus de l’onglet actif              | PORT   | `SurfaceTabs.tsx` déplacé en `src/features/workspace/ui/` ; logique sélection native, style PK à réappliquer |
| 02 | Onglets en activité                  | OK*    | `busyHarnesses`/`doneHarnesses` natifs dans TitleBar ; vérifier visuel PK (glow) |
| 03 | Terminal en onglet                   | OK*    | `terminalTab.ts` natif (OSC cwd, running) ; vérifier parité avec V44      |
| 04 | Titre Workspace ou projet            | PORT   | Titre = conversation uniquement ; PK ajoutait mode projet (`projectTitle.ts` à recréer dans `src/features/settings/model/`) |
| 05 | Onglet Notes                         | OK*    | NotesView natif + toggle App.tsx ; vérifier ouverture en onglet workspace |
| 06 | Badge PK                             | PORT   | `pkVariant.ts`/`pkVersion.ts` absents ; à recréer                        |
| 07 | Actions Explorer                     | PORT   | `Reveal in Finder`/`Initialize project` absents ; backend `project_init.rs` à porter |
| 08 | Actions Changes                      | PORT   | Actions PK sur `GitChangesPanel.tsx` (désormais `src/features/source-control/ui/`) à reporter |
| 09 | Icône de projet                      | OK*    | `projectLogos.ts` natif (droppable + src) ; vérifier icon.png/icon.jpg    |
| 10 | Ordre des projets                    | OK*    | `reorderSubset`/`railOrder` natifs dans ProjectRail                       |
| 11 | Providers custom — sélection         | PORT   | `customProviders.ts` + backend `custom_providers.rs` entièrement absents  |
| 12 | Providers activables                 | PORT   | Idem 11                                                                   |
| 13 | Ordre des providers                  | PORT   | Idem 11                                                                   |
| 14 | Quotas multiples                     | PORT   | `rateLimits.ts` natif (525 l.) mais mono-provider ; V44 avait multi (751 l.) |
| 15 | Fenêtres de quota                    | PORT   | Dépend de 14                                                              |
| 16 | Affichage used/remaining             | PORT   | Dépend de 14 ; `UsageFooter.tsx` natif à étendre                          |
| 17 | Check for Updates en haut Settings   | PORT   | `UpdateRow` natif mais en bas (« About ») ; déplacer + style PK           |
| 18 | Presets de thèmes                    | PORT   | `appearance.ts` natif (hue/sat/lightness) sans presets ; V44 en avait     |
| 19 | Accent + working glow                | PORT   | Accent natif ; `busyGlowSettings.ts` absent à porter                      |
| 20 | Custom actions / highlight           | PORT   | MenuBar natif, actions PK à reporter                                      |
| 21 | Keybindings personnalisables         | PORT   | Backend `keybindings.rs` + `keybindings.ts` absents (port lourd)          |
| 22 | Auto-export des notes                | PORT   | Absent ; à porter (`notes.ts`, `notes.rs`)                                |
| 23 | Providers PK et modèles              | OK*    | Modèles GLM/MiniMax/Kimi/Qwen/DeepSeek natifs ; vérifier catalogue V44    |
| 24 | Comptes et accès Codex              | OK     | `providerAccounts.ts` natif complet (création, renommage, credentials)    |
| 25 | Notes, tags, export Markdown         | OK*    | Notes natives ; vérifier tags/export vs V44                               |
| 26 | Initialisation projet et skills      | PORT   | `projectInit.ts` + backend absents ; `SkillsPage.tsx` natif à étendre     |
| 27 | Rail activité / revue                | PORT   | ProjectRail natif ; hooks PK d’activité à reporter                        |
| 28 | Updater à deux axes                  | PORT   | Updater natif mono-axe (`plugin-updater`) ; port `pkUpdateDialog` + `sync-pk-update.sh` |
| 29 | Build, identité PK, distribution     | PORT   | `tauri.pk.conf.json`, scripts build, icônes à rapatrier                   |
| 30 | Second Opinion                       | OK     | Natif complet (`secondOpinion.ts`, Button, Card)                          |
| 31 | Handoff                              | OK     | Natif (`handoff.ts`, `handoffTurn.ts`, HandoffMiniCard)                   |
| 32 | Niveau d’effort                      | PORT   | `effort` présent dans ModelPicker mais pas d’EffortPicker PK              |
| 33 | Rappels de sessions                  | OK*    | `useSessionReminders` natif ; vérifier parité presets V44                 |
| 34 | Notifications par projet             | OK*    | `useNotificationProjects`/`useProjectNotificationPreferences` natifs ; vérifier |
| 35 | Logos providers                      | PORT   | 5 SVG manquants : gemini, mimo, nvidia, openrouter, zai                   |
| 36 | Groupes projets                      | OK*    | `projectGroups.ts` natif ; vérifier UI rail vs V44                        |
| 37 | Notification de livraison            | OK*    | `updateNotice.ts`/`appLifecycle.ts` natifs ; vérifier flux PK (28)        |

`OK*` = couverture native probable, à confirmer par test visuel avant de passer `verified`.
Les features `OK` ne sont re-testées qu’une fois leur feature porteuse portée (ex. 37 dépend de 28).

## Ordre de portage recommandé

Les dépendances imposent cet ordre dans les livraisons : 01 → 04 → 06 → 29 (identité avant
tout le reste) → 07 → 08 → 11/12/13 (bloc providers custom) → 14/15/16 (bloc quotas) →
17 → 18 → 19 → 20 → 21 → 22 → 26 → 27 → 28 → 32 → 35, puis re-test des `OK*`.
