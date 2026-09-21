## 0.22I — Crédits autour du PDF traduit, validation locale
Route /api/billing/test/translation réservée au super-administrateur, configuration test obligatoire, origine/intention contrôlées et corps strict limité à 2 Kio. La session doit appartenir à cet utilisateur et translate=true ; le propriétaire/dossier sont résolus côté serveur. Le service existant de traduction et le véritable rendu PDF sont utilisés, sans simulation applicative.
La réutilisation d'un PDF traduit compatible est vérifiée sous verrou après les contrôles de révision, fin A/B et consentements, avant réservation : aucun appel IA ni débit, même à solde épuisé. Une nouvelle génération réserve un crédit et lie atomiquement la référence PDF et le débit dans D1 après écriture R2. Une régénération explicite crée un document distinct ; l'ancien reste disponible et les signatures ne sont pas recopiées. Opération répétée refusée avant fournisseur. Une réponse perdue après commit conserve le débit et le PDF ; une reprise sans régénération récupère le cache gratuitement. Sans contexte de test, le parcours ordinaire conserve son fonctionnement.
Guide vérifié, aucun impact utilisateur : route administrative désactivée en hébergement, aucun bouton ni quota commercial actif ajouté. Guide/tutoriel/aides FR/EN/DE/NL inchangés ; revue responsive visuelle non applicable à ces modifications serveur. Aucun appel OpenAI/Stripe réel ni recette physique/A-B. Aucune migration ou dépendance nouvelle ; alertes image-size antérieures non résolues dans ce lot. Publication de production non effectuée.
Validation finale : TypeScript, build Sites et 138 tests réussis, zéro échec, suite exécutée après le build. Six nouveaux scénarios traduction/crédits et gardes Worker inclus. Avertissement de bundles >500 ko inchangé. Sous-lot I : 75 % validé localement ; ni publication ni recette réelle effectuées. Fichiers : server/final-service.ts, app/api/billing/test/translation/route.ts, tests/billing-translation.test.mjs, tests/billing-worker.test.mjs, tests/worker-routes.test.mjs et documentation projet.

## Publication 0.22H — réussie le 21 septembre 2026
Version Sites 28, source 68f6857518d5c0d32cafba58f938c7ac312b2552, déploiement appgdep_6ab17180887c81919bf1a446e781c14b, succès à 18:04:09 UTC. URL : https://accordia-constat.adil-btp.chatgpt.site. Audience custom et variables hébergées conservées. Sous-lot croquis/crédits H : 100 % des jalons de livraison ; route test désactivée, aucune vente ni génération fournisseur déclenchée par cette publication. Prochaine étape : PDF traduit et cache sans débit. Les mentions « prêt pour publication » ci-dessous décrivent l'état avant ce déploiement.

## 0.22H — Croquis raccordé aux crédits de test
POST /api/billing/test/sketch : super-administrateur authentifié, origine/intention contrôlées, configuration Stripe test explicitement activée, corps strict de 1 Kio maximum. La session doit appartenir à cet acteur ; le dossier est résolu côté serveur. operationId UUID obligatoire empêche de rejouer la même génération. Aucun identifiant de propriétaire, prix, solde ou résultat accepté du client.
Le service de croquis existant est réellement appelé, avec les consentements A/B, révision, quotas horaires/globaux, verrou et contrôles de stockage existants. Réservation avant exécution ; échec sans résultat durable restitue le crédit. La référence du croquis et le succès du crédit sont enregistrés dans le même batch transactionnel D1 après écriture R2. Le commit du croquis exige une réservation encore active. Une réponse de commit perdue ou une erreur de libération du verrou après succès ne peut pas rembourser le résultat sauvegardé. Après erreur ambiguë, consulter le croquis existant ; aucune relance automatique.
Périmètre : route administrative de test uniquement, désactivée en hébergement. Les routes ordinaires et les fonctions gratuites sont inchangées. Les traductions/PDF, le partage des crédits avec B, la consultation/réconciliation des opérations, l'interface d'achat, la configuration des secrets et la recette Stripe hébergée restent à réaliser. Aucun appel OpenAI/Stripe réel ni essai physique/A-B effectué. La génération de test utilisera le véritable fournisseur configuré si cette route est activée et appelée ; il ne s'agit pas d'un simulateur en production.
Guide vérifié, aucun impact utilisateur : pas de bouton, parcours conducteur ou quota commercial actif ajouté. Guide, tutoriel et aides FR/EN/DE/NL inchangés ; aucune nouvelle revue visuelle revendiquée pour cette modification serveur. Aucun nouveau schéma ou dépendance. Les deux alertes image-size antérieurement documentées ne sont pas résolues par ce lot.
Validation finale : TypeScript, build Sites et 132 tests réussis, zéro échec ; suite lancée après le build. Huit nouveaux scénarios croquis/crédits et gardes Worker inclus. Avertissement de bundles >500 ko inchangé. Sous-lot H : 75 % validé localement, prêt pour publication autorisée.

## Publication 0.22G — réussie le 21 septembre 2026
Version Sites 27, source 23c00929e8f77cf252ee06f62ee05472db4c1e3f, déploiement appgdep_6ab16fe273248191aa630441b0b69433, succès à 17:57:15 UTC. URL : https://accordia-constat.adil-btp.chatgpt.site. Audience custom et configuration hébergée conservées. Migration additive 0015 incluse. Sous-lot registre G : 100 % des jalons de livraison ; achats toujours fermés.

## 0.22G — Registre de consommation des crédits test, non publié
Migration additive 0015 : billing_test_uses, opération unique et index commande/état. Réservation conditionnelle atomique : le cumul croquis/traductions réservés ou réussis ne peut dépasser le crédit attribué. readTestCredits renvoie désormais le disponible après réservations/consommations. Propriétaire, compte actif, dossier et attribution non expirés contrôlés au moment de la réservation.
withTestCredit encadre une fonction de génération et sauvegarde : succès confirmé consommé, échec libéré une fois, répétition d’opération refusée avant l’exécution. Une panne de règlement après succès conserve la réservation pour rapprochement, sans offrir une génération gratuite. Aucun remboursement automatique des opérations incertaines ; règlement interne d’une réservation autorisé après suspension/expiration pour ne pas laisser une réservation impossible à terminer. Aucun endpoint client ne permet ce règlement.
Limite : moteur de crédits test seulement ; les services de croquis/traduction existants ne l’appellent pas encore et gardent leurs limites actuelles. Le raccordement autour de la sauvegarde réussie, le partage B, le suivi des réservations incertaines, l’interface et la recette fournisseur restent à réaliser. Aucun appel IA/Stripe réel ni publication de ce lot. Guide vérifié, aucun impact utilisateur : pas de parcours affiché ni de quota effectif modifié.
Validation finale : TypeScript, build et 124 tests réussis, zéro échec, suite lancée après le build. Migration 0015 générée et inspectée, ajout d’une table et d’un index sans destruction. Avertissement de bundles >500 ko inchangé.
Sous-lot registre G : 75 % après validation locale ; paiement complet encore partiel.

