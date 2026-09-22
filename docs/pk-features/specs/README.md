# Spécifications des features PK

Une fiche md par feature (`01-*.md` … `37-*.md`). Chaque fiche porte elle-même sa
**catégorie**, son **état d'audit** (✅ OK / 🟡 OK* / 🔧 PORT face à upstream 0.1.53) et sa
note d'audit, en plus du détail (comportement, impacts, migration, validation).

Statuts de portage : `pending` → `adapted` → `verified` → `manual`.

Base d'intégration : `integration/pk-v45` depuis `upstream/main` (`de95d66`, 0.1.53).
Source du portage : `recovery/pk-v43-plus-local` (V44). Chemins V44 à remapper :
`src/lib/*` → `src/features/*/model`, `src/chrome/*` → `src/app/shell` ou `src/features/*/ui`.

## Plan de portage

- **V45** : bloc providers — 23 → 35 → 11 → 12 → 13 → 24 → 32
- **V46** : bloc quotas — 14 → 15 → 16
- Ensuite : 01 → 04 → 06 → 07 → 08 → 17 → 18 → 19 → 20 → 21 → 22 → 26 → 27 → 28 → 32, puis re-test des 🟡 OK*.

Les fiches historiques `../01-*.md` à `../23-*.md` restent les preuves de l'ancienne intégration.

> Ce fichier est volontairement minimal : l'état des lieux vit dans les fiches, pas ici,
> pour éviter les conflits à chaque mise à jour upstream.
