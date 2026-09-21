# Accordia — Spécification produit

## Vision
Une plateforme SaaS et une application mobile liées, originales, pour préparer un dossier de constat amiable automobile européen en français, anglais, allemand et néerlandais. Inspirée des usages publics d’e-constat auto, sans réutiliser sa marque, son code, ses visuels ni revendiquer son statut officiel.

## Public et expérience
Particuliers et, dans un second temps, professionnels/flottes. Priorité au téléphone, aux situations stressantes et à deux conducteurs parlant des langues différentes. Belgique, France et Allemagne retenues pour le lancement ; Espagne et Pays-Bas prévus ensuite, sans retirer les possibilités de saisie existantes. Aucun diagnostic de responsabilité ou conseil d'indemnisation automatisé.

## Lot 1 — Parcours de préparation
Application web responsive ; dictionnaires FR/EN/DE/NL ; cinq étapes ; date, heure, lieu et pays ; blessés et nombre de véhicules ; conducteur séparé du preneur d'assurance ; véhicule/immatriculation/assureur/police ; circonstances A/B ; observations et témoins ; photos locales limitées ; croquis libre ; récapitulatif imprimable explicitement non signé. Brouillons enregistrés localement seulement sur action explicite, statut fidèle et récupération. Aucun compte, envoi, paiement ou signature simulé.

Critères : saisie conservée lors du changement de langue/étape ; contrôles des champs obligatoires ; blessés affichent une orientation secours sans finalisation amiable ; aucune responsabilité présumée ; documents reflètent les données saisies ; aucune donnée d'accident transmise à un tiers ; mobile sans débordement ; build et tests ciblés passent.

## Cible commerciale — lots ultérieurs
- Comptes sécurisés, organisations, profils véhicules, reprise multi-appareils ; API commune web/mobile.
- Invitation à durée limitée par QR/lien ; chaque participant ne modifie que ses déclarations ; langue indépendante ; conflits visibles et absence de fusion silencieuse.
- Champs complets du formulaire de référence à faire valider : assurés, conducteurs, permis, véhicules/remorques, assureurs/agences, circonstances normalisées, points de choc, dégâts, témoins, observations, visas.
- Croquis structuré (routes, véhicules, flèches), photos originales et annotations non destructives ; géolocalisation opt-in ; OCR avec validation humaine de chaque valeur.
- Préparation bilingue ; texte original toujours conservé ; traduction proposée distincte et approuvée avant gel ; aucune traduction automatique silencieuse après signature.
- Signature électronique via prestataire choisi : consentement, preuve d'identité appropriée, horodatage, empreinte et journal ; gel immuable ; nouvelle version si modification ; pas de promesse eIDAS universelle.
- Export PDF versionné ; transmission aux assureurs uniquement par intégrations et accords vérifiés ; accusé réel et relances idempotentes ; téléchargement manuel possible.
- SaaS : rôles USER, ORG_ADMIN, SUPPORT, PLATFORM_ADMIN séparés des abonnements ; permissions serveur ; offres particulier/flotte à valider ; paiement Stripe seulement après choix du modèle économique.
- Console d'administration, audit des accès, export/suppression selon rétention validée, consentements, quotas, factures, support sans accès général aux sinistres.
- Application Android/iOS partageant les mêmes API ; commencer par web mobile, décider PWA/Capacitor/Flutter après validation. Cache hors ligne chiffré à concevoir ; aucune promesse de mode hors ligne avant tests.

## Avant lancement réel
Validation pays/assureurs, formulaire complet et traductions professionnelles ; base légale, minimisation, hébergement, rétention, droits RGPD et analyse de risques ; contrats et signature ; pentest/IDOR ; accessibilité ; sauvegarde/restauration ; distribution stores ; supervision ; production sur autorisation explicite.

## Référence belge additionnelle
Crashform (Assuralia) étudié via sa fiche Google Play. Son autorisation déclarée d'usage des données du constat européen n'autorise pas Accordia. Ajouter vérification Insurance Europe/licences au jalon avant formulaire officiel ; aucun partenariat avec Assuralia présumé.

