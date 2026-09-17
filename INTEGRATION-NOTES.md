# Intégration amont 0.1.50 — état au 2026-09-18

Branche `integration-0.1.50` (base 860c58f + merge upstream/main 8743e9a).

## Fait
- ~100 conflits de merge résolus (features PK conservées + nouveautés amont intégrées :
  orchestration, provider accounts, accent color, project groups, notification mutes,
  pasteboard, hermes harness, control socket...)
- `npx tsc --noEmit` : 0 erreur
- Build vite : OK

## Reste à faire
- 86 tests vitest en échec (tests amont nouveaux dont le code support a été
  partiellement écrasé par les résolutions rerere périmées). Clusters :
  - SkillsPage.test (27) : liste skills vide au rendu — investiguer le mock list_skills
  - SidebarRename.test (26) : props Sidebar manquantes (session multiselection upstream)
  - NotesView.test (11), SettingsView.test (8) : idem
  - codexProtocol.test (3) : prendre la version upstream du comportement sandbox
  - UsageFooterAuth.test (3) : panneau sign-in upstream (loginHarness) absent du footer PK
  - UsageFooter.test (2), agentMarkdownSpacing (OK depuis), SecondOpinionButton (2) :
    sous-menu effort — vérifier models.ts / setHarnessModels
- Puis : cargo check, build:pk, DMG, release pk-2026.09.41
