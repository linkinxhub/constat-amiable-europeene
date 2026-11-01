## 2 novembre 2026 — Complétion et documents historiques

- Corriger les compléments depuis un raccourci vers le formulaire existant, sans dupliquer la saisie ou les validations en relecture.
- Préserver le cache gratuit et les anciens PDF traduits ; expliquer la réutilisation et la régénération explicite plutôt que déclencher silencieusement un appel IA. Identification automatique de la version du moteur des anciens documents reste un lot séparé.
- Les lots d’exploitation suivent docs/ORDRE_TRAVAIL_EXPLOITATION_2026-11-02.md ; les recettes physiques, paiements réels et validation assureur ne sont pas remplacés par des tests locaux.

# Décisions
- 2026-09-20 : Accordia est un nom provisoire ; concept original, aucune affiliation DARVA.
- Commencer par une application web responsive et l'API commune ensuite ; aucun APK promis au lot 1.
- Préparation locale transparente plutôt qu'une connexion assureur fictive.
- Conducteur et preneur d'assurance sont deux données distinctes.
- Texte utilisateur conservé dans sa langue ; seuls les libellés sont traduits au lot 1.
- Les Sites URL sont de production : aucun déploiement avant signal utilisateur. Preview interne pour QA seulement.
- Aucune donnée personnelle du profil utilisateur préremplie dans un sinistre.
- Lot 1.1 priorisé à la demande d'amélioration distinctive : relecture multilingue A/B sur le même appareil, pas collaboration réseau. Comptes/serveur restent lot 2.
- Les repères « Relu » sont locaux, remis à zéro lors d'une correction et jamais assimilés à une signature ou identification.
- Le document imprimé utilise la langue de l'onglet de lecture actif. Pas de promesse de PDF bilingue simultané.
- Navigation entre étapes libre pour corriger ; complétude exigée uniquement pour progression guidée et impression. Aucun faux indicateur de validation pour les étapes sautées.
- Lot 2A : SIWC ChatGPT est la voie réellement disponible sur Sites. Authentification email grand public et app native non simulées, à traiter après choix de distribution.
- Stockage privé D1/R2 et quotas provisoires modestes. Pas de migration automatique des données locales ni d'effacement de versions.
- Une requête acceptée réserve son budget même si le stockage/commit échoue. Les objets non référencés nécessitent une politique de rétention/collecte vérifiée ; aucun nettoyage implicite dans cette livraison.
- Refuser les conflits 409 et conserver la saisie plutôt que proposer un écrasement forcé. Chaque lecture/écriture est limitée au propriétaire.
- Pas de test E2E authentifié hébergé dans ce lot : uniquement fonctions avec identités synthétiques, moteurs D1/R2 locaux et refus HTTP sans identité. Aucun contournement de connexion injecté dans l'application.

- Lot 0.4 : prioriser la demande GPS/session A/B/photos/croquis avec historique. Rétention définitive différée ; aucune suppression.
- Auth ChatGPT existante maintenue ; pas de compte invité fictif. Deux personnes doivent être autorisées au niveau du site avant la recette hébergée.
- A propose les champs communs ; chaque identité modifie uniquement son côté. Une restauration globale partagée reste interdite.
- Consentement de chaque conducteur requis avant transmission de cette révision à OpenAI. Les propositions IA sont non probantes et distinctes du croquis manuel.
- OPENAI_API_KEY et OPENAI_SKETCH_MODEL non configurés. Activer OpenAI Developers et sa skill openai-platform-api-key pour configuration sûre avec accord utilisateur.

## 0.5 — Fidélité du rendu
L’assemblage du PDF est déterministe pour préserver les déclarations. L’IA intervient seulement dans la proposition de croquis, soumise à validation A/B et non disponible sans configuration. Le document signé dérive des octets du PDF relu. Les signatures sont des images fournies par chaque participant, jamais générées par IA ; ce mécanisme ne prétend pas fournir une signature électronique qualifiée. Les textes longs sont repris intégralement en annexes. Styles d’écriture appliqués aux champs, structure du document constante.

## 0.6 — Corrections d’audit
Ne pas publier ni élargir les accès pour compenser l’absence de recette à deux comptes. Ne pas configurer un fournisseur fictif. Préserver les originaux ; aperçus WebP ajoutés, remplacement de pièces seulement sur action utilisateur et anciennes versions conservées. Porter le payload à 10 Mio pour six images de 1 Mio, borner aussi les pixels et le calcul. Défaut de fuseau des anciens constats déterminé par pays (UTC pour OTHER), présenté et modifiable, sans dépendre du serveur. Le lien de carte est explicite : aucune position n’est envoyée à un fournisseur de cartes avant clic.

