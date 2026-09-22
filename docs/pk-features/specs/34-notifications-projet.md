# 34 — Notifications par projet

**Statut :** pending  
**Lot historique :** 06

## Fonction et raison

Chaque projet doit pouvoir régler ses notifications et ouvrir directement le bon écran depuis le rail ou le menu.

## Spécifications fonctionnelles

- Configurer catégories et mute par projet.
- Mettre en évidence le projet ciblé.
- Persister les réglages sans les confondre avec les réglages globaux.

## Impacts et diff

Comparer notification preferences/projects, SettingsView, ProjectNotificationSettings, rail et hooks.
Zones V44 : `src/lib/notificationProjects.ts`, `src/hooks/useProjectNotificationPreferences.ts`.

## Migration

Adopter le stockage upstream puis migrer les clés PK par projet. Tester ouverture depuis deux projets, mute, échéance et relance.

