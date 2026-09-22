# État des lieux des features PK — 37 features

Ce dossier décompose l'ancienne intégration PK (V44) en 37 fonctionnalités testables, une **fiche
md par feature** (`01-*.md` … `37-*.md`). Base d'intégration : branche `integration/pk-v45`
créée depuis `upstream/main` (`de95d66`, MonoCode 0.1.53).

Chaque fiche précise : comportement attendu, raison produit, impacts, fichiers à comparer dans
le diff, méthode d'application et validation. Les chemins sont ceux de la V44 ; à remapper vers
le nouvel arbre (`src/lib/*` → `src/features/*/model`, `src/chrome/*` → `src/app/shell` ou
`src/features/*/ui`).

**Statuts :** `pending` → `adapted` → `verified` → `manual`.

## Légende du tableau d'état

- ✅ **OK** — l'upstream 0.1.53 couvre déjà la fonctionnalité ; vérification visuelle puis `verified`.
- 🟡 **OK\*** — couverture native probable, à confirmer par test visuel avant `verified`.
- 🔧 **PORT** — à porter depuis la V44 (`recovery/pk-v43-plus-local`) vers le nouvel arbre.
- 🔗 — dépend d'une autre feature (indiquée).

---

## 🗂️ Onglets & Workspace

| #  | Fiche                                     | Feature                              | État | Notes d'audit |
|----|-------------------------------------------|--------------------------------------|------|---------------|
| 01 | [01-onglet-actif.md](01-onglet-actif.md) | 🎯 Focus de l'onglet actif           | 🔧 PORT | `SurfaceTabs.tsx` déplacé en `src/features/workspace/ui/` ; style PK à réappliquer |
| 02 | [02-onglets-en-activite.md](02-onglets-en-activite.md) | 📶 Onglets en activité (busy/done) | 🟡 OK* | `busyHarnesses`/`doneHarnesses` natifs dans TitleBar ; vérifier glow PK |
| 03 | [03-terminal-en-onglet.md](03-terminal-en-onglet.md) | 🖥️ Terminal en onglet | 🟡 OK* | `terminalTab.ts` natif (OSC cwd, running) ; vérifier parité V44 |
| 04 | [04-titre-workspace-projet.md](04-titre-workspace-projet.md) | 🏷️ Titre Workspace ou projet | 🔧 PORT | Titre natif = conversation ; `projectTitle.ts` à recréer |
| 05 | [05-onglet-notes.md](05-onglet-notes.md) | 📝 Onglet Notes | 🟡 OK* | NotesView natif + toggle ; vérifier ouverture en onglet workspace |

## 🔌 Providers & modèles — *bloc V45*

| #  | Fiche | Feature | État | Notes d'audit |
|----|-------|---------|------|---------------|
| 23 | [23-providers-modeles-pk.md](23-providers-modeles-pk.md) | 🤖 Providers PK et modèles (ZAI/MiMo/Zen…) | 🟡 OK* | Modèles GLM/MiniMax/Kimi/Qwen/DeepSeek natifs ; vérifier catalogue V44 |
| 35 | [35-logos-providers.md](35-logos-providers.md) | 🎨 Logos providers | 🔧 PORT | 5 SVG manquants : gemini, mimo, nvidia, openrouter, zai |
| 11 | [11-providers-custom-selection.md](11-providers-custom-selection.md) | ➕ Providers custom — sélection | 🔧 PORT | `customProviders.ts` + backend `custom_providers.rs` entièrement absents |
| 12 | [12-providers-toggle.md](12-providers-toggle.md) | ✅ Providers activables/désactivables | 🔧 PORT | Idem 11 |
| 13 | [13-ordre-providers.md](13-ordre-providers.md) | 🔢 Ordre des providers | 🔧 PORT | Idem 11 |
| 24 | [24-comptes-acces-codex.md](24-comptes-acces-codex.md) | 👥 Comptes et accès Codex | ✅ OK | `providerAccounts.ts` natif complet |
| 32 | [32-effort-modele.md](32-effort-modele.md) | 💪 Niveau d'effort du modèle | 🔧 PORT | `effort` dans ModelPicker natif mais pas d'EffortPicker PK |