## Publication 0.22F — réussie le 21 septembre 2026
Version Sites 26, source 890d0253f5d5df8c73450a90acefc467edb53d55, déploiement appgdep_6ab16dd221b481919f568c31dd53b96e, succès à 17:48:25 UTC. URL : https://accordia-constat.adil-btp.chatgpt.site. Audience custom et variables hébergées conservées. Routes de test publiées mais désactivées faute d’activation/configuration ; aucun achat ouvert ni événement Stripe envoyé. Lot borné F : 100 % des jalons de livraison, pas un paiement commercial opérationnel.

## 0.22F — Routes serveur de paiement test, non publiées
POST /api/billing/test/checkout : identité authentifiée, compte actif, super-administrateur, origine/intention JSON et taille 1 Kio vérifiés avant orchestration ; dossier impérativement détenu par cet utilisateur. POST /api/billing/test/webhook : signature Stripe sur corps brut, sans cookie utilisateur ; aucun acquittement avant traitement durable. Réponse générique sans identifiant de commande ni secret. Corps limité à 256 Kio et dix secondes, rejet signature absente/UTF8 invalide/type incorrect.
Activation explicite BILLING_TEST_ENABLED=1 et clé restreinte rk_test_ plus secret whsec_ requis ; .env.example reste à 0. Aucune variable hébergée modifiée. Définitions de secrets uniquement côté serveur. Les routes ne sont pas publiées et aucun endpoint Stripe distant n’est enregistré ; l’accès custom du Site reste à prendre en compte pour la joignabilité du webhook.
Tests compilés Miniflare avec identités et signatures synthétiques, vrai D1 local : refus non-admin, origine externe, corps invalide/dossier absent ; signature invalide sans écriture ; deux confirmations valides = un reçu et dix crédits test. Aucun appel réseau Stripe ni recette réelle A/B. Consommation/restauration des crédits par l’IA, B partagé, remboursement, abonnement et interface restent ouverts.
Validation finale : TypeScript et build réussis ; 119 tests réussis, zéro échec, après build. Avertissement de bundles >500 ko inchangé.
Guide vérifié, aucun impact utilisateur : routes internes fermées par défaut, aucune commande affichée ajoutée ; les informations administratives ne sont pas ajoutées au guide conducteur. Sous-lot routes 0.22F : 75 % après validation locale, non publié. Cela ne signifie pas que le paiement complet est opérationnel.

## Publication 0.22D–E — réussie le 21 septembre 2026
Restauration du dépôt après nettoyage automatique du workspace, puis reconstruction réussie de la source inchangée f9d4b4d8c897ade09ab203d4feee5cf4ee2d7241. Version Sites 25, déploiement appgdep_6ab164e2120081919324c532dc2d82de, succès à 17:10:20 UTC. URL : https://accordia-constat.adil-btp.chatgpt.site. Audience custom conservée ; migrations additives 0013 et 0014 incluses. Lots bornés D/E : 100 % des jalons de livraison. Aucun achat, crédit IA actif ou secret Stripe configuré par cette publication.

## 0.22E — Orchestration du paiement dossier et droits de test, non publiée
server/billing-flow.ts relie commande persistante, Checkout test, session et reçu vérifié. Reprise d’une session existante ; retour navigateur complet = attente de confirmation, aucun crédit accordé par ce retour. Un reçu existant bloque un nouvel achat. Commande sans session de plus de 23 heures : rapprochement requis, pas de recréation après possible expiration de la clé d’idempotence Stripe. Source de cette borne : https://docs.stripe.com/api/idempotent_requests (clés pouvant être supprimées après 24 h).
Migration additive 0014 : billing_test_grants, une attribution par commande. Confirmation signée, reçu rapproché puis insertion conditionnelle de dix crédits test si compte actif/dossier non expiré. Une panne entre reçu et attribution est récupérable par répétition de l’événement ; les conflits ne rechargent jamais un solde existant. Paiement tardif/dossier supprimé ou compte suspendu : état review_required, zéro crédit. Lecture des droits contrôlée par propriétaire, suspension et échéance, sans prolonger la conservation.
Limites : modules internes uniquement, aucune route ni interface d’achat, aucun appel Stripe réel ; les tests utilisent le SDK pour vérifier des HMAC synthétiques et D1 local avec un fournisseur simulé explicitement limité aux tests. Les crédits ne sont pas consommés par les endpoints IA actuels. Gestionnaires/revue/remboursements, B partagé, abonnements, consommation et restitution de crédits, secrets et webhook accessible restent à réaliser. Aucune modification des accès du site ni publication.
Validation finale : TypeScript, build et 113 tests réussis, zéro échec. Migration 0014 générée et inspectée (une table additive). Avertissement de bundles >500 ko inchangé.
Guide vérifié, aucun impact utilisateur : fonctionnalités affichées et achats fermés inchangés. Sous-lot 0.22E : 75 % après validation locale ; cela ne représente pas l’intégration commerciale complète. Test réel A/B toujours au signal du propriétaire.

