# Master audit Accordia — 4 novembre 2026

## Décision

Consolider la plateforme existante avant tout élargissement commercial. Quatre défauts démontrés ont été corrigés dans ce lot. Le prompt maître associé a été rédigé avant leur application : [prompt complet](PROMPT_MAITRE_FIABILITE_2026-11-04.md). Les chantiers dépendant d’une nouvelle frontière d’identité, d’un hébergement public ou d’une recette terrain restent explicitement ouverts. Aucune promesse de plateforme sans erreurs n’est justifiable.

Source initiale : 63888719c1a3802fad4f1f5ffc16bb6b88ad647c, version 92 sauvegardée. Production : v90. Checkpoint : checkpoint/before-master-audit-v92-20261104. Audience custom conservée. Travail sur copie locale et Preview, sans mutation de dossiers réels ni publication productive.

## Constats et corrections appliquées

| Référence | Gravité et preuve initiale | Correction | Acceptation |
|---|---|---|---|
| A01 | Moyenne : un JSON de récupération passait le schéma avec dimensions déclarées 1×1 et en-tête PNG de 100000×100000 ; le validateur binaire serveur le refusait | Validation binaire existante chargée avant aperçu et écriture ; erreurs explicites, lectures parallèles bloquées | PNG/JPEG valides conservés ; PNG excessif, JPEG corrompu et aperçu PNG corrompu refusés ; aucune sauvegarde après rejet |
| A02 | Moyenne : première demande de suppression acceptée, répétition après réponse perdue en erreur 410 | Reçu technique minimal propriétaire/dossier/révision/date, transaction atomique, reprise idempotente même après purge | Deux demandes simultanées acceptées ; reprise après purge ; mauvais propriétaire, suspension, révision incompatible et dossier partagé refusés |
| A03 | Moyenne : fetch et lecture JSON sans échéance dans les nouveaux panneaux compte/profils | Délai 20 s, annulation au démontage, sans répétition automatique d’écriture ; credentials same-origin, no-store et redirections refusées | En-têtes et corps bloqués, annulation, conflit et succès testés ; résultat incertain expliqué |
| A04 | Faible : tutoriel complet importé et monté alors que son panneau était fermé | Import/montage à l’ouverture, attente locale et nouvelle tentative après erreur | Fermeture pendant chargement, rejet, nouvelle tentative et langues testés ; ouverture et progression en navigateur contrôlées |

L’impact distant de A01 n’a pas été démontré : il s’agit d’un défaut d’entrée locale non fiable. A02 retire l’accès, mais sa réponse ne certifie toujours pas une purge physique achevée. Le reçu minimal ne contient aucun contenu du constat ; sa durée de conservation et son effacement au niveau compte restent à définir. Migration 0022 additive, testée en D1 isolé et appliquée uniquement à la base locale.

## Couverture produit et manques

| Domaine | État constaté | Décision et critère suivant |
|---|---|---|
| Trois parcours, rôles A/B, quatre langues, conducteur/preneur distincts | Conservés ; gardes et tests existants maintenus | Recette réelle à deux identités/appareils avant ouverture plus large |
| Photos, originaux, croquis manuel, styles PDF et signatures manuelles | Conservés ; pas de verdict automatique ni signature copiée | Contrôler caméra, téléchargement disque et documents sur appareils physiques |
| Profils véhicule/assurance | Implémentés dans v92 sauvegardée ; sélection et application relues, données de personne exclues | Recette connectée réelle ; ne pas présenter comme déjà publié en v90 |
| Partage simplifié | Actions communes lien/copie/partage natif dans v92 | Ne pas confondre partage et réception par un tiers ; pas d’envoi automatique |
| Données serveur | Export du contenu courant et inventaire borné ; suppression non partagée avec retrait d’accès | Export intégral versions/PDF, droits des deux participants, purge planifiée, supervision et sauvegardes restent incomplets |
| Invité sans compte | Non réalisé ; entrée actuelle protégée par SIWC | Canal distinct authentifié, secret haché, expiration/révocation, cookie sécurisé et droits limités ; ne pas ouvrir l’audience par contournement |
| Hors réseau | Brouillons locaux, import JSON et indication réseau ; pas de réouverture complète hors connexion | Cache statique volontaire sans API privée, politique locale et tests fermeture/redémarrage/conflits |
| Vitrine et médias | Hiérarchie, contrastes contrôlés, vidéo réelle conservée, tutoriel différé | Mesurer performance/accessibilité représentatives ; ne pas annoncer score ou gain non mesuré |
| Commercialisation | Aucun nouveau paiement ou fournisseur ajouté | Droits/facturation réels, conditions pays et acceptation/licences à vérifier avant lancement ; offres annuelles/flottes/langues supplémentaires reportées |
| Exploitation | Suite automatisée et migration locale | Sauvegarde/restauration productive, suivi erreurs, pentest indépendant et engagements de service à démontrer |

