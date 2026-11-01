# Audit complet Accordia — version 62

Date : 1 novembre 2026, Europe/Brussels. Demande : « Audit complet », après le signalement du bloc « Compléments non renseignés (23) ».

## Conclusion

Les contrôles exécutés passent pour le code applicatif : 247 tests, TypeScript et build. Ils ne suffisent pas à déclarer tous les parcours de production validés. Le défaut de compréhension/saisie signalé est reproduit : ce bloc est une liste en lecture seule, et son ouverture ne donne aucun champ ni raccourci de modification. La saisie reste accessible par « Modifier · Véhicules », puis les rubriques complémentaires du formulaire complet.

La CI reste rouge à cause d’une alerte modérée de dépendance de développement. Aucun changement fonctionnel, droit, secret, donnée utilisateur ou déploiement n’a été effectué pendant cet audit. La production reste en version 62.

## Périmètre et preuves

- Code publié : `80231de17bfc2a44dc490a6f47eed0560a1e1bb8`. État audité : `e44ad66a5720a982633518b6bf33ffc56ba63be7` (documentation de publication ajoutée, code applicatif identique).
- Lecture des consignes du dépôt et documents produit/architecture/feuille de route/statut/décisions/tests ; revue des parcours individuel, appareil commun et session A/B, OCR, synthèse/croquis, traduction, PDF, autorisations et conservation.
- `node scripts/verify-platform.mjs` : **247 réussis, 0 échec**, TypeScript et build réussis ; ESLint **0 erreur, 54 avertissements historiques**. Le build avertit aussi de gros chunks ; ce n’est pas une mesure des performances sur réseau mobile.
- Audit frais des dépendances : production **0 alerte connue** ; ensemble **1 modérée**, aucune haute/critique. Un audit de paquets ne prouve pas l’absence de vulnérabilité applicative.
- GitHub Actions, exécution `41334656520`, job `124931869187` : installation figée, vérification applicative et audit production réussis ; audit complet échoué. Les journaux identifient GHSA-g3hv-75wg-m249, 1 moderate.
- Journaux de production récents, lecture seule, limite 25 événements en erreur : deux réponses 404 de session, une 401 d’extraction ; aucun 5xx dans cet échantillon. Aucun lien causal établi avec le téléphone ou la capture de l’utilisateur.
- Aperçu navigateur local : consignes, sélection des trois modes, parcours individuel, passage au formulaire complet, accès direct à Vérification, ouverture des compléments, retour par « Modifier · Véhicules », ouverture des champs de l’assuré. Brouillon de test vide uniquement, aucun dossier réel modifié. Le bloc ouvert contient **24 libellés et 0 contrôle éditable** (23 dans la capture où le point de choc est déjà rempli). Capture inspectée : texte lisible sur la vue bureau, aucun dialogue superposé. Ce contrôle ne valide pas les écrans physiques mobiles.
- Console du navigateur : erreurs de l’extension de contrôle observées ; ne pas les attribuer à Accordia. Aucun crash applicatif observé pendant ce parcours limité.

## Écarts confirmés, par priorité

