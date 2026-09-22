# 37 — Notification de livraison après mise à jour

**Catégorie :** 🔄 Mises à jour  
**Audit 0.1.53 :** 🟡 OK*  
**Note d audit :** updateNotice.ts/appLifecycle.ts natifs ; vérifier flux PK (28)

**Statut :** pending  
**Lot historique :** 21

## Fonction et raison

Après une mise à jour, la nouvelle instance doit expliquer ce qui vient d’être installé au lieu de laisser l’utilisateur deviner si l’opération a réussi.

## Spécifications fonctionnelles

- Enregistrer la livraison avant l’arrêt de l’ancienne instance.
- Afficher version, axe officiel/PK et résumé des nouveautés.
- Proposer Redémarrer et ne pas réafficher indéfiniment la notification.

## Impacts et diff

Comparer update notice, app lifecycle, release notes, WhatsNewDialog et relaunch scripts.
Zones V44 : `src/lib/updateNotice.ts`, `src/lib/appLifecycle.ts`, `src/chrome/WhatsNewDialog.tsx`.

## Migration

Conserver la persistance upstream et ajouter les métadonnées PK. Tester fermeture interrompue, relance réussie, notification consommée et deux axes.

