# Port PK depuis MonoCode officiel 0.1.53

Base officielle figée le 21/09/2026 : `upstream/main` (`04711a1`).
Le tag de départ est `v0.1.53` (`5adc76a`) ; cinq commits officiels restent à
intégrer avant le port des deltas PK.

Chaque ligne devra produire un diff isolé dans `docs/pk-features/diffs/`, être
appliquée sur Dev, compilée et testée avant de passer à la suivante.

| # | Feature | Diff | État |
|---:|---|---|---|
| 01 | Orchestration sidebar | `diff-01-sidebar-orchestration.patch` | pending |
| 02 | Sélection multiple sidebar | `diff-02-sidebar-selection.patch` | verified |
| 03 | Notes par projet | `diff-03-05-notes.patch` | verified |
| 04 | Édition et tags des notes | `diff-03-05-notes.patch` | verified |
| 05 | Export Markdown des notes | `diff-03-05-notes.patch` | verified |
| 06 | Notifications par projet | `diff-06-notifications.patch` | pending |
| 07 | Réglages/recherche PK | `diff-07-settings.patch` | pending |
| 08 | Fournisseurs PK | `diff-08-providers-pk.patch` | pending |
| 09 | Fournisseurs custom | `diff-09-providers-custom.patch` | pending |
| 10 | Modèle et effort | `diff-10-model-effort.patch` | pending |
| 11 | Comptes et authentification | `diff-11-auth-comptes.patch` | pending |
| 12 | Quotas CodexBar | `diff-12-quotas-codexbar.patch` | pending |
| 13 | Accès Codex | `diff-13-codex-acces.patch` | pending |
| 14 | Rail activité/projets | `diff-14-rail-activite.patch` | pending |
| 15 | Identité des projets | `diff-15-projets-identite.patch` | pending |
| 16 | Composer PK | `diff-16-composer.patch` | pending |
| 17 | Apparence et thèmes | `diff-17-apparence.patch` | pending |
| 18 | Terminal et dock | `diff-18-terminal.patch` | pending |
| 19 | Raccourcis | `diff-19-raccourcis.patch` | pending |
| 20 | Initialisation et skills | `diff-20-initialisation.patch` | pending |
| 21 | Updater officiel + PK | `diff-21-updater.patch` | pending |
| 22 | Branding Dev/Stable | `diff-22-branding-dev.patch` | pending |
| 23 | Build et DMG | `diff-23-build-dmg.patch` | pending |

Une feature ne sera marquée `ported` qu’après adaptation au nouvel arbre
`src/app`, `src/features` et `src/platform`, puis `verified` après compilation
et tests ciblés. Les statuts historiques des fiches ne constituent pas une
validation pour 0.1.53.