| Priorité | Constat et preuve | Effet | Correction proposée et validation attendue |
|---|---|---|---|
| P1 livraison / sécurité modérée | Minimatch de développement : GHSA-g3hv-75wg-m249. CI rouge au dernier audit complet. | Chaîne de qualité non entièrement verte ; risque de consommation excessive de ressources par motifs glob hostiles, selon l’avis fournisseur. Aucun chemin d’exploitation dans le serveur publié démontré. | Mettre à jour la chaîne de dépendances vers une version corrigée compatible, puis installation figée, 247 tests et deux audits verts. Ne pas masquer l’alerte ni forcer un changement majeur transitif sans validation. |
| P2 ergonomie, à traiter en premier pour la saisie | `features/constat/review.tsx` : `review-empty-controls` contient seulement une liste `<dl>` dans `<details>`. Reproduit dans le navigateur. | L’utilisateur ouvre le bloc et attend de pouvoir saisir. Le nombre désigne des compléments vides, pas des obligations bloquantes. | Ajouter « Compléter ces informations » pour la fiche autorisée ; expliquer « informations complémentaires selon votre situation ». Cibler et ouvrir le groupe concerné, avec focus clavier. Conserver la lecture seule de l’autre conducteur. Tester A/B, individuel, appareil commun, clavier et FR/EN/DE/NL. |
| P2 navigation | `features/constat/session-client.tsx` : le callback de relecture quitte la relecture et défile vers `participant-details`, sans exploiter la rubrique demandée. | Une action « Modifier » ne mène pas précisément au champ attendu, notamment circonstances/compléments. | Transmettre la cible de modification, ouvrir la bonne rubrique et placer le focus sans perdre la saisie. Vérifier qu’une action commune reste interdite au participant non autorisé et qu’aucune fiche étrangère ne devient éditable. |
| P2 cohérence des nouveaux PDF et historique | `server/final-service.ts`, `prepareUnlocked` : le cache des PDF traduits est recherché par session/révision/langue/style/croquis avant le calcul du digest incluant `PDF_RENDERER_VERSION`. | Un document traduit ancien peut être réutilisé sans adopter le nouveau QR, malgré la nouvelle version du moteur. C’est une déduction déterministe du chemin de code ; aucun ancien PDF utilisateur régénéré pour la reproduire en production. | Rendre visible la version du document et proposer une régénération explicite si nécessaire. Préserver les anciens octets/signatures et la réutilisation gratuite du cache ; ne pas déclencher silencieusement appel IA ou débit. Ajouter un cas de régression ancien moteur/cache traduit et un cas de PDF historique signé. |
| P3 maintenance | 54 avertissements ESLint historiques ; build avec gros chunks. | Dette de maintenance ; chargement potentiellement coûteux sur mobile, non chronométré ici. | Réduire les avertissements par petits lots ; mesurer réseau lent, mémoire et chargement avant de fractionner les modules lourds. Aucun avertissement supprimé artificiellement. |

L’avis Minimatch indique les versions affectées `<11.0.1` et le correctif `11.0.1` : https://github.com/advisories/GHSA-g3hv-75wg-m249 . La politique locale `minimumReleaseAge: 10080` impose sept jours d’ancienneté : conserver cette protection et vérifier la disponibilité des dépendances compatibles lors du lot de correction. La gravité modérée de l’avis n’est pas une vulnérabilité critique de production.

## Sécurité et intégrité : protections vérifiées dans le code et les tests

| Domaine | Contrôle présent | Limite de la conclusion |
|---|---|---|
| Authentification et propriété | Authentification serveur, compte actif, accès propriétaire aux rapports, appartenance à la session, routes privées testées sans authentification. | Aucun test d’intrusion indépendant ni deuxième identité réelle dans ce lot. |
| Écriture et concurrence | Origine et en-tête applicatif contrôlés, JSON borné/temporisé, schémas stricts, contrôle de révision et conflits, écriture limitée à sa fiche. | Pas de campagne de charge ou réseau mobile intermittent prolongée. |
| Invitation | Jeton à durée limitée et usage unique, empreinte serveur ; fragment client ; reprise locale bornée avec vérification d’appartenance. | La nouvelle reprise doit encore être éprouvée sur deux téléphones/comptes réels. L’accès au site est distinct de l’invitation au constat. |
| IA documentaire | Accès ordinaire fermé côté serveur, configuration administrateur, quotas, propositions à vérifier, documents bruts non archivés par ce service. | L’autoremplissage pour tous les utilisateurs n’est pas livré commercialement. Aucune nouvelle extraction réelle ici. |
| Synthèse et croquis | Consentements, proposition liée à la révision, validation A/B, invalidation lors des changements et garde au PDF. | Aucun nouveau test de qualité sémantique fournisseur ; une proposition erronée reste possible et doit être relue. |
| Clé fournisseur | Chiffrement AES-GCM et administration par identifiant stable, destination fournisseur fixée, délais et sorties bornés. | Revue de code, pas d’audit de coffre/rotation opérationnelle indépendant. |
| PDF et QR | Révision et états participants contrôlés, signatures propres, garde de validation IA, historique conservé ; QR à origine fixe et accès authentifié, sans secret d’invitation. | Téléchargement final hébergé, ouverture sur téléphone et scan interappareils non rejoués ici. |
| Paiements | Parcours Stripe de test, signature webhook, prix vérifiés et opérations atomiques. | Paiements réels et lancement des offres Premium non validés ; une préférence de compte ne confère pas un abonnement. |

