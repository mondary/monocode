---
id: 23
status: verified
upstream: v0.1.50
files:
  - package.json
  - scripts/build-pk-app.sh
  - scripts/build-pk-stable.sh
  - scripts/package-pk-dmg.sh
  - .github/workflows/release-pk.yml
  - scripts/update-homebrew-pk-cask.py
tests:

---

# 23 — Build, DMG et distribution

## Contrat à conserver

Scripts npm PK restaurés ; bundle issu de la branche en cours, DMG contenant l’app, Applications et fond.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Les scripts npm PK ont disparu lors du merge. Publication GitHub/Homebrew séparée de la validation locale.

## Fichiers concernés

- [package.json](../../package.json)
- [scripts/build-pk-app.sh](../../scripts/build-pk-app.sh)
- [scripts/build-pk-stable.sh](../../scripts/build-pk-stable.sh)
- [scripts/package-pk-dmg.sh](../../scripts/package-pk-dmg.sh)
- [.github/workflows/release-pk.yml](../../.github/workflows/release-pk.yml)
- [scripts/update-homebrew-pk-cask.py](../../scripts/update-homebrew-pk-cask.py)

## Vérification

Validation native : cargo check, build du bundle et inspection de l’application/DMG. Pas de validation automatique complète par un test frontend.

Test manuel : Construire le bundle d’intégration sans remplacer l’app quotidienne ; monter le DMG et vérifier contenu et version.

## Preuves

- Tests automatiques : `npm run build:pk:integration` produit `build/target/release/bundle/macos/MonoCode PK Dev.app` (0.1.50) sans installation ; `bash scripts/package-pk-dmg.sh` produit `build/releases/MonoCodePK_2026.09.40_aarch64.dmg` (app + lien Applications).
- DMG stable : construit depuis le worktree `monocodePK-stable` (branche `stable/pk`), version 0.1.49 — retard volontaire du canal stable sur l'intégration.
- Test dans l'application : DMG monté, contenu vérifié (`MonoCode PK.app` + `Applications`, `com.monocode.pk`).
- Commit de validation : REFACTO port upstream 0.1.50.