## 0.22D — Commandes et reçus de test persistants, non publiés
Migration additive 0013 : billing_test_orders et billing_test_receipts, index uniques propriétaire/dossier, session, événement et commande. Aucune donnée accident copiée ; identifiants minimaux seulement. Création propriétaire actif/dossier non expiré, langue immuable, réutilisation atomique de la commande. Session Stripe test attachée une seule fois, avec contrôle du propriétaire et de l’échéance au moment de l’écriture.
Confirmation interne à appeler après vérification Stripe : rapprochement commande/session, un reçu maximum même pour plusieurs événements équivalents, événement réutilisé sur une autre commande refusé. Un reçu ne donne aucun crédit ni accès et n’est pas une facture. La suppression existante des dossiers n’est pas bloquée par ces tables ; conservation des références de facturation à définir avant activation. Aucun endpoint, écran de paiement, secret ou appel Stripe ajouté.
Validation : TypeScript, build et 107 tests réussis, zéro échec ; suite lancée après la fin du build. Migration générée et inspectée, uniquement deux nouvelles tables et quatre index uniques. Avertissement bundles >500 ko inchangé.
Guide vérifié, aucun impact utilisateur : modules internes non exposés, interface et achats fermés inchangés. Lot commandes/reçus : 75 %, réalisé et validé localement, migration non publiée. Paiement complet reste à 25 % des jalons globaux : routes, orchestration des appels Stripe, attribution et consommation des droits, gestion des échecs/expiration/remboursements et abonnement restent ouverts. Test réel A/B non lancé.

## Publication 0.22A–C — réussie le 21 septembre 2026
Version Sites 24, source 32ec8f1ce5a28380dd394e5a43a3461e8a4a9856, déploiement appgdep_6ab156fdc2248191922b1b543dda6692, succès confirmé à 16:11:04 UTC. URL : https://accordia-constat.adil-btp.chatgpt.site. Audience custom conservée. Le catalogue et les adaptateurs restent préparatoires, sans route d’achat ; aucune clé ajoutée, aucun paiement ni droit activé. Build inchangé validé réutilisé.

## 0.22C — Adaptateur Checkout et vérification des confirmations, non raccordés
SDK officiel stripe 22.6.2 ajouté (publication npm 9 septembre 2026, délai de sept jours respecté). Module server/stripe-test.ts : clé restreinte test uniquement, compte SMARTDEV, prix dossier relu/validé, quantité 1, URLs de retour fixes, identifiant de commande serveur et clé d’idempotence stable. Flottes et abonnements refusés par ce premier adaptateur. Aucun formulaire ni route de paiement exposé.
Vérification asynchrone des signatures par le SDK, corps brut borné à 256 Kio, tolérance de 300 secondes. Confirmation retenue seulement pour un dossier payé de 690 centimes EUR, avec références de commande concordantes ; événement de compte connecté/mode réel rejeté, événement non pertinent ou paiement différé encore impayé ignoré. Aucun droit accordé par ce module. Les tests utilisent des réponses de service synthétiques et des signatures HMAC locales ; aucune session Stripe réellement créée.
Blocages constatés : aucune clé Stripe configurée dans les variables Sites ; accès custom du site nécessitant de vérifier une destination webhook accessible à Stripe sans élargir les accès utilisateurs. Pas de webhook distant enregistré. Restent à implémenter : commandes persistantes liées au propriétaire et au dossier, stockage des sessions, déduplication transactionnelle des événements, droits/crédits, annulations/remboursements, abonnements puis interface. La clé d’idempotence du fournisseur ne remplace pas ces protections métier.
Validation : TypeScript et build final réussis ; 103 tests réussis au premier passage, contrôle Worker relancé après la fin du build et réussi (30 routes anonymes). Le premier lancement Worker avait échoué parce que le build concurrent avait temporairement retiré dist/server/index.js ; aucun échec restant après reprise ciblée. Neuf tests catalogue/adaptateur inclus. Avertissement de bundles >500 ko inchangé.
Guide vérifié, aucun impact utilisateur : interface inchangée et achats fermés ; pas de nouveau contrôle responsive nécessaire. Pas de publication ni de test réel A/B. Progression paiement complet : 25 % des jalons maintenus car réalisation du parcours encore partielle ; sous-lot adaptateur réalisé et vérifié localement.

## 0.22B — Catalogue Stripe de test créé et vérifié
Le propriétaire a confirmé SMARTDEV en mode test. Huit tarifs Accordia et leurs produits ont été créés, après inventaire complet sans prix Accordia existant. Aucun objet des autres projets modifié. Identifiants réels enregistrés dans server/billing-test-prices.json (aucun secret). Relecture Stripe puis validation des huit réponses par validateTestPrice : montants, EUR, mode test, périodicités et traitement TTC/HT conformes. Les quatre tests ciblés passent à nouveau. Code applicatif et rendu inchangés : build/TypeScript réussis de 0.22A réutilisés, aucun nouveau contrôle visuel revendiqué.
Aucun paiement, client, abonnement, Checkout ou webhook créé ; aucun encaissement ni publication. Les tarifs flotte existent uniquement pour préparer les tests et ne rendent pas les fonctions flotte disponibles. Le comportement fiscal d’un prix ne configure pas à lui seul la collecte des taxes.
Sous-lot catalogue distant : réalisé et vérifié (100 % de cette opération de configuration). Lot paiement complet : reste à 25 % selon les jalons ; Checkout, configuration secrète serveur, commandes, notifications signées/idempotentes et droits restent à réaliser. Guide vérifié, aucun impact utilisateur : interface et achats fermés inchangés.

## 0.22A — Préparation du raccordement Stripe de test
Compte disponible identifié en lecture seule : SMARTDEV, mode test. Aucune opération spécifique sur ce compte : sélection à confirmer conformément au workflow Stripe. Aucun produit, prix, client, abonnement, webhook ou paiement créé.
Catalogue serveur en centimes : dossier 690, particulier annuel 1990, supplément particulier 490, Start mensuel/annuel 1900/19000, Pro 4900/49000, supplément flotte 390. Contrôle strict des sélections, rejet de montants/rôles/identifiants de prix fournis par le navigateur. Validateur de prix Stripe de test : identité, métadonnée SKU, actif, EUR, montant, taxe incluse/exclue, fréquence, quantité non transformée et tarification fixe ; mode réel rejeté.
Ces fonctions préparatoires ne sont encore appelées par aucune route de paiement. Elles ne constituent ni une intégration terminée ni une preuve de paiement et ne donnent aucun droit. Pas de secrets ajoutés, migration ou modification des données. Guide vérifié, aucun impact utilisateur : interface, prix affichés et achats désactivés inchangés ; aucune modification pédagogique ou responsive requise.
Validation : quatre tests ciblés, TypeScript et build réussis. Avertissement de bundles supérieurs à 500 ko inchangé.
Progression du lot paiement : 25 % (cadrage et premier composant préparés). Restent : choix du compte, prix distants, configuration sécurisée du serveur, commandes liées au propriétaire/dossier, Checkout, vérification des notifications signées/idempotentes, crédits et renouvellements, annulations/remboursements et recette de test. La flotte reste bloquée jusqu’à ses fonctions métier. Aucun test réel A/B ni publication.
Références vérifiées : https://docs.stripe.com/api/checkout/sessions/create et https://docs.stripe.com/webhooks/signature. La page de retour ne devra jamais activer seule les droits.

