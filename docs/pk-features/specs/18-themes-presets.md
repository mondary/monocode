# 18 — Presets de thèmes PK

**Statut :** pending  
**Lot historique :** 17

## Fonction et raison

Les presets donnent une apparence cohérente immédiatement, notamment Dracula, Frappé, Latte,
Macchiato et les autres variantes Catppuccin utilisées dans V44.

## Spécifications fonctionnelles

- Afficher tous les presets validés dans un sélecteur.
- Appliquer le thème sans rechargement destructif.
- Persister le choix et respecter le mode système si prévu.
- Garantir contraste et lisibilité des états actifs.

## Impacts et diff

Comparer appearance model, `index.css`, SettingsView, variables CSS et tests appearance.
Zones V44 : `src/lib/appearance.ts`, `src/index.css`, `src/surfaces/SettingsView.tsx`.

## Migration

Porter les tokens plutôt que l’ancien stylesheet complet. Vérifier chaque preset sur Settings,
terminal, quotas, notes et dialogs.

