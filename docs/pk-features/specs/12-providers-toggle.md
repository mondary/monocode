# 12 — Providers activables et désactivables

**Catégorie :** 🔌 Providers & modèles  
**Audit 0.1.53 :** 🔧 PORT  
**Note d audit :** Idem 11

**Statut :** pending  
**Lot historique :** 08/09/12

## Fonction et raison

Chaque provider doit pouvoir être coché ou décoché sans suppression, afin de maîtriser la liste
visible et les quotas affichés.

## Spécifications fonctionnelles

- Le clic modifie uniquement la visibilité/activation.
- La configuration reste stockée lorsque le provider est désactivé.
- Le picker, le footer et les quotas utilisent le même état.

## Impacts et diff

Comparer settings flags, provider registry, ModelPicker, UsageFooter et persistence.
Zones V44 : `src/lib/settings.ts`, `src/lib/harness/register.ts`, `src/chrome/UsageFooter.tsx`.

## Migration

Créer un modèle d’état unique, migrer les anciennes préférences par défaut activé, puis tester
activation, désactivation, relance et compte existant.

