# 15 — Fenêtres de quota

**Statut :** pending  
**Lot historique :** 12

## Fonction et raison

L’utilisateur doit choisir 5 heures, hebdomadaire, mensuelle ou un mix des fenêtres utiles pour
comprendre sa consommation.

## Spécifications fonctionnelles

- Supporter `5 hours`, `weekly`, `monthly` et `all`.
- Autoriser plusieurs fenêtres simultanées si le provider les fournit.
- Afficher clairement la période et son échéance.
- Ne pas inventer une fenêtre absente de la réponse CLI.

## Impacts et diff

Comparer types rate limits, parsers CodexBar, settings et UsageFooter.
Zones V44 : `src/lib/rateLimits.ts`, `src/lib/rateLimitsFetch.ts`, `src-tauri/src/rate_limits.rs`.

## Migration

Ajouter une enum normalisée et une migration des anciennes préférences. Tester réponses partielles,
fenêtre inconnue et combinaison `all`.