## 📊 Quotas & usage — *bloc suivant (V46)*

| #  | Fiche | Feature | État | Notes d'audit |
|----|-------|---------|------|---------------|
| 14 | [14-quotas-multiples.md](14-quotas-multiples.md) | 📈 Quotas multiples | 🔧 PORT | `rateLimits.ts` natif (525 l.) mono-provider ; V44 multi (751 l.) |
| 15 | [15-fenetre-quota.md](15-fenetre-quota.md) | 🪟 Fenêtre de quota | 🔧 PORT 🔗 14 | Dépend de 14 |
| 16 | [16-usage-display.md](16-usage-display.md) | 🧮 Affichage used/remaining | 🔧 PORT 🔗 14 | `UsageFooter.tsx` natif à étendre (multi-comptes CodexBar) |

## 🎨 Identité & UI PK

| #  | Fiche | Feature | État | Notes d'audit |
|----|-------|---------|------|---------------|
| 06 | [06-badge-pk.md](06-badge-pk.md) | 🪪 Badge PK | 🔧 PORT | `pkVariant.ts`/`pkVersion.ts` absents |
| 18 | [18-themes-presets.md](18-themes-presets.md) | 🌈 Presets de thèmes | 🔧 PORT | `appearance.ts` natif sans presets |
| 19 | [19-accent-working-glow.md](19-accent-working-glow.md) | ✨ Accent + working glow | 🔧 PORT | Accent natif ; `busyGlowSettings.ts` à porter |
| 20 | [20-custom-actions-highlight.md](20-custom-actions-highlight.md) | 🖱️ Custom actions / highlight | 🔧 PORT | MenuBar natif, actions PK à reporter |
| 29 | [29-build-identite-pk.md](29-build-identite-pk.md) | 📦 Build, identité PK, distribution | 🔧 PORT | `tauri.pk.conf.json`, scripts build, icônes — **socle déjà posé en V45** (commit 4ed448e) |

## 📁 Projets

| #  | Fiche | Feature | État | Notes d'audit |
|----|-------|---------|------|---------------|
| 07 | [07-actions-explorer.md](07-actions-explorer.md) | 🗃️ Actions Explorer (Reveal/Initialize) | 🔧 PORT | Backend `project_init.rs` à porter |
| 08 | [08-actions-changes.md](08-actions-changes.md) | 🔀 Actions sur Changes | 🔧 PORT | Actions PK sur `GitChangesPanel.tsx` à reporter |
| 09 | [09-icone-projet.md](09-icone-projet.md) | 🖼️ Icône de projet | 🟡 OK* | `projectLogos.ts` natif (droppable + src) ; vérifier icon.png/jpg |
| 10 | [10-tri-projets.md](10-tri-projets.md) | ↕️ Ordre des projets | 🟡 OK* | `reorderSubset`/`railOrder` natifs dans ProjectRail |
| 26 | [26-initialisation-skills.md](26-initialisation-skills.md) | 🚀 Initialisation projet + skills | 🔧 PORT | `projectInit.ts` + backend absents ; `SkillsPage.tsx` natif à étendre |
| 27 | [27-rail-activite-revue.md](27-rail-activite-revue.md) | 🛤️ Rail activité/revue | 🔧 PORT | ProjectRail natif ; hooks PK d'activité à reporter |
| 36 | [36-groupes-projets.md](36-groupes-projets.md) | 🧩 Groupes de projets | 🟡 OK* | `projectGroups.ts` natif ; vérifier UI rail vs V44 |

## 📝 Notes