## Lot 1.1 — Relecture à deux et fiabilité (2026-09-20)
Implémenté : dossier complet consultable A/B avec langue indépendante par lecteur ; libellés et circonstances localisés, récits originaux conservés ; marques de relecture locales non probantes et non persistées ; remise à zéro des deux marques après changement du dossier/langue ; impression exige les champs requis et les relectures des participants actifs. Aucun mécanisme d'identité n'est revendiqué.
Bilan des champs manquants par étape/véhicule, liens de correction, navigation libre sans fausses coches de complétion ; sauvegarde manuelle dès la situation ; protection avant changement de brouillon ; avertissement de fermeture si modifications ; conservation des nouvelles saisies pendant un enregistrement.
Acceptation : migration des anciens brouillons sans perte ; langues A/B indépendantes ; originaux identiques ; invalidation après changement ; conflit de sauvegarde n'écrase pas saisie ; pas d'impression incomplète ; affichage mobile sans débordement.

## Lot 2A — Identité et dossiers serveur
Ajout de l'identité SIWC (ChatGPT) fournie par le dispatcher de l'hébergement, d'une page compte FR/EN/DE/NL et des API privées de dossiers. Aucune identité commerciale indépendante, aucun rôle admin par email et aucun abonnement activé. Propriétaire stable issu du serveur, jamais du corps JSON.
L'utilisateur choisit explicitement « Enregistrer sur mon compte » ; les brouillons locaux restent distincts. JSON du dossier avec ses photos et croquis dans R2 privé, métadonnées/version/propriétaire dans D1. Limites provisoires : 8 Mio par requête, 100 dossiers, 6 tentatives d'écriture par minute, 128 Mio de réservations cumulées par compte. Les réservations et objets d'une tentative échouée peuvent rester comptés ; nettoyage et rétention à définir avant lancement. Anciennes versions conservées et non exposées par une URL publique.
Critères : identité absente -> 401 ; lecture/écriture avec filtre propriétaire ; compte suspendu bloqué ; anciennes versions jamais écrasées ; comparaison de révision au commit ; origine et en-tête d'intention contrôlés ; taille réelle du flux bornée ; erreurs sans perte de saisie. Aucun transfert automatique des brouillons. Recette SIWC hébergée non réalisée ; pas de production autorisée.

## Lot 2B/3A — Géolocalisation et session partagée (0.4.0)
GPS sur demande avec latitude/longitude, horodatage, précision annoncée et saisie du lieu conservée. Ce point est la position courante du téléphone, pas une preuve du lieu de l’accident.
Dossier partagé A/B lié à deux identités ChatGPT : invitation à usage unique 24 h, secret haché côté serveur, lien en fragment. Chaque participant édite sa déclaration, ses circonstances, sa langue et ses photos (3 × 1 Mio, six au total). A propose les faits communs ; B peut les contester dans ses observations. Enregistrement explicite ; lecture automatique toutes les dix secondes lorsque la saisie n’est pas modifiée. Actualisation manuelle préserve la partie en cours.
Croquis IA structuré proposé à partir des récits/circonstances/photos après accord serveur A/B pour une révision précise. Fournisseur OpenAI non configuré : fonctionnalité indisponible sans clé et modèle serveur. Les noms, polices, adresses et GPS ne sont pas ajoutés au texte envoyé ; photos et récits peuvent eux-mêmes contenir des données personnelles. Relecture A/B de la proposition, invalidation sur version différente, aucune détermination de responsabilité, aucune signature. Le dessin manuel est conservé.
Historique des 100 dernières versions et restauration créant une nouvelle révision pour les dossiers non partagés ; refus d’une restauration globale après partage. Aucun effacement ni durée de conservation définitive appliquée.