## Publication 0.20–0.21 et poursuite de validation — 21 septembre 2026
Publication Sites 23 réussie à 15:19:05 UTC, source f676bede17713366d461b3ea79ce3edd21cdb0f0, déploiement appgdep_6ab14acd7dc0819198a3155edecad488. URL : https://accordia-constat.adil-btp.chatgpt.site. Audience custom conservée. Build et 95 tests précédents réutilisés sur source applicative inchangée.
Poursuite : composants réels rendus en aperçu dans quatre panneaux de 320 px, inspection visuelle FR/EN/DE/NL sans texte ni bouton coupé ; messages d’erreur et commandes conformes à l’aide. Clic de reprise FR observé : retour au chargement, puis erreur attendue en accès anonyme. Les quatre tests réseau et le test Worker couvrant 30 routes anonymes relancés avec succès. Route temporaire retirée, aucun ajout de code applicatif ni de dépendance dans ce tour. Mesure automatisée de largeur interrompue par timeout du navigateur ; la conclusion responsive repose sur l’inspection visuelle, pas une mesure DOM. Guide/tutoriel : textes inchangés depuis 0.21 ; dernière étape animée non rééprouvée.
Tarification 0.20 et correctif borné 0.21 : 100 % des jalons de livraison avec ces limites documentées. Cela ne vaut pas validation authentifiée ni préparation commerciale complète. Paiements, abonnements, flotte, ordonnanceur indépendant et restauration restent non réalisés. Recette réelle A/B toujours à 0 %, au signal du propriétaire. Prochaine étape commerciale : raccorder le compte marchand et valider les droits/notifications serveur en environnement de test avant vente.

## 0.21 — Stabilisation du choix d’offre
Chargement et enregistrement bornés à 15 secondes, y compris la lecture de la réponse. Annulation du chargement à la sortie, bouton de reprise après échec de chargement et vérification de la préférence renvoyée avant confirmation de sauvegarde. Une réponse perdue ne signifie pas que le serveur n’a rien enregistré : message de confirmation manquante et reprise manuelle, sans relance automatique. Aucun paiement ni droit commercial activé.
Aide contextuelle, guide et dernière étape du tutoriel actualisés en FR/EN/DE/NL pour les trois parcours. TypeScript, build et 95 tests réussis, dont quatre nouveaux scénarios réseau (confirmation, réponse invalide/refus, corps bloqué puis reprise, annulation). Aucun test réel, appel fournisseur ni modification de production. Revue visuelle mobile et parcours authentifié non réalisés pour ce lot : jalon de validation Preview encore ouvert, progression prudente 50 %. Tarification 0.20 reste à 75 %.

## 0.20 — Tarification et explications prêtes en Preview, non publiées
Page Tarifs et services inclus en FR/EN/DE/NL : six cartes avec prix et quotas décidés, distinction Essentiel/Premium, Pourquoi payer, FAQ, annualisation et suppléments. Liens depuis Mon compte, le choix d’offre, le guide et la dernière étape du tutoriel. Explications : paiement unique A/B prévu, 10 générations IA réussies, erreurs techniques non débitées prévues, taxes, consentements, conservation de deux mois et absence de garantie assureur.
Le paiement reste indisponible et clairement annoncé. Aucun quota commercial appliqué, privilège accordé, API modifiée ni accès existant retiré. Préférence serveur existante conservée, sans distinction Start/Pro persistée. Organisations, facturation et crédits réels restent à raccorder ; aucune simulation de transaction.
Validation : TypeScript et build réussis ; 91 tests, zéro échec après correction d’un import Node ; contrôles Worker anonymes relancés avec succès après build final. Preview : page tarifaire et titres quatre langues ; cadres de 320 px (305 px utiles avec scrollbar), aucun débordement mesuré ; inspection visuelle NL, FAQ annuelle FR et navigation compte non connecté vérifiées. Guide/tutoriel rendus en aperçu ; parcours complet de la dernière étape non validé, contrôle interrompu par timeout. Routes QA retirées avant build final. Aperçu final FR confirmé après redémarrage du serveur.
Limites : pas de paiement réel, d’E2E authentifié, de test A/B tarifaire, de téléphone physique ou de publication. Avertissement de bundles supérieurs à 500 ko inchangé ; dépendances inchangées. Test réel et publication au signal du propriétaire.

## Contrôle de finalisation — 21 septembre 2026
Site actif, version Sites 22 confirmée par le service d’hébergement. Source applicative inchangée depuis 0.19 ; dépôt initial propre. Suite complète relancée : 91 tests réussis, zéro échec ; TypeScript réussi. Build et aperçu quatre langues de 0.19 réutilisés, aucun nouveau contrôle visuel revendiqué.
Le lot publié est livré ; le lancement commercial complet n’est pas déclaré terminé. Blocages : aucun planificateur serveur directement configurable exposé dans les outils Sites disponibles ; tarifs et quotas commerciaux à décider ; paiement réel à raccorder ; politique des sauvegardes et objets historiques à traiter. Les deux alertes de dépendances précédemment documentées ne sont pas déclarées corrigées. Test réel toujours au signal du propriétaire.
Guide vérifié, aucun impact utilisateur : ce contrôle modifie seulement la documentation de livraison et les scénarios de recette ; aucun parcours, droit, secret ni donnée modifié. Pas de nouveau déploiement nécessaire.

