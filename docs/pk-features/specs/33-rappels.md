# 33 — Rappels de sessions

**Statut :** pending  
**Lot historique :** 02

## Fonction et raison

Les rappels permettent de retrouver une session à une échéance visible depuis la navigation.

## Spécifications fonctionnelles

- Créer, afficher, modifier, annuler et déclencher un rappel.
- Afficher échéance et état dans sidebar/notifications.
- Ne pas déplacer le focus de la session active à l’arrivée d’un rappel.

## Impacts et diff

Comparer session reminders, reminder notices, input notifications et Sidebar.
Zones V44 : `src/hooks/useSessionReminders.ts`, `src/chrome/ReminderNotices.tsx`.

## Migration

Conserver le scheduler upstream et reconnecter l’indicateur PK. Tester fuseau, rappel annulé, relance et session supprimée.