## Lot 0.5 — Document commun
A partage l’invitation dédiée ; B rejoint avec son identité et remplit uniquement sa partie. Les langues de saisie restent indépendantes. A choisit le style commun clavier/bleu/noir et la langue des libellés PDF. Les récits originaux ne sont pas reformulés. Chacun relit le PDF figé, dessine ou importe sa signature et confirme personnellement. Après les deux signatures, le PDF final devient disponible aux participants. Tout changement de données, de style ou de langue impose une nouvelle préparation et de nouvelles signatures. Le modèle reprend la structure du constat fourni sans revendiquer un statut officiel.

## Lot 0.6 — Corrections
Critères livrés : droits revérifiés au commit, images invalides PNG/JPEG rejetées avant stockage/rendu, relecture exhaustive, pays/témoins/dessin corrigibles par A, payload IA conforme aux 17 cases, diagnostics partagés, dates indépendantes du serveur, navigation vers tous les PDF, reprise des sessions par B, imports préservant les saisies. Photos nouvelles 1 Mio, 4 MP/photo et 8 MP/dossier ; requête globale 10 Mio. Lieu confirmé distinct du GPS, modifiable et consultable par lien carte. Les limites serveur WebP, la traduction assistée, les opérations de conservation et la recette réelle restent explicitement ouvertes dans STATUS.md.

## Lot adresse GPS 0.6.1
Le clic GPS, après consentement externe explicite, propose le lieu/rue et la ville via Photon/Komoot. Ne garantit pas une adresse exacte ; validation manuelle maintenue. Champ ville optionnel pour compatibilité.

## Correction 0.7
Le parcours principal expose les mêmes champs complémentaires et circonstances normalisées que la session. Le PDF local est un document à relire non signé, téléchargeable même incomplet pour contrôler son rendu ; une absence de réponse ne devient jamais « non ». Les signatures authentifiées restent dans la session partagée.

## Mise à jour modèle et invitation
Le modèle exact fourni est utilisé sans traduire son fond français. Saisies intégrales en annexes si dépassement physique ; aucune suppression silencieuse. Partage visible mais site privé : le lien de session ne remplace pas l’autorisation Sites.

## Listes de saisie
Listes de suggestions non exhaustives et facultatives, sans préremplir des faits. Catégories multiples possibles par saisie libre. Marque choisie puis modèle complété librement.

## Avancement des participants
Chaque conducteur confirme personnellement la fin de sa partie. Enregistrer seul ne signifie pas terminer. Terminer nécessite ses champs obligatoires et les 17 cases vérifiées ; A renseigne aussi situation et dégâts aux tiers. Les deux confirmations affichent la possibilité de préparer le PDF, sans signature automatique.

## 0.10 — QR et deux conducteurs sur un appareil
Invitation affichable en QR local, même jeton et mêmes exigences d’accès que le lien existant. Mode local explicite depuis le parcours principal : données communes, partie A/B, langue personnelle, photos attribuées (3 chacun), confirmation de fin, PDF clavier/bleu/noir, relecture et signatures personnelles successives. Pas de compte B créé ni d’authentification individuelle revendiquée. PDF/signatures gardés dans la page ; téléchargement nécessaire, brouillon enregistrable séparément. Aucune garantie de fonctionnement hors ligne après fermeture. Correction : nouvelle préparation et signatures, anciennes versions téléchargeables pendant la page ouverte.

## Lot 0.12 — Administration du fournisseur de croquis
Demande : permettre au super administrateur de saisir sa clé API. Page /admin accessible depuis le compte, FR/EN/DE/NL. Activation volontaire par code privé à usage unique remis au propriétaire, puis rôle lié exclusivement à l’identifiant SIWC stable du compte. Aucune attribution par email ou rôle fourni par le navigateur. Configuration globale OpenAI : clé chiffrée, modèle explicite, activation/désactivation, remplacement et test d’accès au modèle sans données de constat. Les conducteurs ne peuvent pas consulter ou modifier ces paramètres. Les consentements A/B, quotas et validations des croquis existants restent obligatoires.

