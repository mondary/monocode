# 23 — Providers PK et modèles supplémentaires

**Statut :** pending  
**Lot historique :** 08/10

## Fonction et raison

Les providers PK (ZAI, MiMo, Gemini, Antigravity et assimilés) doivent conserver leurs icônes,
modèles, catalogues, protocole et routage.

## Spécifications fonctionnelles

- Afficher le provider et ses modèles comme un provider officiel.
- Router la session vers le bon adaptateur.
- Conserver sélection de modèle et niveau d’effort.
- Isoler les erreurs provider sans casser le picker global.

## Impacts et diff

Comparer registry, catalogues, adapters, protocoles, session et assets provider.
Zones V44 : `src/lib/harness/`, `src/assets/providers/`, `src/chrome/HarnessIcon.tsx`.

## Migration

Remapper chaque provider vers les interfaces upstream ; ne pas recopier l’ancien dossier harness en
bloc. Tester modèle, réponse, icône et provider indisponible.

