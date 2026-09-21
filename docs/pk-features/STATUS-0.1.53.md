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
| 06 | Notifications par projet | `diff-06-10-settings-providers.patch` | verified |
| 07 | Réglages/recherche PK | `diff-06-10-settings-providers.patch` | verified |
| 08 | Fournisseurs PK | `diff-06-10-settings-providers.patch` | verified |
| 09 | Fournisseurs custom | `diff-06-10-settings-providers.patch` | verified |
| 10 | Modèle et effort | `diff-06-10-settings-providers.patch` | verified |
| 11 | Comptes et authentification | `diff-11-15-accounts-quotas-rail.patch` | verified |
| 12 | Quotas CodexBar | `diff-11-15-accounts-quotas-rail.patch` | verified |
| 13 | Accès Codex | `diff-11-15-accounts-quotas-rail.patch` | verified |
| 14 | Rail activité/projets | `diff-11-15-accounts-quotas-rail.patch` | verified |
| 15 | Identité des projets | `diff-11-15-accounts-quotas-rail.patch` | verified |
| 16 | Composer PK | `diff-16-composer.patch` | verified |
| 17 | Apparence et thèmes | `diff-17-apparence.patch` | verified |
| 18 | Terminal et dock | `diff-18-terminal.patch` | verified |
| 19 | Raccourcis | `diff-19-raccourcis.patch` | verified |
| 20 | Initialisation et skills | `diff-20-initialisation.patch` | verified |
| 21 | Updater officiel + PK | `diff-21-updater.patch` | ported |
| 22 | Branding Dev/Stable | `diff-22-branding-dev.patch` | ported |
| 23 | Build et DMG | `diff-23-build-dmg.patch` | pending |

Une feature ne sera marquée `ported` qu’après adaptation au nouvel arbre
`src/app`, `src/features` et `src/platform`, puis `verified` après compilation
et tests ciblés. Les statuts historiques des fiches ne constituent pas une
validation pour 0.1.53.
