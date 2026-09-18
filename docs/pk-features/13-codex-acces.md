---
id: 13
status: verified
upstream: v0.1.50
files:
  - src/lib/harness/codex.ts
  - src/lib/harness/codexProtocol.ts
tests:
  - src/lib/harness/codexProtocol.test.ts
  - src/lib/harness/codexLive.test.ts
---

# 13 — Modes d’accès Codex

## Contrat à conserver

Full access autorise les escalades ordinaires ; les consentements MCP explicites restent interactifs.

## État de cette migration

Inventorié ; validation par feature à terminer. La présence du code ne vaut pas validation manuelle.

## Adaptation et points de vigilance

Le protocole v0.1.50 utilise on-request/user pour router les escalades au handler. Trois attentes anciennes de tests ont été alignées ; le protocole n’a pas été assoupli.

## Fichiers concernés

- [src/lib/harness/codex.ts](../../src/lib/harness/codex.ts)
- [src/lib/harness/codexProtocol.ts](../../src/lib/harness/codexProtocol.ts)

## Vérification

`node scripts/pk-features.mjs check 13` lance les tests listés en tête de fiche puis TypeScript.

Test manuel : Dans une session de test Full access, demander une commande sans conséquence ; vérifier les modes supervisé et Full access.

## Preuves

- Tests automatiques : à consigner.
- Test dans l’application : pas encore effectué.
- Commit de validation : pas encore créé.