## Lot adresse GPS 0.6.1
Sur demande du remplissage automatique, intégrer Photon/Komoot sous consentement utilisateur explicite. Le service public permet un usage modéré sans garantie : https://github.com/komoot/photon . Aucun appel répété automatique. Instance dédiée à prévoir avant montée en charge. La règle historique de non-transfert est remplacée uniquement pour ce clic consenti. Contrôle automatique a rejeté l’essai externe ; attendre autorisation explicite pour le vérifier.

## Correction 0.7
Réunifier la saisie principale et le document final au lieu de réserver les détails à la collaboration. Conserver la synthèse imprimable sous un intitulé distinct. Redessiner la structure de référence, sans prétendre réutiliser le JPEG absent ni revendiquer un statut officiel.

## Mise à jour modèle et invitation
Le JPEG auparavant absent est désormais disponible. Intégrer ses octets, pas une recréation. Ne pas rendre le site public pour débloquer B ; demander son identité pour un partage ciblé.

## Avancement des participants
Utiliser un signal de fin explicite fondé sur les données enregistrées, et non un indicateur de présence ou une supposition après clic Enregistrer. Ne pas envoyer de messages externes.

## Mode sur appareil commun
Ne pas simuler un compte B ni réutiliser les droits A pour signer B dans les API authentifiées. Recueillir localement les signatures des personnes présentes, sur un PDF figé distinct, avec mention de provenance. Pas de persistance silencieuse des signatures : téléchargement explicite, brouillon séparé. Le QR conserve la politique d’accès existante.

## 2026-09-21 — Fiabilité des corrections 0.11
- Les PDF locaux sont des documents distincts du brouillon. Conservation dans `accordia-drafts` v2, magasin `documents`, uniquement sur consentement explicite par PDF. Identité de rapport, identifiant unique de document et date visibles. Les PDF restent sur ce navigateur ; le compte partagé conserve son stockage serveur existant.
- Le registre D1 `storage_objects` réserve atomiquement les octets et protège chaque commit par un état pending. Un nettoyage passe l’objet en cleanup avant suppression R2 ; il ne peut plus être référencé par un écrivain tardif. Les erreurs de transport ne suppriment jamais un objet encore référencé. Les tentatives restent limitées séparément.
- La récupération propriétaire recense les références historiques, conserve leurs objets et recalcule le budget avec les réservations actives. Les orphelins anciens non suivis par le registre ne sont pas supprimés automatiquement, faute d’attribution sûre. Toutes les versions utiles restent comptabilisées.
- Le croquis manuel est le choix PDF par défaut. Le choix IA nécessite une proposition approuvée par A et B pour la révision courante ; le dessin manuel est alors conservé séparément en annexe. Aucune superposition ambiguë.
- Le délai minimum de sept jours pour les dépendances reste inchangé. Pas d’exception pour image-size 2.0.3/2.0.4 ; le reliquat du scanner est documenté. Le code applicatif ne lui confie aucune photo reçue.

## 0.12 — Super administrateur et secrets
- L’email de propriétaire sert au contact, pas à l’autorisation. La politique Sites ne fournit pas le même identifiant que SIWC : aucun rapprochement inventé. Code d’activation 256 bits à usage unique, expiration à sept jours, remis au propriétaire ; première utilisation volontaire avec son compte connecté. Après activation le code ne peut plus attribuer de rôle, même avant expiration.
- Chiffrement applicatif AES-GCM et secret de chiffrement séparé pour permettre un réglage depuis l’interface sans exposer la clé fournisseur ni nécessiter de redéploiement pour chaque changement. Le rôle n’accorde aucun accès supplémentaire aux constats.
- Aucun fournisseur alternatif, modèle par défaut ou fausse génération. Le bouton test valide l’accès à un modèle, pas la génération. Aucune clé OpenAI réelle n’a été utilisée pendant les tests.
- Activation du rôle désactive la configuration env historique jusqu’à l’enregistrement explicite d’une clé et l’activation du service ; comportement visible dans l’interface.