## Lot 0.13 — PDF linguistique et traduction assistée
A et B peuvent chacun préparer une version PDF avec style et langue FR/EN/DE/NL. La langue personnelle présélectionne la langue du PDF et suit ses changements. Option IA explicite dans la session partagée : traduit les dégâts, observations et points de choc des deux conducteurs, sans remplacer les saisies. Les autres champs restent intacts ; les libellés normalisés utilisent les dictionnaires existants.
Consentements de transmission A/B distincts de ceux du croquis, liés à la révision, révocables. Le PDF garde le modèle français exact en première page, ajoute une page de lecture localisée, les originaux intégraux et les traductions en annexes/JSON attaché. Chaque PDF linguistique est figé et signé personnellement par A et B ; aucune signature recopiée d’une autre langue. Aucun mode local n’envoie automatiquement des données à l’IA. Les récits doivent être relus humainement.

## 0.14 — Fiabilisation de la préparation
La préparation du PDF partagé exige les confirmations explicites de fin A/B. En cas de traduction incorrecte, chacun peut demander une nouvelle traduction et un nouveau PDF sous les mêmes consentements et quotas. Les déclarations et PDF antérieurs restent conservés ; aucune signature copiée. La comparaison aux originaux reste une relecture humaine dans le PDF.

## 0.17 — Disponibilité IA maîtrisée
Croquis et traductions partagent un plafond quotidien global de 100 tentatives UTC. À épuisement, messages clairs et poursuite sans IA ; documents existants conservés. Réessayer un autre jour sous réserve des autres conditions du dossier.

## 0.18 — Décisions du propriétaire du 21 septembre 2026
- Constat européen : modèle fourni inchangé, extensions lisibles et aucune reconnaissance officielle présumée.
- Refus : panneau dans les parcours principal, partagé et appareil commun ; acteur A/B explicite (verrouillé au participant dans la session). Confirmation, texte libre facultatif, PDF séparé marqué unilatéral non signé. Aucun original modifié, aucune signature récupérée, aucun accord attribué à l’autre partie. Les informations inconnues peuvent rester vides. PDF à télécharger ; refus non ajouté automatiquement au dossier partagé.
- Offres : gratuit, paiement par dossier, abonnement particulier, flotte. Préférence persistée sur le compte avec validation serveur ; aucun paiement, abonnement ni privilège activé. Tarifs et quotas commerciaux non définis.
- Conservation cible : deux mois calendaires depuis le premier enregistrement, fin de mois bornée, aucune prolongation sur édition. Ancienneté serveur issue de la première version ; anciens brouillons locaux : dernière date disponible. Blocage des accès serveur expirés et nettoyage local à la réouverture du stockage. Date de téléchargement affichée sur les dossiers listés et dans la session ; pas de notification externe.
- Purge serveur : service borné et reprenable, route POST réservée au super administrateur. Planification automatique encore NON raccordée ; ne pas promettre une suppression physique automatique à échéance ni une purge des sauvegardes de l’hébergeur. Les copies déjà téléchargées sont hors périmètre.
- Déclaration : inviter à prévenir sans attendre et à vérifier le contrat, sans transformer cinq jours en règle internationale.
Critères : langues et pays cohérents ; refus sans signature commune ; préférence sans droits ; expiration non repoussée ; purge reprenable et isolée ; compatibilité des dossiers et tests ; guide/tutoriel FR/EN/DE/NL ; aucune publication ou recette réelle dans ce lot.

## 0.19 — Nettoyage automatique sur activité (aperçu)
Une requête authentifiée d’un compte non suspendu peut déclencher un lot de nettoyage global des dossiers expirés. Maximum un lot toutes les cinq minutes après une fin sans reste, reprise après une minute si du travail reste ou en cas d’erreur. Les requêtes anonymes ne déclenchent rien. L’état de suivi et l’exécution manuelle restent réservés au super administrateur ; aucune lecture de sinistre ajoutée à ce rôle.
Critères : une seule acquisition du verrou parmi plusieurs demandes ; reprise d’un verrou abandonné ; erreurs sans détails privés ; incident de maintenance n’empêche pas l’opération utilisateur ; fichier actif conservé ; compteurs non comptés deux fois ; guide/tutoriel quatre langues exacts. Pas d’exécution garantie sans trafic, ni de promesse de purge des sauvegardes hébergeur ou des orphelins historiques non attribuables.

