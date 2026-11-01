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

## 2026-10-23 — Sauvegarde locale automatique
Le formulaire local et le mode sur appareil commun enregistrent les saisies et photos dans IndexedDB. Le dernier brouillon confirmé reprend dans le même onglet. Les boutons manuels restent disponibles ; signatures/PDF restent séparés. Dans une session réseau, les enregistrements restent explicites. Le statut local est séparé des modifications non envoyées au compte. Voir AUDIT_2026-10-23.md pour les limites.

## Saisie express par documents — 2026-10-23
Import JPEG/PNG/WebP/PDF par conducteur, extraction IA et sélection des champs avant application. Les modifications intervenues pendant la relecture sont protégées contre l'écrasement. Consentement explicite, documents non archivés par Accordia, aucune reconnaissance faciale. Limites : 3 Mio, images 4 Mpx, 5 tentatives/heure/compte et plafond IA global partagé de 100 appels/jour. Les échecs peuvent consommer une tentative.
Positionnement Premium affiché sur accueil, tarifs et formulaire en FR/EN/DE/NL. Achats toujours fermés : serveur refuse les comptes ordinaires (402), essai réel réservé au superadministrateur existant. Aucun droit payant ni paiement simulé. Avant ouverture commerciale : paiements réels, droits Premium vérifiés et tarif final.
Tests synthétiques uniquement ; extraction avec documents réels et compatibilité du modèle configuré restent à vérifier. Aperçu navigateur indisponible dans cette session.

## Audit transversal et synchronisation — 23 octobre 2026
Rapport : docs/AUDIT_SYNCHRONISATION_2026-10-23.md. Référence Sites 42 ; restauration before-sync-audit-20261023.
Offres vitrine dérivées de pricingCopy ; montants principaux partagés avec validation serveur via features/product/catalog.ts. Couverture documentaire commune dans formulaire, tarifs, compte/offres, vitrine, guide et tutoriel. Ajout des types remorque et identité du preneur avec champs distincts. États réseau/chargement/annulation/délai IA corrigés, libellés vitrine localisés, consentements clarifiés, règle permanente de synchronisation dans AGENTS.md.
Aucun droit commercial accordé, aucun achat ouvert, aucune donnée privée publiée. Validation : TypeScript, build Sites, 160 tests de la suite complète et un contrôle supplémentaire des pages compilées réussis (161 au total), zéro échec. Sept pages/rendus HTTP contrôlés : accueil, constat, compte, tarifs FR/EN/DE/NL. Recette visuelle et vraie lecture fournisseur non réalisées. L'audit n'est pas une certification exhaustive.

## Questionnaire guidé gratuit — 23 octobre 2026
Option de saisie progressive sur le même constat, sans IA ni nouveau droit payant. Local : sécurité/date/lieu/dommages communs, fiches A/B selon nombre de véhicules, compléments, circonstances, témoins, puis parcours photos/relecture existant. Session partagée : fiche propre et faits communs seulement pour A. Appareil commun : fiche du conducteur choisi. Retour au formulaire complet sans effacer les réponses ; validation, sauvegarde réseau et signature restent explicites selon le parcours. Champs non connus peuvent être complétés à la relecture, sans valeurs inventées. Import IA Premium conservé, achats fermés.

## 2026-10-23 — Choix du mode de saisie
Deux cartes après rôle/langue dans le formulaire principal : saisie guidée gratuite par défaut, saisie express Premium. Lien secondaire vers le formulaire complet. Composant commun EntryMode dans session partagée et appareil commun ; Express cible uniquement le conducteur choisi. Accès vérifié via API existante, interface fermée par défaut, chargement/erreur/réessai explicites ; serveur Premium et autorisations inchangés.
Administrateur : import réel dans une fenêtre dédiée, relecture/application des propositions, puis retour au questionnaire du même constat. Comptes ordinaires : Bientôt disponible, aucun achat simulé. Réponses appliquées préservées ; fermeture abandonne analyse/propositions non appliquées, mention explicite. Description commune FR/EN/DE/NL ajoutée à QuestionnaireInfo, donc vitrine/tarifs/compte/guide/tutoriel synchronisés.
Fichiers : entry-mode (composant, modèle, traductions), workspace/session-client/same-device, document-import, questionnaire-info, styles, tests. Aucun schéma, migration ni changement de quota. Version préparée non publiée ; recette navigateur/mobile et extraction fournisseur réelle non effectuées. Synchronisation GitHub non rétablie.