## Sécurité et dépendances

Audit de production pnpm : zéro vulnérabilité connue signalée. Audit de toutes les dépendances : une alerte modérée Minimatch 3.1.5 dans la chaîne de développement ESLint, GHSA-g3hv-75wg-m249. La base GitHub indique une plage <11.0.1 ; le mainteneur documente notamment 10.2.6 affectée et 11.0.1 corrigée. L’applicabilité exacte à 3.1.5 reste une réserve, pas un faux positif déclaré. Aucun override majeur incompatible ni suppression d’alerte. La politique d’âge minimal des versions est conservée.

Le workflow quality inclut verify et les deux audits ; son étape toutes dépendances reste bloquante avec cette alerte. Aucun run de PR associé au commit de départ n’a été trouvé via l’outil limité à cette catégorie ; cela ne prouve ni absence de tout CI ni validation GitHub verte.

Scan de 607 fichiers texte suivis de 1 Mio maximum : deux candidats examinés, tous deux fixtures synthétiques dans les tests. Aucun secret réel confirmé dans ce périmètre. Binaires, fichiers plus grands, historique et fichiers ignorés non couverts. Aucune valeur de clé reproduite.

Les gardes existants identité active/propriétaire/A-B, CAS, taille de corps, quotas et origine des mutations sont conservés et couverts par la suite existante. Ce travail ne remplace pas un audit d’intrusion indépendant et ne certifie pas l’absence de vulnérabilité.

Sources primaires consultées :
- https://github.com/advisories/GHSA-g3hv-75wg-m249
- https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249
- https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static

## Performance et affichage

Baseline : bundle index 210058 octets (gzip 57346), framework 190152 (gzip 58943), policy-copy 147427 (gzip 53392). PDF 2680782 (gzip 1355100), jsQR 129995 (gzip 46220) et workspace 125826 (gzip 39466) sont des modules séparés ; la taille d’un module différé n’est pas son transfert initial. A04 supprime le montage prématuré du tutoriel ; aucun pourcentage de vitesse ni score Lighthouse inventé.

Preview : 40 combinaisons routes/langues/largeurs dans des iframes réelles. Accueil FR/EN/DE/NL × 375/768/1280/1440 ; tarifs, guide et constat FR/EN/DE/NL × 375/1280. Zéro débordement horizontal mesuré. Largeurs utiles réellement observées : 358, 360, 751, 1263, 1265, 1423 et 1425 px (barres de défilement et bordures expliquent la différence avec la largeur demandée). 64 contrôles des titres de confiance : blanc rgb(255,255,255). Capture étroite et bureau inspectées. Ceci ne constitue pas une émulation de téléphone ni un audit visuel exhaustif de tous les états.

Le constat n’a été contrôlé qu’à son entrée de sécurité dans cette matrice. Le compte connecté et les états d’accident remplis ne sont pas couverts par ces 40 combinaisons. Le tutoriel réel s’ouvre et progresse à l’étape 2/6. Le validateur réel dans le navigateur accepte PNG/JPEG valides et refuse l’image excessive ; aucun dossier transmis ou écrit pour cette sonde. Route temporaire de recette retirée, aperçu arrêté avant build final.

## Validation finale

Baseline : verify réussi, 347 tests. Après corrections : npm run verify réussi, TypeScript/build, lint 0 erreur et 53 avertissements historiques ; 353 tests réussis, zéro échec. Six tests métier/UI ajoutés dans tests/master-audit-v92.test.mjs ; suites existantes adaptées sans abandon d’assertions. Tests ciblés : 15/15 et 10/10 serveur ; la dernière variante de demandes simultanées est validée dans le verify final. Migration additive exécutée avec succès en base locale. TypeScript/build/lint et suite complète exigés avant sauvegarde.

Aucune recette de paiement, d’envoi réel, de deux comptes SIWC, de purge productive ni de restauration hébergeur revendiquée. Aucun dossier, rôle, abonnement, langue, style ou fonction existant supprimé. Les actions de récupération, attente réseau et suppression sont expliquées dans les quatre langues via continuity-copy, partagé par les panneaux et le guide ; tutoriel différé doté de messages FR/EN/DE/NL. Pas de nouvelle commande administrative exposée aux conducteurs.

## Plan de suite

1. Lever la réserve de dépendance avec une évolution compatible de la chaîne ESLint ; vérifier le CI réel et publier seulement après autorisation.
2. Recette connectée à deux appareils et suivi des opérations de données ; politique de reçus techniques et purge indépendante de l’activité.
3. Construire accès invité et hors réseau complet selon les frontières du prompt, avec tests avant activation.
4. Compléter export/droits/sauvegardes et préparation commerciale avec les fournisseurs et sources compétentes.

Retour arrière : conserver la version productive v90 et le checkpoint ; ne pas supprimer la table additive ou les reçus pour revenir au code antérieur. Toute publication de ce lot nécessite une nouvelle autorisation explicite.
