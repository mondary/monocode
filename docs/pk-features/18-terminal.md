---
id: 18
status: verified
upstream: v0.1.50
files:
  - src/surfaces/ProjectTerminalDock.tsx
  - src/surfaces/PaneTree.tsx
  - src/lib/projectTerminal.ts
  - src/lib/pty.ts
  - src/lib/terminalActivity.ts
  - src/chrome/UsageFooter.tsx
tests:
  - src/lib/projectTerminal.test.ts
  - src/lib/terminalActivity.test.ts
  - src/chrome/UsageFooter.test.ts
---

# 18 — Terminaux et dock

## Contrat à conserver

Positions du dock, onglets et bouton remplacé par le processus actif fonctionnent.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Rétablir le bouton Terminal 0.1.50 sans perdre les placements PK.

## Fichiers concernés

- [src/surfaces/ProjectTerminalDock.tsx](../../src/surfaces/ProjectTerminalDock.tsx)
- [src/surfaces/PaneTree.tsx](../../src/surfaces/PaneTree.tsx)
- [src/lib/projectTerminal.ts](../../src/lib/projectTerminal.ts)
- [src/lib/pty.ts](../../src/lib/pty.ts)
- [src/lib/terminalActivity.ts](../../src/lib/terminalActivity.ts)
- [src/chrome/UsageFooter.tsx](../../src/chrome/UsageFooter.tsx)

## Vérification

`node scripts/pk-features.mjs check 18` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Ouvrir un terminal, changer sa position et lancer un processus court ; vérifier le contrôle du footer.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