## 0.13 — Langues et IA
- Ouvrir la préparation à B tout en conservant son périmètre de session et de signature. Ne jamais traduire ou copier silencieusement un document déjà signé.
- Conserver le fond français fourni et ajouter une copie de lecture localisée, plutôt que retoucher l’image du constat. Traduire par IA seulement les six récits dégâts/observations/impact ; adresses, noms, contrats, dates et témoins restent originaux.
- Les deux personnes autorisent l’envoi des récits pour les quatre langues, pour une révision précise. Retrait possible pour les nouvelles préparations ; les documents précédemment générés restent conservés. Les textes peuvent contenir des données personnelles malgré l’omission des champs d’identité.
- Validation humaine obligatoire via relecture et signature de chaque PDF. Un schéma JSON valide ne garantit pas la fidélité sémantique. Les réponses utilisées dans les tests sont synthétiques ; aucun essai fournisseur réel ni authentifié hébergé n’est revendiqué.
- Aperçu interne uniquement pour ce lot ; attendre le signal de publication du propriétaire.

## 0.14 — Reprise non destructive et fin explicite
Régénération demandée par un participant : nouveau document et nouvelle empreinte même si le fournisseur produit le même texte, anciennes versions conservées. Aucun modèle de traduction manuelle ajouté à ce lot. Les quotas existants restent applicables. La préparation exige les deux empreintes de fin valides, revérifiées au commit avec la révision du rapport. Le délai de dépendances de sept jours est conservé.

## 0.15 — Réduire les échanges sans déplacer les preuves
Les photos restent dans les objets JSON existants : aucune migration des dossiers. Le jeton de synchronisation ne remplace jamais l’autorisation serveur. Les lots de récupération sont explicitement poursuivis par l’utilisateur ; aucune boucle de nettoyage automatique. Les objets déjà référencés restent protégés.

## 0.17 — Plafond d’appels, pas estimation monétaire
Retenir un plafond conservateur de 100 tentatives par jour UTC pour le service partagé. Il s’agit d’une borne technique, non d’un budget financier ; tarification du modèle et facturation externe non déduites. Les essais de connexion au modèle ne sont pas des générations. Aucun contournement depuis le client et aucune remise à zéro administrative ajoutée.

## 0.18 — Cadrage confirmé
Belgique/France/Allemagne au lancement, Espagne/Pays-Bas ensuite ; document européen existant. Le refus produit une déclaration séparée, sans contourner la double signature du constat commun. Les quatre offres sont des choix de préférence tant que tarifs et intégration de paiement ne sont pas définis. Deux mois calendaires démarrent à la première sauvegarde ; édition/restauration ne remettent pas le compteur à zéro. Suppression physique serveur implémentée par lots mais son déclenchement planifié reste à raccorder ; avant cela, ne pas annoncer une garantie de purge automatique. Pas de messages sortants. Test réel au signal du propriétaire, publication sur autorisation explicite.

## 0.19 — Déclenchement disponible et limite explicite
Utiliser l’activité authentifiée pour lancer des lots bornés. Ne pas créer de faux cron, élargir l’accès du Site, ni transférer de secrets à un ordonnanceur externe. L’interface dit explicitement qu’une suppression physique peut être différée sans activité. L’accès aux dossiers expire indépendamment de leur purge physique. Planificateur indépendant et politique des sauvegardes restent à raccorder ; le test réel reste au signal utilisateur. Les fonctions de suivi administrateur ne figurent pas dans le guide des conducteurs.

## 0.20 — Tarifs acceptés, activation commerciale distincte
Le propriétaire demande l’application de la grille recommandée et des explications du montant. Afficher pourquoi payer l’aide IA tout en maintenant le PDF standard gratuit. Ne pas inventer un paiement ni vendre un espace flotte absent. Rendre explicites les offres prévues et conserver les fonctions existantes. Le test A/B tarifaire proposé dans l’étude n’est pas lancé sans recette réelle autorisée.

## 0.22A — Préparation du paiement
SMARTDEV est le compte de test disponible ; attendre son choix explicite avant opérations spécifiques, conformément au workflow Stripe. Checkout hébergé retenu. Les droits devront dépendre de notifications vérifiées et idempotentes, jamais du retour navigateur. Ne pas ouvrir les ventes flotte avant les fonctions métier.

## 0.22B — Compte confirmé
SMARTDEV test confirmé par le propriétaire. Huit tarifs créés et vérifiés ; aucune autorisation de passage en mode réel.

## 0.22C — Adaptateur Stripe test
Commencer par le dossier unitaire ; aucun abonnement ou achat flotte avant son cycle de vie complet. Ne pas créer de webhook distant sans destination opérationnelle accessible. Ne pas exposer une route de paiement avant persistance et autorisation des commandes.