## Publication 0.19 — réussie le 21 septembre 2026
Version Sites 22, source a884bc17c30bda5056ea5fa5f7d32f99b105d003, déploiement appgdep_6ab134562f648191ae680872652d8680, succès confirmé à 13:43:13 UTC. URL : https://accordia-constat.adil-btp.chatgpt.site. Audience custom conservée. Nettoyage sur activité et suivi administrateur publiés, migrations 0011/0012 incluses. Validation : 91 tests, TypeScript, build et aperçu quatre langues réussis. Aucun test réel déclenché. Absence de planificateur indépendant, exclusions des sauvegardes et objets historiques non attribuables maintenues.

## 0.19 — Nettoyage sur activité validé, publication demandée
Nettoyage borné déclenché par une activité authentifiée : verrou atomique de cinq minutes, reprise des suppressions en attente après panne, suivi réservé au super-administrateur. Index des échéances et migrations additives 0011/0012. Guide et tutoriel actualisés en FR/EN/DE/NL. Une panne de maintenance ne bloque pas le parcours conducteur.
Validation : 91 tests réussis, zéro échec, dont 30 contrôles de routes anonymes ; TypeScript et build final réussis. D1/R2 locaux : concurrence, reprise après panne, verrou actif/expiré et protection contre un ancien travailleur. Aperçu 390 px sans débordement dans les quatre langues ; route QA retirée avant build final.
Limites : déclenchement sur activité, sans planificateur indépendant ; sauvegardes et objets historiques non attribuables exclus. Aucun test réel à deux comptes, appel IA réel, envoi assureur ou purge manuelle de production. Tarifs et paiements non activés. Les mentions antérieures de non-publication sont historiques.

## Publication 0.18 — réussie le 21 septembre 2026
Version Sites 21, source d9523e4bdf40383ab329d65d00771aa4f74645e8, déploiement appgdep_6ab131de44c88191ae2ab112e294ba30, succès confirmé à 13:32:42 UTC. URL : https://accordia-constat.adil-btp.chatgpt.site. Accès custom existants conservés, migration 0010 incluse. Validation précédente réutilisée sur source inchangée : 87 tests et build réussis. Pas de test réel, d’envoi assureur ni de purge réelle déclenchée pendant cette publication. Les mentions ci-dessous de 0.18 non publiée sont historiques.

## 0.18 — Décisions produit appliquées en aperçu, non publiées
- Pays : Belgique/France/Allemagne au lancement ; Espagne/Pays-Bas prévus, saisie ES et fuseau Madrid ajoutés sans retirer NL/Autre. Modèle européen fourni conservé.
- Refus de signature : panneau disponible dans les trois parcours, confirmation explicite, acteur A/B, motif facultatif, PDF unilatéral non signé avec annotation visible et annexe. Aucune signature reprise ; aucun accord présumé ; originaux inchangés. PDF téléchargé, pas d’envoi assureur.
- Offres : quatre préférences (gratuit, dossier, particulier, flotte), enregistrées dans le compte par une API protégée. Aucun abonnement/paiement/droit activé ; tarifs à définir.
- Rétention : deux mois calendaires dès première sauvegarde serveur, blocage après expiration, dates visibles, nettoyage IndexedDB à la réouverture. Migration 0010 additive avec reprise des dates existantes ; aucun dossier réel supprimé pendant le développement. Moteur de purge serveur borné/reprenable et route super-admin prêts, MAIS ordonnanceur automatique non raccordé. Les sauvegardes hébergeur et orphelins historiques non attribuables ne sont pas couverts : ne pas annoncer une garantie de suppression physique automatique complète.
- Guide et tutoriel actualisés en FR/EN/DE/NL (refus, pays, modèle, délai selon contrat, préférence, rétention), sans instructions administrateur.
- Vérification : TypeScript et build final réussis ; 87 tests, zéro échec, incluant 29 refus de routes anonymes/no-store. Tests réels locaux D1/R2 : échéance non repoussée, rejet lecture/écriture/session expirées, purge après panne R2 et reprise idempotente, isolation propriétaire, budget rendu, choix d’offre sans rôle client. Migration de dossier ancien vérifiée sur fin février. Contrôle navigateur : PDF unilatéral généré, bouton bloqué sans confirmation, copies fictives expirées supprimées et copie active conservée ; guide/offres/refus FR/EN/DE/NL dans conteneur 390 px, aucun débordement mesuré. Route QA temporaire retirée avant build final.
- Limites : pas de recette authentifiée hébergée, appel IA réel, paiement, téléphone physique ou publication. Sélecteur d’offre connecté testé via service D1, affichage anonyme vérifié bloqué ; pas d’E2E connecté. Avertissement de bundles >500 ko conservé ; dépendances inchangées, les alertes image-size antérieures n’ont pas été réévaluées dans ce lot.
- Prochaine étape : raccorder et éprouver la planification de purge et son suivi avant d’annoncer la conservation maximale, définir tarifs/quotas et paiement ; publication seulement au signal du propriétaire. Test réel toujours en attente de son signal.

## Publication 0.15–0.17 — réussie
Les lots de sessions allégées, récupération par lots, identification/capacité PDF et plafond IA global sont publiés avec succès le 21 septembre 2026 à 12:39:00 UTC. Version Sites 20, source 6c14348736c4b5ed4b6138ff4fc94164b561ca05, déploiement appgdep_6ab1254c9d0881919f11b2e8b33d54b4. Accès custom existants conservés. Migration additive 0009 incluse dans la version publiée.
Validation réutilisée sur cette source inchangée : build et 82 tests réussis ; aperçu du guide en quatre langues. Aucun nouveau test authentifié de production revendiqué.
Contrôle sécurité après publication : scanner toujours à deux alertes élevées image-size et zéro critique. Version 2.0.4 disponible, engines Node >=18 ; délai de sept jours atteint le 21 septembre à 16:38:44 UTC (18:38:44 Bruxelles). Version 2.0.3 : 15:57:47 UTC. Ces horaires sont une condition d’éligibilité, pas une garantie de correction ; vérifier le contenu et relancer scan/build/tests avant adoption. Aucune exception à la politique, aucune mise à jour automatique programmée.

