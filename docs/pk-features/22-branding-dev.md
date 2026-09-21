---
id: 22
status: verified
upstream: v0.1.50
files:
  - src/lib/pkVariant.ts
  - src/lib/pkVersion.ts
  - src/chrome/TitleBar.tsx
  - src/surfaces/SettingsView.tsx
  - scripts/build-pk-app.sh
  - src-tauri/tauri.conf.json
  - VERSION
tests:

---

# 22 — Branding et variante Dev isolée

## Contrat à conserver

Icône, About, version PK et badge DEV distinguent le build de test de l’application quotidienne.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Validation native nécessaire ; un test frontend ne prouve pas l’isolation des données.

## Fichiers concernés

- [src/lib/pkVariant.ts](../../src/lib/pkVariant.ts)
- [src/lib/pkVersion.ts](../../src/lib/pkVersion.ts)
- [src/chrome/TitleBar.tsx](../../src/chrome/TitleBar.tsx)
- [src/surfaces/SettingsView.tsx](../../src/surfaces/SettingsView.tsx)
- [scripts/build-pk-app.sh](../../scripts/build-pk-app.sh)
- [src-tauri/tauri.conf.json](../../src-tauri/tauri.conf.json)
- [VERSION](../../VERSION)

## Vérification

Validation native : cargo check, build du bundle et inspection de l’application/DMG. Pas de validation automatique complète par un test frontend.

Test manuel : Lancer le bundle Dev, vérifier badge et identifiant com.monocode.pk.dev ; vérifier que la version quotidienne reste ouverte.

## Preuves

- Tests automatiques : `cargo check` OK (2026-09-18) ; bundle integration construit via `npm run build:pk:integration`.
- Bundle vérifié : `com.monocode.pk.dev`, `CFBundleShortVersionString = 0.1.50`, `icon.icns` présent.
- Test dans l'application : `/Applications/MonoCodePK-Dev.app` lancée, badge DEV + PK `2026.09.40` visibles, app quotidienne `MonoCode.app` intacte (observé par l'utilisateur).
- Commit de validation : REFACTO port upstream 0.1.50.

