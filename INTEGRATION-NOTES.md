# Intégration amont 0.1.50 — reprise

Branch: integration-0.1.50. tsc 0 erreur. Tests: ~48 échecs sur 2555.

## Reste (par priorité)
1. SidebarRename (19): port complet multisélection amont (focus project picker,
   prefetch au survol, cas limite range). Base déjà posée (onSessionCardSelect 3-modifiers).
2. NotesView (11): port du picker "move" amont dans NoteEditor PK
   (recents/activeCwd/projectChangeRef/saveNow — voir NoteEditor upstream 532-560).
3. SettingsView (8): port page notification settings amont (ProjectNotificationSettings.tsx
   existe déjà) + toggle close-to-tray dans GeneralPage + settings indexés.
4. UsageFooterAuth (3) + UsageFooter (2): panneau sign-in (loginHarness) dans footer PK.
5. codexLive (3): cf. codexProtocol (déjà upstream).
6. SecondOpinionButton (2): sous-menu effort — vérifier setHarnessModels/modelsFor.

## Ensuite
- cargo check && npm run build:pk
- DMG + release pk-2026.09.41 (GitHub + cask)
