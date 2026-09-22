# 20 — Custom actions et highlight

**Statut :** pending  
**Lot historique :** 07/17

## Fonction et raison

Les actions personnalisées et leur mise en évidence rendent les commandes PK trouvables dans une
interface devenue plus riche.

## Spécifications fonctionnelles

- Afficher les actions au bon contexte.
- Permettre leur activation/désactivation sans perdre leur définition.
- Appliquer le highlight uniquement à l’action ciblée.
- Respecter raccourcis, clavier et accessibilité.

## Impacts et diff

Comparer action registry, SettingsView, menus, TitleBar et styles de highlight.
Zones V44 : `src/chrome/MenuBar.tsx`, `src/surfaces/SettingsView.tsx`, `src/index.css`.

## Migration

Rebrancher les actions sur les commandes upstream ; conserver les identifiants PK stables. Tester
action visible, action indisponible, recherche et exécution clavier.