## 0.22D — Commandes de test
Conserver la preuve de paiement séparément des droits : une confirmation tardive peut être enregistrée après expiration du dossier, sans rouvrir celui-ci. Pas de vente avant gestion des commandes expirées, remboursement et droits. Aucune publication du nouveau lot 0.22D dans ce tour.

## 0.22E — Flux de paiement test
Ne pas recréer automatiquement une ancienne session incertaine. Ne pas réapprovisionner les crédits sur réception répétée. Conserver un cas à examiner au lieu d’activer des droits après expiration ; traitement manuel/remboursement à construire avant vente.

## 0.22F — Routes de test
Ne pas rendre le Site public pour recevoir Stripe. Vérifier la possibilité d’une destination publique dédiée avant enregistrement du webhook distant. Mode test explicitement activé seulement après configuration des secrets. Requêtes webhook sans authentification navigateur mais obligatoirement signées.

## 0.22G — Crédits de test
Ne pas restituer automatiquement un crédit si la sortie a réussi mais que l’enregistrement du règlement a échoué. Ne pas réexécuter une opération portant un identifiant déjà réservé/terminé. Le futur raccordement doit englober la sauvegarde de la sortie et conserver les contrôles de consentement/révision actuels.

## 0.22H — Raccordement progressif au fournisseur existant
Raccorder d'abord le croquis via une route de test administrative fermée par défaut. Ne pas envelopper seulement le fetch : sortie durable et débit doivent être atomiques, y compris en cas de réponse perdue. Conserver les quotas techniques, le consentement et la révision. La traduction nécessite un raccordement distinct autour du PDF sauvegardé et de la réutilisation d'un PDF existant, sans facturer ce cache. Aucun parcours de paiement client activé. La demande « Publier et continuer » autorise la publication après validation de ce sous-lot également.

## 0.22I et demande de repérage visuel
Poursuite du raccordement du PDF traduit validée par « Ok continuer ». Nouveau lot préparé et testé localement, sans nouvelle publication de production dans ce tour. Préserver le cache gratuit et les droits ordinaires. La question jointe sur l'image est traitée par vérification du formulaire et cadrage, sans annoncer une fonction IA/photo qui n'est pas implémentée.

## 2026-10-23 — Propriété distincte de la lettre du conducteur
La création du dossier ne détermine plus la lettre A. `owner_side` fixe la lettre choisie et le participant invité reçoit l'autre. La colonne historique `participant_b` désigne toujours l'invité en base, même s'il est A ; elle n'est pas renommée pour préserver les gardes et historiques. Les faits communs restent proposés par A. L'automatisation IA est bornée à une tentative par révision et conserve les consentements et validations humaines. Voir docs/PARTICIPANT_START.md.

## Synchronisation des informations produit
Une source commune pour les montants et offres, une liste commune pour les pièces. Aucune synchronisation de données personnelles vers la vitrine. Une identité du preneur ou une remorque ne doit pas modifier les champs du conducteur ou du véhicule tracteur. Les dix générations commerciales annoncées concernent croquis/traductions ; quota commercial des pièces à définir avant vente.

## Questionnaire gratuit
La réduction de la charge de saisie est incluse dans le socle gratuit : aucune requête IA ni coût fournisseur ajouté. L’extraction documentaire conserve sa barrière serveur Premium. Une description FR/EN/DE/NL réutilisée évite les divergences vitrine/tarifs/compte/aide ; toutes les fonctions futures doivent être raccordées et vérifiées, sans prétendre à une synchronisation automatique de code.

## 2026-11-01 — Personnes et véhicules distincts
Le choix solo ne force ni un seul véhicule ni un rôle A. Les signatures personnelles restent dans les parcours préexistants ; aucun accord attribué à un absent. Les cartes rejoignent des fonctions réelles et ne créent aucun compte. La confirmation de sécurité n’est pas conservée comme déclaration et ne vaut pas réponse sur les blessés. Illustrations originales CSS, sans réutilisation des visuels ou marque de référence. Consignes générales sans distance nationale universelle ; priorité à l’absence d’exposition au danger. Référence consultée : Police fédérale, « Panne, accident, comment sécuriser les lieux ? » (26/11/2024), https://www.police.be/5998/fr/actualites/securite-routiere-panne-accident-comment-securiser-les-lieux .