## 2026-10-23 — Présentation et parcours simplifiés
Rapport docs/EXPERIENCE_2026-10-23.md. Accueil Commencer/Rejoindre, trois étapes, modes guidé/Express, exemple A/B, confiance/FAQ, détails secondaires repliés sans supprimer de fonction ; animations conservées avec pause accessible. Nouvelle page /join contrôlant les invitations locales, langue conservée, autorisations serveur inchangées.
Rôle/langue visibles, réglages photos/IA repliables avant création ; questionnaire conditionnel (19 rubriques sans compléments pour deux véhicules), préférences d'affichage sans destruction de réponses ; cinq phases, liens de correction/relecture et statuts local/session clarifiés. Explications communes FR/EN/DE/NL diffusées dans vitrine/tarifs/compte/guide/tutoriel. Styles écran uniquement, impression conservée.
Pas de migration, de suppression, de fournisseur simulé ni d'achat activé. Préparé sans publication. Contrôles visuels/mobile, vrais comptes/QR et synchronisation GitHub encore ouverts.

## 2026-11-01 — Sécurité et modes par participant/appareil
Avant saisie locale ou ouverture d’une session : consignes de sécurité, lien 112 et bouton « Je suis en sécurité ». Confirmation personnelle en mémoire, demandée pour un nouveau dossier et après rechargement ; ne renseigne pas le champ blessés et n’est ni signature ni consentement serveur. Retour aux consignes disponible. Trois cartes : 2 conducteurs/1 smartphone (parcours appareil commun), 2 conducteurs/2 smartphones (invitation sécurisée existante), 1 conducteur/1 smartphone (formulaire local non signé). Un conducteur seul peut déclarer deux véhicules. Choix enregistré avec le brouillon ; données A/B, photos et langues conservées lors du changement. Ancien brouillon sans choix compatible. A renseigne les faits communs dans le questionnaire sur appareil commun. Aucun nouveau droit, paiement ni intégration fournisseur.

## 2026-11-01 — Fin de saisie guidée simplifiée
Questionnaire à titres courts et progression de position, réglages repliables, champs/groupes en erreur accessibles. Fin solo ouvre la relecture et le PDF, photos/croquis séparés facultatifs. Sur appareil commun la fin confirme réellement la partie avec prérequis A communs et passe à B ; en session elle doit être enregistrée et confirmée par le serveur avant relecture. Récapitulatif écran compact, données et impression intégrales préservées. Une déclaration explicite à un véhicule exclut B et ses photos attribuées de l’export sans effacer le brouillon. Aperçus incomplets clairement signalés ; signatures et droits existants conservés.

## 2026-11-01 — Photographier les papiers, relecture groupée
Saisie Express étendue à une file locale de cinq pièces maximum, prise de photo ou import JPEG/PNG/WebP/PDF. Type explicite pour chaque pièce, recto/verso séparés, conducteur et preneur distincts. Photos jusqu’à 20 Mio adaptées localement avant envoi (grand côté 2 000 px, maximum 3 Mio) ; PDF 3 Mio. Une pièce égale une analyse existante. Relecture unique avec sources, propositions contradictoires et incertaines non présélectionnées, champs existants protégés. Aucun champ appliqué sans confirmation ; application atomique refuse les corrections concurrentes. Arrêt au premier échec, résultats réussis conservés, reprise explicite sans relecture des succès ; après application partielle, pièces non lues conservées. Pièces brutes/propositions non appliquées en mémoire uniquement, jamais annexées au PDF. Faits de l’accident et signatures personnels, jamais inventés. Accès essai administrateur inchangé, achats Premium toujours fermés. Aucun nouveau droit commercial ni production autorisée pour ce lot.


## 2026-11-01 — Synthèse IA avant croquis
Synthèse textuelle IA séparée avant tout nouveau croquis en session partagée. Déclarations A/B, accords explicites, désaccords et informations manquantes ; aucune déduction de responsabilité. Double consentement distinct puis double validation personnelle, révision exacte et dernière proposition. Correction dans les fiches originales, jamais par écrasement automatique. Texte non ajouté aux PDF signés ; anciens croquis/PDF conservés.


## 2026-11-01 — QR d’accès sur le constat
Les nouveaux PDF remplacent le code-barres de référence par un QR vectoriel cliquable : session partagée protégée si disponible, sinon compte Accordia explicitement distingué du brouillon local. Aucun droit ni invitation transmis.