## 0.17 — Plafond IA global — aperçu non publié
- Plafond de 100 réservations d’appels de génération par jour UTC pour l’ensemble de la plateforme, croquis et traductions cumulés. Limite fixe serveur, non modifiable par un conducteur. Les plafonds par session restent applicables. Ce compteur borne les appels, pas un montant garanti en euros.
- Réservation atomique D1 avant fetch fournisseur, avec garde d’appartenance et compte actif. Compteurs agrégés par jour/type sans texte, clé ni identité ; échecs conservés dans le compteur. Migration additive 0009, aucune modification des versions historiques ni des signatures.
- Message spécifique de plafond atteint en FR/EN/DE/NL : reprise après 00:00 UTC ou utilisation du croquis manuel/PDF sans traduction. Guide et étape PDF du tutoriel actualisés, sans instructions d’administration.
- Validation : TypeScript/build réussis ; 82 tests, zéro échec. Vrai D1 local : 120 demandes concurrentes réparties sur deux sessions et deux types, exactement 100 acceptées. Compteur d’un ancien jour sans effet sur le jour courant. Tests croquis/traduction : aucun appel fournisseur à plafond atteint ; verrou croquis libéré. Contrôles Worker anonymes inclus. Preview : explications présentes dans les quatre langues.
- Limites : aucun appel IA réel ni recette authentifiée sur téléphone. Pas de conversion en euros, suivi de tokens facturés, tableau de consommation ou plafond éditable dans l’interface. Les réservations couvrent uniquement les générations de cette application, pas les autres usages éventuels de la clé. Deux alertes image-size restent ouvertes. Publication et migration de production non effectuées ; site live toujours 0.14.

## 0.16 — Identification et capacité PDF — aperçu non publié
Noms de téléchargement incluant session, langue, révision, style, identifiant du document et statut signé/relecture. Composants du nom filtrés pour les en-têtes HTTP ; noms distincts après régénération. Compteur de versions sur 20 affiché uniquement après chargement réussi de la liste. Message à capacité atteinte : anciennes versions consultables/signables si valables, aucune suppression automatique. Guide FR/EN/DE/NL actualisé.
Validation : TypeScript et build réussis ; trois tests ciblés (nom sûr/distinct et cycle PDF/signatures D1/R2), contrôles Worker anonymes réussis. Preview : explications du guide présentes en quatre langues. Pas de recette authentifiée du compteur ni de contrôle mobile physique dans ce lot. Pas de changement de droits, quota ni suppression. Gestion d’archivage ou augmentation de capacité non implémentée.

## 0.15 — Sessions allégées et récupération par lots — aperçu non publié
- Lecture conditionnelle authentifiée des sessions : jeton opaque incluant révision, présence de B et confirmations. Si inchangé, aucune lecture R2 du rapport ni transfert de photos. Mise à jour des confirmations à révision identique détectée. Autorisations et suspension vérifiées avant réponse conditionnelle.
- Rafraîchissement principal sans chevauchement, suspendu lorsque l’onglet est masqué ; reprise au prochain intervalle visible. Sauvegarde toujours explicite, fusion et protections des réponses tardives conservées. Mesure de taille exacte avec cache des tableaux photos immuables, sans sérialiser les photos à chaque frappe.
- Récupération : recherche SQL des seules références non indexées, 25 objets maximum et 10 opérations expirées par clic. État de reprise conservé par le registre ; compteur de stockage non abaissé tant que l’indexation historique est incomplète. Bouton Continuer et message de limite/minute, aucun faux succès de fin. Versions référencées protégées, pas de purge des constats.
- Guide/tutoriel et messages FR/EN/DE/NL actualisés. Administration exclue du guide.
- Vérification : TypeScript/build Sites et 78 tests réussis, dont lecture sans R2, refus tiers/suspension, changement de confirmation, taille UTF-8, reprise de 60 références en trois lots, nettoyage de 12 opérations en deux lots et préservation d’un autre propriétaire. Cycle PDF signé/récupération vérifié avec D1/R2 réel local. Preview : guide et panneau stockage dans quatre langues, conteneur 390 px sans débordement ; route QA supprimée avant build.
- Limites : pas d’E2E hébergé à deux comptes, d’essai téléphone physique ni de restauration d’infrastructure. Une vraie modification du dossier recharge encore le rapport complet ; médias séparés et budget IA global restent ultérieurs. Les requêtes SQL examinent les références historiques : nombre d’échanges borné, pas une garantie de coût SQL constant. Deux alertes image-size restent ouvertes, dépendances inchangées. Avertissement de taille de bundles inchangé. Lot préparé, production reste 0.14.

Publication 0.14 confirmée le 21 septembre 2026 à 12:07:47 UTC : appgdep_6ab11dfb0b6081918b476ecd23c9dc29. Accès existants conservés.

## 0.14 — Robustesse, premier lot — publiée, version Sites 19
- Préparation finale : confirmations de fin A/B valides exigées côté serveur ; contrôle des marques de confirmation au commit du PDF en plus de la révision et des droits. Bouton bloqué et explication dans les quatre langues.
- Traduction : action explicite pour refaire un appel IA et créer un nouveau PDF, sans changer les déclarations, supprimer les anciens documents ni copier les signatures. Consentements, plafond horaire, verrou, quota de stockage et limite de 20 PDF conservés. Comparaison avec les originaux dans le PDF ; édition manuelle des traductions et comparaison côte à côte dans l’interface restent à développer.
- Guide et tutoriel FR/EN/DE/NL actualisés, sans contenu d’administration.
- Validation : TypeScript et build Sites réussis ; contrôles des routes anonymes relancés sur le Worker final avec succès ; 74 tests réussis dont deux nouveaux scénarios (fin A/B et retrait au commit ; traduction refaite, originaux/ancien PDF conservés et signatures vierges). Fournisseur simulé uniquement dans les tests. Preview du panneau réel avec données synthétiques : préparation et régénération bloquées sans conditions requises, quatre langues, largeur de conteneur 390 px sans débordement. Route QA retirée.
- Sécurité : deux alertes élevées image-size persistent. Registre npm : 2.0.3 publiée le 14 septembre à 15:57:47 UTC, 2.0.4 à 16:38:44 UTC ; délai minimal de sept jours pas encore atteint au contrôle du 21 septembre à 11:46 UTC. Aucune exception au délai ni modification de dépendances. Avis GitHub GHSA-w3rx-r6r6-pgpr et GHSA-5p2g-fcmc-qvqq consultés : divergence entre scanner et avis sur version corrigée à vérifier avant installation.
- Limites : aucun appel IA réel, E2E hébergé à deux comptes ni téléphone physique. Les autres points de l’audit (polling, récupération, capacité des versions, budget global) restent ouverts. Publication sur signal explicite.