## 2026-11-01 — Correctifs de sécurité des dépendances
Accepter la migration Zod 4.6.6 pour corriger le risque de diagnostics non bornés, avec tests de schéma/anciens dossiers et suite métier. Version déclarée et override harmonisés ; lockfile figé. Conserver le délai de sept jours pour Minimatch 11.0.1 (27/10/2026 22:26 UTC) et documenter l’alerte modérée de développement ; pas d’override majeur forcé avant examen de compatibilité. L’audit ne justifie ni masquer les 46 diagnostics lint historiques ni refactoriser globalement les parcours. Publication non incluse dans « pousser ».

## 2026-11-01 — Rapidité sans suppression ni fausse validation
Ne pas redemander la même fiche après fin guidée ; utiliser les confirmations réelles et les gardes serveur existantes. Une progression de position ne vaut pas dossier valide. Replier les détails vides à l’écran, conserver les données et l’impression. Distinguer un conducteur seul de deux véhicules, mais exclure la fiche inactive B de tout nouvel export explicitement à un véhicule, JSON inclus ; ne pas effacer le brouillon ni modifier un PDF existant. Les PDF complets conservent les annexes, sans promesse d’une page unique. Publication de ce lot autorisée explicitement, audience inchangée.

## 2026-11-01 — Préremplissage depuis plusieurs photos
Réutiliser le serveur réel et ses autorisations plutôt qu’ouvrir une seconde intégration. Envoi séquentiel, cinq pièces locales maximum, consentement du lot mais autorisation/quota serveur par pièce. Arrêt au premier échec pour maîtriser les appels ; la reprise saute les succès. Type choisi explicitement pour prévenir la confusion conducteur/preneur/titulaire ; pas d’identification faciale, extraction de signature ou de numéro national. Relecture groupée obligatoire ; jamais d’application silencieuse, de responsabilité déduite ou de signature automatique. Préserver l’essai administrateur existant et ne pas simuler un droit Premium client. Demande actuelle autorise le développement, pas une nouvelle publication production. Point de restauration before-document-photo-batch-20261101.

## 2026-11-01 — Audit de robustesse
Corriger les 43 erreurs lint sans désactiver de règle, avec remises à zéro conditionnelles de l’état et références après commit ; pas de timers destinés à cacher les setters. Borner readJson à 60 s et refuser les encodages UTF-8 invalides, avant écriture métier. Préserver la politique de sept jours et signaler l’alerte Minimatch de développement tant qu’un correctif compatible n’est pas éligible/testé. Ajouter une commande de vérification séquentielle ; ne pas présenter cela comme une CI distante activée. Production conservée, aucun nouvel accord de publication dans la demande de ce lot. Référence before-robustness-audit-20261101.


## 2026-11-01 — Synthèse IA avant croquis
Deux étapes serveur, sans ajouter le texte dérivé au constat signé. Synthèse générée dans la langue de lecture de la personne qui lance la demande ; langue affichée, pas de traduction silencieuse par destinataire. Nouvelle proposition invalide les anciens accords associés ; une validation retirée bloque un nouveau PDF utilisant ce croquis mais ne détruit aucun PDF existant. Ancien croquis sans summary_id compatible, toute nouvelle génération exige la synthèse. Tentative auto distincte par étape/version ; nouvelle tentative manuelle explicite après erreur. Aucun appel réel au fournisseur dans la recette.


## 2026-11-01 — QR d’accès sur le constat
Le QR ouvre le dossier courant, pas un document immuable ni une invitation. Authentification et appartenance A/B conservées par la page session et ses API. Local/appareil commun ouvrent le compte avec mention hors ligne : aucun faux accès cloud. Origine canonique identique au site Sites actuel ; actualiser cette constante lors d’un changement de domaine. Aucun retrait des PDF signés existants.


## 2026-11-01 — Réparation du partage mobile
Ne pas exposer publiquement existence, propriétaire ou état d’une invitation pour améliorer l’erreur : not_found reste opaque côté serveur. Le client affiche une aide d’accès plutôt que Action impossible. Pas d’adhésion automatique ; le destinataire confirme personnellement. Un retour de connexion qui ne transmet jamais le fragment à l’application ne peut pas être reconstruit : proposer rouvrir le message et coller le lien complet. Changement de navigateur/onglet n’est pas une synchronisation de sessionStorage. Un compte ne peut occuper les deux places. Récupération de réponse POST perdue par lecture d’appartenance, aucun assouplissement de validation.
