---
id: 06
status: verified
upstream: v0.1.50
files:
  - src/surfaces/SettingsView.tsx
  - src/surfaces/ProjectNotificationSettings.tsx
  - src/chrome/Sidebar.tsx
  - src/chrome/ProjectRail.tsx
  - src/hooks/useInputNotifications.ts
tests:
  - src/surfaces/SettingsView.test.ts
  - src/surfaces/ProjectNotificationSettings.test.ts
  - src/hooks/projectNotificationFlow.test.ts
---

# 06 — Notifications par projet

## Contrat à conserver

Les réglages par projet sont accessibles depuis les menus ; une demande répétée ouvre et met en évidence le bon projet.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Raccorder le composant existant et le contexte de mise en évidence ; conserver les actions PK du rail.

## Fichiers concernés

- [src/surfaces/SettingsView.tsx](../../src/surfaces/SettingsView.tsx)
- [src/surfaces/ProjectNotificationSettings.tsx](../../src/surfaces/ProjectNotificationSettings.tsx)
- [src/chrome/Sidebar.tsx](../../src/chrome/Sidebar.tsx)
- [src/chrome/ProjectRail.tsx](../../src/chrome/ProjectRail.tsx)
- [src/hooks/useInputNotifications.ts](../../src/hooks/useInputNotifications.ts)

## Vérification

`node scripts/pk-features.mjs check 06` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Depuis le menu d’un projet, ouvrir ses notifications, changer une catégorie et répéter l’ouverture.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