## Guide conducteurs — publié, version Sites 18
Retrait des explications de configuration et activation du super administrateur dans les quatre langues. Guide et tutoriel conservés pour les conducteurs. Fonctions et protections administratives inchangées. Publication réussie le 21 septembre 2026 à 11:35:12 UTC (appgdep_6ab11655cf188191be0bcfd1fc2aa13a). TypeScript/build et contrôle Preview FR/EN/DE/NL réussis ; aucun test métier supplémentaire pour ce retrait de contenu. Pas de contrôle sur téléphone physique.

## 0.13.1 — Guide actualisé — aperçu, non publié
Guide FR/EN/DE/NL complété : parcours exact du PDF linguistique, langue et trois styles, autorisations A/B par révision distinctes du croquis, portée session connectée uniquement, conduite à tenir devant une traduction incorrecte et limite de régénération actuelle. Aide administrateur repliable : activation privée, clé/modèle, enregistrement et limites du test de connexion. Étape PDF du tutoriel partagé synchronisée. Fichiers : guide-updates.ts, usage-guide.tsx, tutorial.tsx. Aucun changement API, droits, données ou dépendances.
Validation : TypeScript, build Sites et tests model.test.mjs réussis ; git diff --check. Preview : contenu FR/EN/DE/NL et ouverture du volet administrateur vérifiés. Pas de nouveau contrôle mobile physique ni de recette authentifiée ; responsive à vérifier sur téléphone avant diffusion large. Avertissement de build sur certains bundles supérieurs à 500 ko conservé. Publication sur autorisation explicite uniquement.

## Entretien systématique du guide — 2026-09-21
- Règle permanente dans AGENTS.md et critères de vérification dans TEST_PLAN.md : guide, tutoriel et aides synchronisés avec chaque évolution visible, en quatre langues et selon le parcours.
- Lot documentaire uniquement ; aucune publication ni modification applicative.

## Publication et audit 0.13 — 2026-09-21
- Publication autorisée réussie, accès existants conservés.
- Audit complet : 72 tests réussis, trois sondes locales, dix constats priorisés ; rapport séparé et aucune modification applicative.

## 0.13 — 2026-09-21 — Publié — version Sites 17
- PDF linguistique préparé par A ou B, langue personnelle présélectionnée et choix de styles conservé.
- Traduction IA facultative des déclarations, autorisations A/B distinctes et révocables, contrôles de révision/quotas/sortie fournisseur.
- Modèle original français intact, page localisée complémentaire, originaux et traductions intégraux conservés ; signatures séparées pour chaque version.
- Guide, tutoriel et administration IA adaptés en FR/EN/DE/NL. Migration additive 0008.

## 0.12 — 2026-09-21
- Administration IA en quatre langues depuis le compte.
- Activation privée du super administrateur par code à usage unique, rôle SIWC serveur.
- Clé OpenAI chiffrée AES-GCM, jamais renvoyée au navigateur ; remplacement et paramètres avec protection contre les écrasements concurrents.
- Service de croquis branché sur les réglages persistants ; désactivation explicite et test d’accès au modèle sans transmettre de constat.
- Migration D1 additive et tests de permissions, confidentialité et configuration.

## 0.11 — 2026-09-21 — Corrections de l’audit complet
- Révisions client monotones et invalidation des requêtes en vol avant sauvegarde ; états locaux enregistrés reliés au snapshot réel.
- Identifiant stable des brouillons, historique PDF isolé, conservation explicite dans IndexedDB v2 et récupération depuis Mes brouillons. Aucune signature en cours enregistrée silencieusement.
- Empreintes des images mises en cache, session locale montée à la première ouverture, copies PDF bornées et fermeture explicite des copies déjà conservées.
- Validation PNG bornée commune aux photos/signatures et rejet APNG. WebP joint original, aperçu client jamais utilisé comme preuve visuelle dans le PDF.
- Registre transactionnel des réservations, remboursement des échecs, récupération manuelle des opérations interrompues et recalcul du quota historique sans supprimer les versions référencées.
- Verrou et gardes atomiques des consentements, approbations et propositions IA ; choix explicite du croquis dans le PDF, angles rendus, dessin manuel en annexe si IA sélectionnée.
- Diagnostic final incluant tiers et 17 cases, correction vers A/B ; tutoriel avec commandes du parcours et durée adaptée au texte ; aide actualisée en quatre langues.
- React/react-dom/RSC 19.2.8, Vite 8.0.16 et correctifs transitifs compatibles. Scan : 36 → 2 alertes, reliquat image-size bloqué par la règle d’âge minimal (non contournée).
- 60 tests réussis, TypeScript/build validés, recette locale et revue mobile 390 px. Aucune activation IA ni signature réelle.

# Changelog
## 0.1.0 — 2026-09-20
- Création Accordia, prompt maître, documentation de gouvernance et roadmap.
- Parcours multilingue FR/EN/DE/NL en 5 étapes, identité originale.
- Conducteur et preneur distincts, circonstances A/B, photos, croquis et récapitulatif.
- Brouillons locaux manuels avec validation, erreurs fidèles et reprise.
- Protection du parcours en présence de blessés ; aucune détermination de responsabilité.
- Corrections QA : date/heure input, identifiant local compatible preview HTTP, étapes et labels mobiles.
- 7 tests ciblés ; QA navigateur desktop et viewport mobile. Aucune production publiée.

## 0.2.0 — 2026-09-20
- Relecture intégrale A/B avec langues indépendantes et repères locaux distincts.
- Invalidation des relectures à chaque modification ; aucune signature simulée.
- Diagnostics détaillés et raccourcis vers les étapes à compléter.
- Navigation libre sans coches trompeuses ; sauvegarde dès la première étape.
- Protection des modifications avant changement de brouillon et fermeture normale.
- Conservation des éditions récentes lors d'une sauvegarde asynchrone.
- Compatibilité des anciens brouillons ; dates impossibles rejetées.
- 12 tests ciblés, recette navigateur et contrôle mobile. Pas de production.

