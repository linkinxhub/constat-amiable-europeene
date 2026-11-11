# Parité native — lot des fiches A/B

Référence web : canonical/main 91a07f6 (corrections de vitrine incluses), modèle features/constat/model.ts et composants fields.tsx/form-details.tsx. Point de retour : checkpoint/before-native-parity-20261104. Projet Flutter 0.5.1+9, app précédente conservée.

Objectif global demandé : tous les champs, choix et parcours web rendus nativement. Aucun objectif à 100 % déclaré atteint sur la seule présence des pages.

## Lot réalisé

- Composants Flutter partagés entre formulaire local et édition de sa fiche de session.
- 10 champs principaux et 24 champs complémentaires du véhicule ; conducteur et assuré distincts. Type et remorque restent séparés, données historiques conservées.
- Listes exactes de pays, marques selon véhicule, assureurs, permis, points de choc et couverture, saisie libre toujours accessible ; aucun fait précoché.
- Quatre dates complémentaires avec sélecteur natif et effacement explicite.
- Ville/commune dans la situation locale, déjà prise en compte par le PDF existant.
- Groupes de rubriques et suggestions de dégâts depuis les mêmes sources FR/EN/DE/NL ; ajout sans écrasement, limite 4000 caractères et pas de doublon.
- 17 circonstances et invalidation de la confirmation lors d’un changement ; circonstances historiques conservées et lisibles.
- Guide natif actualisé dans les quatre langues. Aucun changement de guide web nécessaire : le contrat web reste la référence.

## Acceptation et vérification

Tests de contrat : inventaire des 34 champs contre le schéma serveur réel et comparaison des listes/libellés dans 4 langues. Tests Flutter : présence des champs, sélection puis saisie libre, conservation du nom et des données inconnues à 320 px, invalidation des circonstances et suggestions bornées. Suite complète et build consignés dans STATUS.md. Ces tests ne prouvent pas la parité fonctionnelle intégrale.

## Écarts encore ouverts

| Domaine | Travail restant avant équivalence complète |
|---|---|
| Identité | Authentification mobile supportée, renouvellement, déconnexion, reprise de session. L’identité du navigateur n’est pas réutilisable par hypothèse. |
| Situation | GPS, adresse proposée avec consentement, point confirmé, fuseaux et règles exactes de l’heure future à aligner. |
| Parcours | Choix de rôle/langue/photo, questionnaire chronologique et saisie Express, données par conducteur et confirmations A+B à porter intégralement. |
| Médias et IA | Photos/annotations, croquis libre et IA, OCR et validation des extractions, traductions et consentements. |
| Session | Synchronisation sans écrasement, faits communs A, progression/fin, invitations/QR de partage et qualification à deux identités réelles. |
| PDF et signatures | Styles, modèle exact, annexes, préparation finale figée, signatures personnelles, lecture/téléchargement du PDF serveur. |
| Compte/admin | Fonctions complètes de gestion, rétention/IA/feedback images, configuration et médias publiés selon contrat serveur. |
| Validation | Tests comparatifs des règles de complétude, sécurité serveur inchangée, Android/iOS, deux téléphones, hors ligne et reprise réseau. |

Aucune nouvelle identité, autorisation, souscription ou donnée réelle créée dans ce lot. Aucune production publiée. Les champs présents et leurs listes sont qualifiés ; le produit entier ne l’est pas encore. Le prochain lot doit résoudre l’authentification mobile avant toute promesse de synchronisation réelle.