| #  | Fiche | Feature | État | Notes d'audit |
|----|-------|---------|------|---------------|
| 22 | [22-auto-export-notes.md](22-auto-export-notes.md) | 💾 Auto-export des notes | 🔧 PORT | Absent ; `notes.ts` + `notes.rs` à porter |
| 25 | [25-notes-edition-export.md](25-notes-edition-export.md) | 📄 Notes, tags, export Markdown | 🟡 OK* | Notes natives ; vérifier tags/export vs V44 |

## 🔄 Mises à jour

| #  | Fiche | Feature | État | Notes d'audit |
|----|-------|---------|------|---------------|
| 17 | [17-check-for-updates.md](17-check-for-updates.md) | ⬆️ Check for Updates en haut Settings | 🔧 PORT | `UpdateRow` natif mais en bas (About) ; déplacer + style PK |
| 28 | [28-updater-notification.md](28-updater-notification.md) | 🔄 Updater à deux axes (amont/PK) | 🔧 PORT | Updater natif mono-axe ; `pkUpdateDialog` + `sync-pk-update.sh` + `releaseNotes.ts` |
| 37 | [37-notification-livraison.md](37-notification-livraison.md) | 📣 Notification de livraison | 🟡 OK* 🔗 28 | `updateNotice.ts` natif ; vérifier flux PK |

## 🤝 Collaboration & sessions

| #  | Fiche | Feature | État | Notes d'audit |
|----|-------|---------|------|---------------|
| 30 | [30-second-opinion.md](30-second-opinion.md) | 🧠 Second Opinion | ✅ OK | Natif complet |
| 31 | [31-handoff.md](31-handoff.md) | 🤲 Handoff | ✅ OK | Natif |
| 33 | [33-rappels.md](33-rappels.md) | ⏰ Rappels de sessions | 🟡 OK* | `useSessionReminders` natif ; vérifier presets V44 |
| 34 | [34-notifications-projet.md](34-notifications-projet.md) | 🔔 Notifications par projet | 🟡 OK* | Hooks natifs ; vérifier |

## ⌨️ Système

| #  | Fiche | Feature | État | Notes d'audit |
|----|-------|---------|------|---------------|
| 21 | [21-keybindings.md](21-keybindings.md) | ⌨️ Keybindings personnalisables | 🔧 PORT | Backend `keybindings.rs` + `keybindings.ts` absents (port lourd) |

---

## Récapitulatif

| Catégorie | Total | ✅ OK | 🟡 OK* | 🔧 PORT |
|---|---|---|---|---|
| 🗂️ Onglets & Workspace | 5 | 0 | 3 | 2 |
| 🔌 Providers & modèles | 7 | 1 | 1 | 5 |
| 📊 Quotas & usage | 3 | 0 | 0 | 3 |
| 🎨 Identité & UI PK | 5 | 0 | 0 | 5 |
| 📁 Projets | 7 | 0 | 4 | 3 |
| 📝 Notes | 2 | 0 | 1 | 1 |
| 🔄 Mises à jour | 3 | 0 | 1 | 2 |
| 🤝 Collaboration & sessions | 4 | 2 | 2 | 0 |
| ⌨️ Système | 1 | 0 | 0 | 1 |
| **Total** | **37** | **3** | **12** | **22** |

Audit complémentaire V44 : `releaseNotes.ts` rattaché à la feature 28 (fenêtre What's New),
`contextUsage.ts` rattaché à 16, `useTabGroupLogos.ts` rattaché à 09. Aucune feature orpheline
au-delà des 37 fiches.

## Stratégie de portage V45+

Une feature par livraison : **V45 = bloc providers complet (23 → 35 → 11 → 12 → 13)**, puis
test, puis V46 = bloc quotas (14/15/16), etc.

Ordre recommandé après le bloc providers : 14/15/16 (quotas) → 01 → 04 → 06 → 07 → 08 →
17 → 18 → 19 → 20 → 21 → 22 → 26 → 27 → 28 → 32, puis re-test des 🟡 OK* pour passage
`verified`.

Les fiches historiques `../01-*.md` à `../23-*.md` restent les preuves de l'ancienne intégration.