## Ce qui manque pour être plus efficace et robuste

1. **Saisie ciblée depuis la relecture** : correction du bloc signalé et accès à chaque rubrique ; messages distinguant obligatoire, complémentaire et non applicable. Mesurer le temps de remplissage et les abandons plutôt que compter seulement les champs remplis.
2. **Recette réelle A/B** : deux comptes autorisés, deux téléphones, lien complet puis QR, langues différentes, expiration, actualisation, réponse perdue, modifications concurrentes, reprise et refus d’accès. Terminer par les deux relectures/signatures de test et le téléchargement du même PDF sur les deux appareils. Ne pas confondre tests serveur à deux acteurs et deux personnes physiques.
3. **Disponibilité OCR pour le public ciblé** : définir les droits serveur et quotas commerciaux avant ouverture. Les photos facilitent les informations des pièces ; lieu/faits/circonstances/observations et validation humaine restent nécessaires. Les fonctions IA historiques non commerciales ne constituent pas automatiquement un contournement Premium : le produit prévoit de conserver leur accès existant tant que les offres sont fermées.
4. **IA multilingue et qualité** : vérifier photos floues, recto/verso, pièces étrangères, dates contradictoires, mauvaise fiche A/B, champ absent et faux positif ; comparer la proposition à la pièce et au PDF. Pour la synthèse, une proposition possède une langue ; quatre langues d’interface ne garantissent pas quatre traductions de cette proposition.
5. **Exploitation** : nettoyage serveur actuellement déclenché par l’activité authentifiée. L’accès expire à échéance, mais la suppression physique peut attendre de nouvelles requêtes. Ajouter une maintenance indépendante, des alertes et un exercice réel de sauvegarde/restauration ; conserver les durées annoncées dans les quatre langues.
6. **Livraison** : CI entièrement verte avant prochaine publication, protections de branche et procédure de retour à une version connue. Les contrôles actuels détectent l’alerte de développement et bloquent correctement la chaîne.
7. **PDF et mobile** : contrôle de lecture de tous les champs longs, annexes, cas à un/deux véhicules, signatures, QR imprimé et photo, téléchargement Safari/Chrome. Évaluer une présentation plus compacte sans supprimer les données ni modifier les originaux historiques.

## Limites et protocole de fermeture

Audit transversal de code, tests automatisés, échantillon de journaux et interaction navigateur locale ; il ne vaut ni certification de sécurité, ni validation juridique/assureur, ni preuve d’absence de faille. Aucun appel IA payant, paiement réel, purge, changement de droits ou nouvelle signature utilisateur. Les recettes historiques restent historiques, elles ne sont pas comptées comme nouvel essai de la version 62.

Pour fermer les écarts : lot ergonomie avec tests ciblés et guide FR/EN/DE/NL synchronisé ; lot dépendances après vérification de compatibilité et d’ancienneté ; prévisualisation et recette hébergée A/B ; autorisation de publication dans le lot correspondant. Guide utilisateur vérifié pendant cet audit, aucun comportement visible modifié : pas de mise à jour du tutoriel nécessaire pour ce rapport seul.