## 0.3.0 — 2026-09-20
- Espace compte FR/EN/DE/NL avec identité SIWC côté serveur et accès rapide depuis le parcours.
- API dossiers propriétaires, stockage D1/R2 privé et migration versionnée.
- Sauvegarde distante explicite avec photos/croquis, reprise, comparaison de révisions et conservation des anciennes versions.
- Refus des accès anonymes/autres propriétaires/comptes suspendus ; contrôle origine et quotas.
- Protection des saisies pendant les uploads et distinction sauvegarde locale/distante.
- 25 tests ciblés, 1 test de vrais moteurs D1/R2 locaux, 4 contrôles HTTP de refus sans identité.
- Pas de production ni de test SIWC hébergé ; rétention et auth indépendante à finaliser.

## 0.4.0 — 2026-09-20
- GPS avec précision/horodatage et erreur sans perte de saisie.
- Session A/B et invitation éphémère, droits serveur par conducteur, langues et photos distinctes.
- Rafraîchissement prudent, conflits explicites et protection de fermeture.
- Historique et restauration comme nouvelle version ; blocage des écritures globales partagées.
- Connecteur OpenAI pour croquis contrôlé, consentements et validations A/B ; désactivé sans configuration.
- Migration additive, tests collaboration D1/R2, documentation actualisée.

## 0.5.0 — 2026-09-20
- PDF professionnel A/B avec 17 circonstances, rubriques complémentaires, annexes, photos et croquis approuvé.
- Styles clavier, stylo bleu et stylo noir ; polices embarquées avec licences.
- Préparation d’un PDF immuable, signature dessinée/importée réservée à son conducteur, consentement par empreinte et finalisation après les deux signatures.
- Documents privés D1/R2, migrations additives, conservation des anciens exports et invalidation après modification.
- Partage natif du lien B à l’initiative de A ; protection de la saisie pendant le rafraîchissement.
- 31 tests réussis, contrôle du tracé navigateur et trois exemples PDF fictifs inspectés ; aucune production.

## Audit 0.5 — 2026-09-20
- Ajout du rapport docs/AUDIT_ACCORDIA_V05.md et actualisation du statut.
- Vérification de la version existante ; aucun code applicatif modifié.
- Priorités, preuves, limites et critères de correction consignés ; pas de publication.

## 0.6.0 — 2026-09-21
- Corrections de l’audit : droits atomiques lors des commits, validation PNG/JPEG, conteneurs WebP et limites de pixels, quota préalable et verrou PDF.
- Relecture complète, diagnostics cohérents, 17 circonstances transmises à l’IA, champs communs éditables par A et dates avec fuseau.
- Pièces conservées : import sans écrasement, attribution et remplacement volontaires, taille totale visible et requêtes 10 Mio.
- PDF : lieu intégral en annexe, contact borné, navigation vers toutes les versions ; liste des sessions A/B et confirmation du lieu.
- 41 tests, 19 contrôles Worker, TypeScript/build et Preview ciblée réussis. Documentation de suivi mise à jour ; aucun déploiement.

## 0.6.1 — GPS et adresse (préparée)
- Recherche opt-in Photon/Komoot pour le nom du lieu/rue et la ville, champs corrigibles et messages FR/EN/DE/NL.
- Ville optionnelle conservée dans dossiers, sessions, relecture et PDF ; droits A/B inchangés.
- Protection des saisies pendant recherche et repli manuel. Test externe bloqué, version non publiée.
- Correction du statut documentaire : 0.6 effectivement publiée en privé le 21 septembre 2026.

### Publication 0.6.1 — 21 septembre 2026
Autorisation utilisateur reçue pour le transfert de coordonnées. Recherche réelle Grand-Place/Bruxelles et autorisation CORS vérifiées. Version 7 publiée en accès privé avec succès. Aucun changement de code supplémentaire.

## 0.7 — Formulaire complet et rendu accessible
- Champs complémentaires et 17 cases accessibles dans le parcours principal.
- Export PDF local avec choix clavier/bleu/noir ; impression synthèse préservée.
- Correspondance enrichie des rubriques sur la première page, signatures au centre ; anciens PDF signés préservés.
- 44 tests réussis, build et contrôle visuel des trois styles.

Publication 0.7 confirmée : version 8, accès privé inchangé, déploiement réussi le 21 septembre 2026 à 00:46:27 UTC. https://accordia-constat.adil-btp.chatgpt.site

## Mise à jour modèle et invitation
0.8 : remplissage direct du JPEG fourni ; bouton Inviter le conducteur B visible et création de lien après sauvegarde. Textes complets conservés, dépassements signalés. Droits et anciens PDF préservés.

0.8 publiée en privé avec succès le 21 septembre 2026 à 00:53:42 UTC (version 9). Autorisation d’accès de B en attente de son identité.

## Listes de saisie
0.8.1 : saisie assistée par listes FR/EN/DE/NL dans les deux parcours, avec saisie libre et conservation des valeurs.

## Avancement des participants
0.9 : indicateurs de fin de saisie pour A/B, bouton de confirmation, horodatage, message prêt à préparer le PDF. Confirmation différente d’une signature. Invalidation après correction et protection des droits côté serveur.

## 0.9.1 — 2026-09-21
- Guide complet en quatre langues, accessible avant de remplir et pendant la session partagée.
- Actions explicites pour reprendre la saisie après relecture/préparation du PDF.
- Explication des corrections : nouvelle version, nouvelle relecture et nouvelles signatures, anciens PDF conservés.

## 0.10 — 2026-09-21
- QR personnel d’invitation généré sur l’appareil.
- Mode A/B sur un seul appareil, langues et photos propres, PDF avec deux signatures locales et retour aux corrections.
- Guide adapté ; protection des imports de signature contre un changement de conducteur en cours de chargement.

## 0.10.1 — 2026-09-21
- Tutoriel visuel animé en quatre langues, six étapes et trois parcours d’enregistrement.
- Navigation libre, lecture/pause et respect des préférences de mouvement réduit.
- Explications distinctes du brouillon, de la sauvegarde partagée, des confirmations et du PDF signé.

## Audit — 2026-09-21
- Rapport de revue sécurité/fonctionnement/rendu, avec preuves, limites et ordre de correction.
- Vérification TypeScript, build, 49 tests et scanner de dépendances ; aucune modification applicative.