## 0.20 — Tarification expliquée, achats non ouverts
Grille validée par le propriétaire : Essentiel 0 € ; Premium 6,90 € TTC/accident avec 10 générations IA réussies ; Particulier 19,90 € TTC/an, 4 dossiers, supplément 4,90 € TTC ; Flotte Start 19 € HT/mois ou 190 € HT/an, 10 véhicules, 2 gestionnaires, 2 dossiers/mois ; Pro 49 € HT/mois ou 490 € HT/an, 50 véhicules, 5 gestionnaires, 6 dossiers/mois ; supplément flotte 3,90 € HT ; grande flotte sur devis. Chaque dossier Premium prévoit 10 générations réussies ; quotas flotte mensuels sans report, droits particuliers non reportés à l’année suivante.
Page /pricing?lang=fr|en|de|nl : prix, contenu, valeur de l’aide IA, distinction gratuit/Premium, FAQ, paiement unique A/B prévu, taxes, suppléments non automatiques, limite de conservation inchangée. Offre annuelle flotte : facturation de l’année entière, économie de deux mensualités. Aucun prix testé sur des utilisateurs réels.
Ce lot est informatif : aucun achat ouvert, aucun abonnement ni quota commercial appliqué, aucune suppression d’accès existant. La préférence du compte conserve ses quatre catégories actuelles ; Start/Pro sont comparables sur la page mais ne sont pas encore des abonnements sélectionnables. Les organisations, gestionnaires, webhooks de paiement, crédits réussis et compte marchand réel restent nécessaires avant commercialisation. Le plafond IA global actuel est inchangé.
Critères : tarifs exacts dans les quatre langues ; achat indisponible explicite ; FAQ utilisable et liens compte/guide ; mobile sans débordement ; API et rôles inchangés ; guide/tutoriel actualisés. Publication et test réel au signal du propriétaire.

## 0.22A — Préparation du paiement
Premier composant du paiement : grille serveur correspondant aux tarifs retenus et contrôles des prix en mode test. Les achats restent fermés ; aucune session de paiement ou activation commerciale disponible.

## 0.22D — Commandes de test
Commandes et reçus test uniquement : un dossier du propriétaire actif, une session immuable, un reçu unique. Les reçus ne sont ni des factures ni des droits. Achats et quotas commerciaux toujours inactifs.

## 0.22E — Flux de paiement test
Droits de test uniquement : dix crédits par dossier payé et confirmé, une seule attribution. Paiement après expiration/suspension : cas à examiner sans activation. Retour navigateur ne suffit pas à débloquer. Aucun crédit test ne change les limites IA actuellement accessibles.

## 0.22F — Routes de test
Accès de test limité au super-administrateur pour ses propres dossiers. Aucun nouveau bouton ni achat utilisateur ouvert. Confirmation signée enregistrée durablement, crédits test sans consommation IA active.

## 0.22G — Crédits de test
Crédits test partagés entre croquis et traduction. Réservation avant traitement, consommation après génération et sauvegarde réussies, libération sur échec. Opération incertaine conservée pour rapprochement. Quotas IA actuels inchangés tant que le moteur test n’est pas raccordé.

## Demande complémentaire — schéma de zones, caméra et aide IA
L'image fournie montre un repérage avant/arrière/gauche/droite. Ces directions existent actuellement comme suggestions textuelles du point de choc ; la sélection graphique et l'analyse des dégâts par photo ne sont pas réalisées. Cible : sélection manuelle sur schéma, photo caméra/import et suggestions IA soumises à confirmation, champs manuels conservés. Distinguer zone visible abîmée et premier point de choc déclaré. Une croix sur le schéma ne suffit pas à générer une description de dégâts matériels ; seuls les dommages visibles sur des photos exploitables peuvent faire l'objet de suggestions prudentes. Aucun remplacement automatique des déclarations, choix de circonstances, conclusion de responsabilité ou validation des signatures.
