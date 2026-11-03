## Vitrine harmonisée — 3 novembre 2026

327 tests réussis ; contrôle CUA des 24 combinaisons langue/largeur, contraste trust 1,11→14,06:1, menu tablette et absence de chevauchement/débordement mesuré. Production auditée : 0 vulnérabilité connue ; réserve Minimatch de développement conservée. Détails, périmètre et limites : docs/VITRINE_HARMONISATION_2026-11-03.md.

## Administration mobile améliorée — 3 novembre 2026

Lot web préparé sans publication : préchargement administrateur, aperçu indicatif, états et comparaison, protection des saisies, confirmations et historique filtrable. API/configuration Flutter et droits serveur conservés. Validation : 326 tests, TypeScript/build et lint ciblé ; recette CUA des fixtures et limites détaillées dans docs/mobile/ADMINISTRATION_WEB_2026-11-03.md.

## Administration mobile — 3 novembre 2026

Rubrique web reprise du lot mobile existant et intégrée, sans déploiement. Contrat API et limites de synchronisation privée, sécurité, critères et contrôles : docs/mobile/ADMINISTRATION_WEB_2026-11-03.md. Logo/son personnalisés et distribution native restent des lots ultérieurs ; aucun droit métier accordé par cette configuration.

## 2026-11-02 — Vitrine enrichie

landing-refresh.test.mjs vérifie les composants réels LandingPaths et Landing dans les quatre langues : comparaison consultative des trois modes, intitulés et prérequis partagés, lien vers vrai formulaire sans mode présélectionné caché, liens Rejoindre/Guide avec langue, conservation des rubriques, ouverture effective du volet démonstration, fermeture du menu après navigation. product-consistency conservé pour catalogue/documentation. Recette visuelle bureau/mobile à reprendre : preview géré ne devient pas sain ; aucune capture récente ni validation responsive revendiquée. Contrôler au minimum 360/375/768/1440 px, les quatre langues, menu/clavier/focus, bascules des trois parcours, démo, FAQ, sections, liens, mouvement réduit et contraste avant publication.

## 2026-11-02 — Profils de véhicule

vehicle-kind.test.mjs : matrice 6×6 des types A/B, schema legacy/enum invalide, plaque remorque manquante et B inactif, page guidée isolée par participant/non sautée par OCR, absence de doublon et compteur des compléments applicables, conservation après changement/import, composant réel FR/EN/DE/NL et PDF rendu réel dans quatre langues. collaboration.test.mjs étendu : type et remorque d’A protégés de B, type de B protégé d’A, persistance réelle D1/R2. Tests de relecture/document-first adaptés à la première page Type de véhicule, navigation précédente et conservation des données vérifiées. PDF_ACCESS garde son contrôle de QR et vise la nouvelle version moteur.
Preview : A camion/attelage puis changement de type sans effacement, B voiture indépendant, DAF proposé ; mobile quatre langues sans débordement. Première page française et annexe PDF fictives rendues en images et inspectées. Deux téléphones physiques/SIWC réel restent à confirmer.

## 2 novembre 2026 — Guide contextualisé et dépannage

Tests guide-context : trois modes et quatre langues, trois étapes rapides, statut Premium fermé, changement de consultation, dépannage QR réservé à deux téléphones, captures adaptées et sans lien de dossier. Test guide-visuals conservé : pause et mouvement réduit. Recette mobile 375 px sur onglet propre : guide rapide, bascule vers deux téléphones, dépannage, captures chargées sans erreur applicative. Captures FR explicitement annoncées, annotations quatre langues.

## 2 novembre 2026 — Guide illustré et animé

Test guide-visuals : sources réelles des instructions FR/EN/DE/NL, trois fiches, trois figures, aucun mouvement au montage, lancement explicite, pause en arrière-plan, respect du mouvement réduit et nettoyage des écouteurs. Aperçu bureau et mobile 375 px : sujets, pause et illustration lisibles, pas de débordement. Illustrations non fonctionnelles et explicitement pédagogiques ; aucune caméra ni API déclenchée.

## 2 novembre 2026 — Documents d’abord

Tests document-first, document-first-ui et document-first-questionnaire : dossier/côté isolés, valeurs vides/modifiées/invalides visibles, faits manuels conservés, données immuables à la navigation, entrée visible, garde ordinaire, instantané uniquement après application et Continuer, réaffichage dans le vrai Questionnaire FR/EN/DE/NL. Recette fournisseur/pièces réelles et appareils physiques non exécutée.

## 2 novembre 2026 — Scanner d’invitation QR

Tests qr-camera, qr-join et qr-scanner-ui : QR réel décodé, origines/fragments contrôlés, arrêt et annulation tardive, erreurs caméra, absence de demande au montage, formulaire réellement rempli sans navigation avant confirmation, quatre langues. Aperçu HTTP : message indisponible et lien invalide refusé ; mobile 375 px sans débordement. Recette restante sur HTTPS avec caméra physique Android/iPhone : permission acceptée/refusée, QR à différentes distances, écran sombre, arrêt et arrière-plan, lien rempli puis connexion B.

## 2 novembre 2026 — Correction de la saisie depuis la relecture

Tests review-entry.test.mjs : quatre langues, cible A/B et lecture seule, aucun changement des données lors de navigation. session-invitation-ui.test.mjs : ouverture du formulaire complet propre et refus de cible étrangère. robust-lifecycle.test.mjs : confirmations appareil commun non ressuscitées. Aperçu bureau : compteur 24→23 après saisie fictive conservée ; iframe 375 px, largeur utile 360, sans débordement, focus du premier champ complémentaire. Recette physique A/B à exécuter selon docs/ORDRE_TRAVAIL_EXPLOITATION_2026-11-02.md, non revendiquée par ces tests.

# Plan de test

## Recette concrète du 23 octobre 2026

Scripts tests/qa/two-driver-broker.mjs et two-driver-client.mjs : deux agents distincts, services réels D1/R2 Miniflare, données fictives, aucun en-tête d'identité injecté. Réussite jusqu'au PDF manuel final avec deux marques TEST ONLY et mêmes octets pour A/B. Documents : gate ordinaire402, propositions préparées manuellement, conflit et sauvegarde des deux côtés ; aucune extraction IA réelle. Script admin-test-account.mjs : compte local actif, activateAdmin réel, droits et refus, singleton409, configuration manquante503, zéro appel extérieur. Tests ciblés : document-extraction/document-worker/product-consistency 10/10 ; ai-settings 8/8. Rapport et preuves docs/recette-deux-agents-20261023/RAPPORT.md. Scripts vérifiés syntaxiquement, diff vérifié ; pas de rebuild de l'application inchangée. Guide vérifié, aucun impact utilisateur. Restent deux vraies connexions, parcours navigateur publié et fournisseur réel.

Lot 1 : typecheck, build, tests validation et dictionnaire ; navigateur parcours situation/véhicules/circonstances/photos/relecture, langue et conservation, erreurs et blocage blessés, brouillons et récupération, croquis et impression. Mobile/desktop et absence de débordement, contraste/focus clavier. Aucune E2E authentifiée : auth absente. Avant production réelle : audit backend, isolation, signature, partenaires, traduction professionnelle, rétention et export PDF complet.

Lot 1.1 : 12 tests Node, dont migration des anciens brouillons, correspondance diagnostics/validité, assuré B manquant, date calendaire impossible, préservation d'éditions pendant sauvegarde. Recette navigateur : ancien brouillon repris, lecture B en allemand/A en français, deux repères Relu, correction -> deux À relire, impression bloquée, dialogue de changement de brouillon et annulation, enregistrement. Viewport mobile via iframe 390px (375 utiles), aucun débordement. Pas de test d'appareil réel ou de résistance à une fermeture forcée.

## Lot 2A
- `node --experimental-strip-types --test tests/model.test.mjs tests/server.test.mjs` : 25 tests, dont isolation propriétaire, suspensions, CAS/concurrence, quotas, échec R2, JSON invalide et limite du flux, origine, absence d'identité, en-têtes non-cache et erreurs sans secret. Adapter SQLite en mémoire et double R2 dans les tests unitaires uniquement.
- `node --experimental-strip-types --test tests/storage-runtime.test.mjs` : vrais moteurs locaux Miniflare D1/R2, migration, document+photo, propriétaire B refusé, révisions et index vérifiés. Aucun réseau assureur ou utilisateur réel.
- `node tests/http-smoke.mjs` : démarre le Worker compilé puis le ferme ; quatre routes privées GET/PUT répondent 401 sans identité et no-store. Aucun en-tête d'identité fabriqué.
- TypeScript, build, migration appliquée seulement à D1 local.
- Navigateur : état anonyme, lien compte, affichage FR/DE, mobile NL à 390px sans overflow. Connexion hébergée/SIWC, sessions réelles et interface cloud authentifiée non testées de bout en bout. PDF final et appareil mobile physique hors périmètre.

## Lot 0.4
- `node --experimental-strip-types --test tests/model.test.mjs tests/server.test.mjs tests/storage-runtime.test.mjs tests/collaboration.test.mjs` : 29 tests. Nouvelle intégration Miniflare : invitation erronée/renouvelée/réutilisée, refus tiers, A ne modifie pas B et inversement, photos préservées, langues indépendantes, CAS et ancienne API verrouillée, consentement et absence de configuration IA, restauration non destructive et suspension du propriétaire.
- `node tests/worker-routes.test.mjs` : 13 assertions 401/no-store sur toutes les méthodes des routes privées du Worker compilé ; modules ESM complets chargés dans Miniflare, aucune identité injectée. Réussite.
- Essai HTTP étendu Wrangler : instabilité timeouts/503 via le serveur local ; ne pas déclarer cette recette réussie. Contrôle direct compilé distingue ce problème du comportement des handlers. Ancien test HTTP conservé.
- TypeScript, build, diff whitespace : réussis. GPS erreur navigateur FR, affichage FR/DE mobile contrôlé, largeur principale 375/375 dans viewport 390 px.
- Restent : essai authentifié hébergé avec deux comptes réels, photos réelles, GPS physique, concurrence UI bout en bout, appel OpenAI réel et propositions ambiguës, validation utilisateur du croquis et export PDF.

## Recette 0.5 — 2026-09-20
- 31 tests Node réussis : modèle, stockage, collaboration et nouveau cycle PDF/signatures D1/R2.
- PDF : refus de préparation par B, refus autre identité/empreinte/consentement, impossibilité pour A de signer B, PDF de relecture inchangé après signature A, finalisation après B, ancien export stable après édition et nouveau document sans signatures héritées.
- Navigateur : module réel isolé, tracé capturé puis effacé. Route QA supprimée avant build. Parcours connecté complet et import navigateur non validés ; PNG importé couvert côté serveur.
- Inspection des trois styles et des quatre pages d’annexes du modèle bleu, sans données réelles.
- TypeScript et build Sites réussis. 18 contrôles accès anonyme/no-store réussis sur le Worker compilé dans Miniflare. `git diff --check` sans erreur.

## Recette 0.6 — 2026-09-21
Commande : `node --experimental-strip-types --test tests/model.test.mjs tests/server.test.mjs tests/storage-runtime.test.mjs tests/collaboration.test.mjs tests/final-document.test.mjs tests/audit-fixes.test.mjs` — 41 tests réussis.
Nouveaux scénarios : suspension B pendant upload déclaratif et signature, isolation des sessions listées, correction des faits communs, attribution des anciennes pièces sans perte, quota avant calcul, verrou concurrent, PNG malformé/tronqué/dimensions excessives, fuseaux UTC/Europe/Amérique et trou DST, diagnostics et doublons de cases, payload IA, budget photos et fusion des imports. Fixtures d’images invalides anciennes remplacées par un vrai PNG pour les tests nominaux, avec tests de refus dédiés.
TypeScript/build réussis ; 19 contrôles anonymes/no-store du Worker compilé. Pages QA temporaires supprimées avant build.
Preview : formulaire/relecture réels isolés, FR/DE, 390 px (surface 375 px sans débordement), cases et coordonnées. Pas d’identité injectée, pas de session connectée simulée. Recette complète deux comptes/appareils et import navigateur à compléter.
PDF FR/EN/DE/NL générés avec lieux/contacts longs ; extraction confirme la fin du lieu dans les annexes. Inspection FR pages 1/2 et DE page 1. Pas d’affirmation de certification, de conformité juridique ou d’E2E hébergé.

## Lot adresse GPS 0.6.1
Ajout geocoding.test.mjs : extraction adresse, données manquantes, compatibilité, fusion concurrente, coordonnées invalides avant fetch ; test session existant étendu au refus de modification de ville par B. Recette réseau réel/CORS et mobile à compléter après autorisation.

## Correction 0.7
44 tests existants passent après nouveau layout, y compris gel et signatures. Contrôle visuel FR des trois styles et extraction première page. Preview : export PDF navigateur bleu réussi, champs complémentaires et 17 cases visibles. Aucun test authentifié revendiqué.

## Mise à jour modèle et invitation
0.8 : 44 tests y compris gel/signatures sur le modèle image ; inspection du PDF rempli bleu. Invitation serveur couverte par tests existants ; nouveau parcours connecté pas testé de bout en bout.

## Listes de saisie
0.8.1 : typecheck et build réussis ; vérification navigateur de sélection, complément libre et changement de langue. Aucun nouveau test unitaire pour ce changement de formulaire.

## Avancement des participants
Nouveau scénario : confirmations A/B indépendantes, conservation après édition de l’autre côté, invalidation sur édition propre/faits communs, retour à ancienne saisie sans réactivation, refus incomplet et tiers. Tests de collaboration mis à jour pour appliquer toutes les migrations. 45 tests passent.

## 0.10
Tests same-device-pdf : estampillage local sans mutation du PDF relu, QR conservant le fragment d’invitation, confirmations indépendantes avec invalidation des faits communs. Régression final-document/collaboration pour droits, invitation et versions serveur. Recette locale isolée avec fixtures et tracés géométriques (aucune signature réelle), routes QA retirées avant build. Vérification mobile dans iframe 390 px ; scan QR physique et parcours authentifié à deux comptes non effectués.

## Corrections 0.11 — 21 septembre 2026
- `pnpm exec tsc --noEmit`, build Sites et `git diff --check` réussis.
- Suite complète : 60 tests, 0 échec, incluant 20 refus anonymes/no-store du Worker construit. Toutes les migrations, dont 0006, testées dans SQLite et D1/R2 Miniflare ; plan d’index du registre vérifié.
- 11 régressions ciblées : poll tardif/révisions ; empreintes et identité locale ; diagnostic tiers/B ; APNG sur photos et signatures ; invalidation/upload/commit et remboursement ; récupération des échecs et quotas historiques ; reprise après récupération d’un upload tardif ; concurrence IA/révision/suspension ; garde consentement/approbation ; choix IA non approuvé ; aperçu WebP sans correspondance non affiché.
- Le test D1/R2 de signature confirme aussi que la récupération du quota préserve l’ancien PDF signé et le nouveau PDF de relecture.
- Navigateur : enregistrement réel du brouillon local, modification puis disparition du statut enregistré ; scénario local fictif A/B avec deux tracés géométriques (pas de signatures réelles), conservation explicite du PDF signé, rechargement et récupération depuis les composants puis Mes brouillons. Changement de constat : historique courant vide, documents précédents séparés et récupérables. Correction d’une confirmation B via son bouton dédié.
- Revue visuelle : formulaire et tutoriel dans iframe 390 px, commandes et navigation lisibles. Inspection raster du PDF bleu sur le modèle fourni : deux véhicules orientés, pas de dessin manuel superposé ; dessin original en annexe.
- Limites : pas de téléphone physique, GPS/QR réel, import de signature par sélecteur natif, lecteur d’écran, zoom 200 %, appel IA réel ou session hébergée à deux comptes. Routes QA retirées avant la construction finale.

## 0.12 — Administration IA
- 7 tests ciblés : activation/expiration/code unique, interdiction aux autres comptes, chiffrement et absence de fuite, remplacement/CAS, désactivation et corruption, suspension au commit, test fournisseur fixe sans données et débit, protection origine et corps borné.
- Routes Worker : GET/PUT/POST configuration et POST activation refusent l’anonyme (401, no-store).
- Preview : /admin non connecté affiche uniquement la connexion ChatGPT. Formulaire réel rendu avec données synthétiques sur une route QA temporaire : champs masqués, test désactivé sans clé, refus serveur à la sauvegarde anonyme, saisie conservée après erreur. Largeurs de panneau 698 et 246 px sans débordement DOM. Route QA supprimée avant build final. Capture visuelle indisponible (timeout), pas de preuve sur appareil mobile réel.
- À valider par le propriétaire : activation SIWC hébergée, vraie clé et modèle compatible, génération après consentements A/B. Aucun appel OpenAI réel pendant la QA.

Résultat de la validation 0.12 : TypeScript et build réussis ; 67 tests, zéro échec, dont 24 contrôles Worker anonymes. Aucun changement de dépendance.

## 0.13 — PDF linguistique
- Tests ciblés : consentement indépendant par conducteur, identité étrangère refusée, révision périmée, PDF traduit préparé par B, payload à six récits sans photos/identifiants ajoutés, conservation exacte du rapport dans la pièce jointe, déduplication, signatures indépendantes par langue, erreurs fournisseur/JSON/texte vide, révocation pendant appel et au commit, plafond de six essais. Réponses fournisseur synthétiques uniquement.
- Tests existants adaptés : B peut préparer la version suivante ; C reste refusé. Anonyme refusé sur GET/POST translation.
- Preview : commandes de préparation visibles pour B, langue initiale DE, passage personnel NL effectivement reporté dans le sélecteur PDF ; traduction indisponible et préparation bloquée sans autorisations. Contrôle DOM à largeur de conteneur 390 px sans débordement (panneaux 342/296 px). Route QA retirée avant build final.
- PDF synthétique ouvert et page de lecture allemande rasterisée : modèle français original puis copie locale, mise en page A/B et circonstances lisibles, renvoi des signatures vers le modèle original. Originaux et traduction extraite de la pièce jointe comparés aux fixtures.
- Limites : fidélité de traduction réelle avec la clé/modèle du propriétaire et parcours authentifié à deux comptes non exécutés ; pas de test sur téléphone physique.

Validation finale 0.13 : TypeScript et build Sites réussis ; 72 tests, zéro échec, incluant 26 contrôles de routes anonymes. Aucune dépendance changée. Publication non effectuée.

## Audit après publication 0.13
TypeScript et 72 tests relancés avec succès. Trois sondes locales dans tests/audit-013-probes.mjs : PDF avant confirmations A/B ; traduction simulée incorrecte acceptée et réutilisée ; 1 500 objets supplémentaires entraînant 1 510 instructions préparées lors de la récupération. Les sondes constatent les défauts, elles ne sont pas des tests du comportement souhaité. Scanner : deux alertes élevées image-size. Aucun appel IA réel ni E2E authentifié à deux comptes. Rapport : AUDIT_COMPLET_0.13_2026-09-21.md.

## Contrôle obligatoire du guide à chaque mise à jour
- Identifier les changements de parcours, commandes, prérequis, droits et résultats.
- Adapter guide, tutoriel et aides concernés en FR/EN/DE/NL dans le même lot.
- Vérifier en Preview la correspondance aux commandes réelles et la lisibilité mobile ; distinguer local, partagé et appareil commun.
- Documenter les sections modifiées et les vérifications ; si aucun impact utilisateur, expliquer pourquoi le contenu reste exact.

## 0.13.1 — Guide actualisé — aperçu, non publié
Guide FR/EN/DE/NL complété : parcours exact du PDF linguistique, langue et trois styles, autorisations A/B par révision distinctes du croquis, portée session connectée uniquement, conduite à tenir devant une traduction incorrecte et limite de régénération actuelle. Aide administrateur repliable : activation privée, clé/modèle, enregistrement et limites du test de connexion. Étape PDF du tutoriel partagé synchronisée. Fichiers : guide-updates.ts, usage-guide.tsx, tutorial.tsx. Aucun changement API, droits, données ou dépendances.
Validation : TypeScript, build Sites et tests model.test.mjs réussis ; git diff --check. Preview : contenu FR/EN/DE/NL et ouverture du volet administrateur vérifiés. Pas de nouveau contrôle mobile physique ni de recette authentifiée ; responsive à vérifier sur téléphone avant diffusion large. Avertissement de build sur certains bundles supérieurs à 500 ko conservé. Publication sur autorisation explicite uniquement.


## 0.14 — Robustesse, premier lot — aperçu non publié
- Préparation finale : confirmations de fin A/B valides exigées côté serveur ; contrôle des marques de confirmation au commit du PDF en plus de la révision et des droits. Bouton bloqué et explication dans les quatre langues.
- Traduction : action explicite pour refaire un appel IA et créer un nouveau PDF, sans changer les déclarations, supprimer les anciens documents ni copier les signatures. Consentements, plafond horaire, verrou, quota de stockage et limite de 20 PDF conservés. Comparaison avec les originaux dans le PDF ; édition manuelle des traductions et comparaison côte à côte dans l’interface restent à développer.
- Guide et tutoriel FR/EN/DE/NL actualisés, sans contenu d’administration.
- Validation : TypeScript et build Sites réussis ; contrôles des routes anonymes relancés sur le Worker final avec succès ; 74 tests réussis dont deux nouveaux scénarios (fin A/B et retrait au commit ; traduction refaite, originaux/ancien PDF conservés et signatures vierges). Fournisseur simulé uniquement dans les tests. Preview du panneau réel avec données synthétiques : préparation et régénération bloquées sans conditions requises, quatre langues, largeur de conteneur 390 px sans débordement. Route QA retirée.
- Sécurité : deux alertes élevées image-size persistent. Registre npm : 2.0.3 publiée le 14 septembre à 15:57:47 UTC, 2.0.4 à 16:38:44 UTC ; délai minimal de sept jours pas encore atteint au contrôle du 21 septembre à 11:46 UTC. Aucune exception au délai ni modification de dépendances. Avis GitHub GHSA-w3rx-r6r6-pgpr et GHSA-5p2g-fcmc-qvqq consultés : divergence entre scanner et avis sur version corrigée à vérifier avant installation.
- Limites : aucun appel IA réel, E2E hébergé à deux comptes ni téléphone physique. Les autres points de l’audit (polling, récupération, capacité des versions, budget global) restent ouverts. Publication sur signal explicite.


## 0.15 — Sessions allégées et récupération par lots — aperçu non publié
- Lecture conditionnelle authentifiée des sessions : jeton opaque incluant révision, présence de B et confirmations. Si inchangé, aucune lecture R2 du rapport ni transfert de photos. Mise à jour des confirmations à révision identique détectée. Autorisations et suspension vérifiées avant réponse conditionnelle.
- Rafraîchissement principal sans chevauchement, suspendu lorsque l’onglet est masqué ; reprise au prochain intervalle visible. Sauvegarde toujours explicite, fusion et protections des réponses tardives conservées. Mesure de taille exacte avec cache des tableaux photos immuables, sans sérialiser les photos à chaque frappe.
- Récupération : recherche SQL des seules références non indexées, 25 objets maximum et 10 opérations expirées par clic. État de reprise conservé par le registre ; compteur de stockage non abaissé tant que l’indexation historique est incomplète. Bouton Continuer et message de limite/minute, aucun faux succès de fin. Versions référencées protégées, pas de purge des constats.
- Guide/tutoriel et messages FR/EN/DE/NL actualisés. Administration exclue du guide.
- Vérification : TypeScript/build Sites et 78 tests réussis, dont lecture sans R2, refus tiers/suspension, changement de confirmation, taille UTF-8, reprise de 60 références en trois lots, nettoyage de 12 opérations en deux lots et préservation d’un autre propriétaire. Cycle PDF signé/récupération vérifié avec D1/R2 réel local. Preview : guide et panneau stockage dans quatre langues, conteneur 390 px sans débordement ; route QA supprimée avant build.
- Limites : pas d’E2E hébergé à deux comptes, d’essai téléphone physique ni de restauration d’infrastructure. Une vraie modification du dossier recharge encore le rapport complet ; médias séparés et budget IA global restent ultérieurs. Les requêtes SQL examinent les références historiques : nombre d’échanges borné, pas une garantie de coût SQL constant. Deux alertes image-size restent ouvertes, dépendances inchangées. Avertissement de taille de bundles inchangé. Lot préparé, production reste 0.14.


## 0.16 — Identification et capacité PDF — aperçu non publié
Noms de téléchargement incluant session, langue, révision, style, identifiant du document et statut signé/relecture. Composants du nom filtrés pour les en-têtes HTTP ; noms distincts après régénération. Compteur de versions sur 20 affiché uniquement après chargement réussi de la liste. Message à capacité atteinte : anciennes versions consultables/signables si valables, aucune suppression automatique. Guide FR/EN/DE/NL actualisé.
Validation : TypeScript et build réussis ; trois tests ciblés (nom sûr/distinct et cycle PDF/signatures D1/R2), contrôles Worker anonymes réussis. Preview : explications du guide présentes en quatre langues. Pas de recette authentifiée du compteur ni de contrôle mobile physique dans ce lot. Pas de changement de droits, quota ni suppression. Gestion d’archivage ou augmentation de capacité non implémentée.


## 0.17 — Plafond IA global — aperçu non publié
- Plafond de 100 réservations d’appels de génération par jour UTC pour l’ensemble de la plateforme, croquis et traductions cumulés. Limite fixe serveur, non modifiable par un conducteur. Les plafonds par session restent applicables. Ce compteur borne les appels, pas un montant garanti en euros.
- Réservation atomique D1 avant fetch fournisseur, avec garde d’appartenance et compte actif. Compteurs agrégés par jour/type sans texte, clé ni identité ; échecs conservés dans le compteur. Migration additive 0009, aucune modification des versions historiques ni des signatures.
- Message spécifique de plafond atteint en FR/EN/DE/NL : reprise après 00:00 UTC ou utilisation du croquis manuel/PDF sans traduction. Guide et étape PDF du tutoriel actualisés, sans instructions d’administration.
- Validation : TypeScript/build réussis ; 82 tests, zéro échec. Vrai D1 local : 120 demandes concurrentes réparties sur deux sessions et deux types, exactement 100 acceptées. Compteur d’un ancien jour sans effet sur le jour courant. Tests croquis/traduction : aucun appel fournisseur à plafond atteint ; verrou croquis libéré. Contrôles Worker anonymes inclus. Preview : explications présentes dans les quatre langues.
- Limites : aucun appel IA réel ni recette authentifiée sur téléphone. Pas de conversion en euros, suivi de tokens facturés, tableau de consommation ou plafond éditable dans l’interface. Les réservations couvrent uniquement les générations de cette application, pas les autres usages éventuels de la clé. Deux alertes image-size restent ouvertes. Publication et migration de production non effectuées ; site live toujours 0.14.


Publication des lots 0.15–0.17 confirmée ; scénarios manuels détaillés dans RECETTE_PUBLICATION.md, non exécutés. Scanner après publication : 2 alertes élevées, 0 critique.

## 0.18 — Décisions produit appliquées en aperçu, non publiées
- Pays : Belgique/France/Allemagne au lancement ; Espagne/Pays-Bas prévus, saisie ES et fuseau Madrid ajoutés sans retirer NL/Autre. Modèle européen fourni conservé.
- Refus de signature : panneau disponible dans les trois parcours, confirmation explicite, acteur A/B, motif facultatif, PDF unilatéral non signé avec annotation visible et annexe. Aucune signature reprise ; aucun accord présumé ; originaux inchangés. PDF téléchargé, pas d’envoi assureur.
- Offres : quatre préférences (gratuit, dossier, particulier, flotte), enregistrées dans le compte par une API protégée. Aucun abonnement/paiement/droit activé ; tarifs à définir.
- Rétention : deux mois calendaires dès première sauvegarde serveur, blocage après expiration, dates visibles, nettoyage IndexedDB à la réouverture. Migration 0010 additive avec reprise des dates existantes ; aucun dossier réel supprimé pendant le développement. Moteur de purge serveur borné/reprenable et route super-admin prêts, MAIS ordonnanceur automatique non raccordé. Les sauvegardes hébergeur et orphelins historiques non attribuables ne sont pas couverts : ne pas annoncer une garantie de suppression physique automatique complète.
- Guide et tutoriel actualisés en FR/EN/DE/NL (refus, pays, modèle, délai selon contrat, préférence, rétention), sans instructions administrateur.
- Vérification : TypeScript et build final réussis ; 87 tests, zéro échec, incluant 29 refus de routes anonymes/no-store. Tests réels locaux D1/R2 : échéance non repoussée, rejet lecture/écriture/session expirées, purge après panne R2 et reprise idempotente, isolation propriétaire, budget rendu, choix d’offre sans rôle client. Migration de dossier ancien vérifiée sur fin février. Contrôle navigateur : PDF unilatéral généré, bouton bloqué sans confirmation, copies fictives expirées supprimées et copie active conservée ; guide/offres/refus FR/EN/DE/NL dans conteneur 390 px, aucun débordement mesuré. Route QA temporaire retirée avant build final.
- Limites : pas de recette authentifiée hébergée, appel IA réel, paiement, téléphone physique ou publication. Sélecteur d’offre connecté testé via service D1, affichage anonyme vérifié bloqué ; pas d’E2E connecté. Avertissement de bundles >500 ko conservé ; dépendances inchangées, les alertes image-size antérieures n’ont pas été réévaluées dans ce lot.
- Prochaine étape : raccorder et éprouver la planification de purge et son suivi avant d’annoncer la conservation maximale, définir tarifs/quotas et paiement ; publication seulement au signal du propriétaire. Test réel toujours en attente de son signal.

## 0.19 — Nettoyage sur activité validé, publication demandée
Nettoyage borné déclenché par une activité authentifiée : verrou atomique de cinq minutes, reprise des suppressions en attente après panne, suivi réservé au super-administrateur. Index des échéances et migrations additives 0011/0012. Guide et tutoriel actualisés en FR/EN/DE/NL. Une panne de maintenance ne bloque pas le parcours conducteur.
Validation : 91 tests réussis, zéro échec, dont 30 contrôles de routes anonymes ; TypeScript et build final réussis. D1/R2 locaux : concurrence, reprise après panne, verrou actif/expiré et protection contre un ancien travailleur. Aperçu 390 px sans débordement dans les quatre langues ; route QA retirée avant build final.
Limites : déclenchement sur activité, sans planificateur indépendant ; sauvegardes et objets historiques non attribuables exclus. Aucun test réel à deux comptes, appel IA réel, envoi assureur ou purge manuelle de production. Tarifs et paiements non activés. Les mentions antérieures de non-publication sont historiques.

## 0.20 — Tarification et explications prêtes en Preview, non publiées
Page Tarifs et services inclus en FR/EN/DE/NL : six cartes avec prix et quotas décidés, distinction Essentiel/Premium, Pourquoi payer, FAQ, annualisation et suppléments. Liens depuis Mon compte, le choix d’offre, le guide et la dernière étape du tutoriel. Explications : paiement unique A/B prévu, 10 générations IA réussies, erreurs techniques non débitées prévues, taxes, consentements, conservation de deux mois et absence de garantie assureur.
Le paiement reste indisponible et clairement annoncé. Aucun quota commercial appliqué, privilège accordé, API modifiée ni accès existant retiré. Préférence serveur existante conservée, sans distinction Start/Pro persistée. Organisations, facturation et crédits réels restent à raccorder ; aucune simulation de transaction.
Validation : TypeScript et build réussis ; 91 tests, zéro échec après correction d’un import Node ; contrôles Worker anonymes relancés avec succès après build final. Preview : page tarifaire et titres quatre langues ; cadres de 320 px (305 px utiles avec scrollbar), aucun débordement mesuré ; inspection visuelle NL, FAQ annuelle FR et navigation compte non connecté vérifiées. Guide/tutoriel rendus en aperçu ; parcours complet de la dernière étape non validé, contrôle interrompu par timeout. Routes QA retirées avant build final. Aperçu final FR confirmé après redémarrage du serveur.
Limites : pas de paiement réel, d’E2E authentifié, de test A/B tarifaire, de téléphone physique ou de publication. Avertissement de bundles supérieurs à 500 ko inchangé ; dépendances inchangées. Test réel et publication au signal du propriétaire.

## 0.21 — Stabilisation du choix d’offre
Chargement et enregistrement bornés à 15 secondes, y compris la lecture de la réponse. Annulation du chargement à la sortie, bouton de reprise après échec de chargement et vérification de la préférence renvoyée avant confirmation de sauvegarde. Une réponse perdue ne signifie pas que le serveur n’a rien enregistré : message de confirmation manquante et reprise manuelle, sans relance automatique. Aucun paiement ni droit commercial activé.
Aide contextuelle, guide et dernière étape du tutoriel actualisés en FR/EN/DE/NL pour les trois parcours. TypeScript, build et 95 tests réussis, dont quatre nouveaux scénarios réseau (confirmation, réponse invalide/refus, corps bloqué puis reprise, annulation). Aucun test réel, appel fournisseur ni modification de production. Revue visuelle mobile et parcours authentifié non réalisés pour ce lot : jalon de validation Preview encore ouvert, progression prudente 50 %. Tarification 0.20 reste à 75 %.

À vérifier en aperçu connecté : coupure réseau lors du chargement, bouton de reprise, conservation de la sélection après échec PUT, quatre langues et largeur 320 px. Test à deux appareils uniquement au signal du propriétaire.

## Publication 0.20–0.21 et poursuite de validation — 21 septembre 2026
Publication Sites 23 réussie à 15:19:05 UTC, source f676bede17713366d461b3ea79ce3edd21cdb0f0, déploiement appgdep_6ab14acd7dc0819198a3155edecad488. URL : https://accordia-constat.adil-btp.chatgpt.site. Audience custom conservée. Build et 95 tests précédents réutilisés sur source applicative inchangée.
Poursuite : composants réels rendus en aperçu dans quatre panneaux de 320 px, inspection visuelle FR/EN/DE/NL sans texte ni bouton coupé ; messages d’erreur et commandes conformes à l’aide. Clic de reprise FR observé : retour au chargement, puis erreur attendue en accès anonyme. Les quatre tests réseau et le test Worker couvrant 30 routes anonymes relancés avec succès. Route temporaire retirée, aucun ajout de code applicatif ni de dépendance dans ce tour. Mesure automatisée de largeur interrompue par timeout du navigateur ; la conclusion responsive repose sur l’inspection visuelle, pas une mesure DOM. Guide/tutoriel : textes inchangés depuis 0.21 ; dernière étape animée non rééprouvée.
Tarification 0.20 et correctif borné 0.21 : 100 % des jalons de livraison avec ces limites documentées. Cela ne vaut pas validation authentifiée ni préparation commerciale complète. Paiements, abonnements, flotte, ordonnanceur indépendant et restauration restent non réalisés. Recette réelle A/B toujours à 0 %, au signal du propriétaire. Prochaine étape commerciale : raccorder le compte marchand et valider les droits/notifications serveur en environnement de test avant vente.


## 0.22A — Catalogue de paiement test
Quatre tests ciblés : injection de montant/rôle/prix, exactitude des centimes, rejet prix réels/inactifs/devise/taxe/quantité incohérentes, rejet périodes annuelles incorrectes et usage mesuré. TypeScript réussi. Les tests utilisent des objets de test locaux, aucune requête Stripe. Pas de session Checkout ni webhook réellement validé. Pas de nouvelle assertion de conformité fiscale. Build réussi, routes inchangées.

## 0.22B — Catalogue Stripe de test créé et vérifié
Le propriétaire a confirmé SMARTDEV en mode test. Huit tarifs Accordia et leurs produits ont été créés, après inventaire complet sans prix Accordia existant. Aucun objet des autres projets modifié. Identifiants réels enregistrés dans server/billing-test-prices.json (aucun secret). Relecture Stripe puis validation des huit réponses par validateTestPrice : montants, EUR, mode test, périodicités et traitement TTC/HT conformes. Les quatre tests ciblés passent à nouveau. Code applicatif et rendu inchangés : build/TypeScript réussis de 0.22A réutilisés, aucun nouveau contrôle visuel revendiqué.
Aucun paiement, client, abonnement, Checkout ou webhook créé ; aucun encaissement ni publication. Les tarifs flotte existent uniquement pour préparer les tests et ne rendent pas les fonctions flotte disponibles. Le comportement fiscal d’un prix ne configure pas à lui seul la collecte des taxes.
Sous-lot catalogue distant : réalisé et vérifié (100 % de cette opération de configuration). Lot paiement complet : reste à 25 % selon les jalons ; Checkout, configuration secrète serveur, commandes, notifications signées/idempotentes et droits restent à réaliser. Guide vérifié, aucun impact utilisateur : interface et achats fermés inchangés.

## 0.22C — Adaptateur Stripe test
Neuf tests ciblés catalogue/adaptateur : sélection stricte, tarifs, clé restreinte test, paramètres Checkout et idempotence, mauvais compte, signature valide/altérée/ancienne/absente, mauvaise devise/montant/commande/mode, traitement différé impayé. Fixtures locales explicites : aucun E2E Stripe ou paiement réel revendiqué.
Validation : TypeScript et build final réussis ; 103 tests réussis au premier passage, contrôle Worker relancé après la fin du build et réussi (30 routes anonymes). Le premier lancement Worker avait échoué parce que le build concurrent avait temporairement retiré dist/server/index.js ; aucun échec restant après reprise ciblée. Neuf tests catalogue/adaptateur inclus. Avertissement de bundles >500 ko inchangé.

## 0.22D — Commandes de test
Trois nouveaux tests sur vrai D1 local et toutes migrations : 16 créations simultanées = une commande, isolation propriétaire, saisie stricte, suspension, expiration et session immuable ; 20 confirmations simultanées = un reçu, événements équivalents dédupliqués, collision intercommandes refusée, reçu conservé après suppression du dossier sans empêcher celle-ci. Aucun fournisseur réel appelé.
Validation finale : TypeScript, build et 107 tests réussis, zéro échec.

## 0.22E — Flux de paiement test
Six nouveaux scénarios sur D1 local : session réutilisée/retour navigateur sans droits, réponse fournisseur perdue et clé stable, 20 confirmations concurrentes donnent un seul lot de dix crédits, solde réduit conservé, panne entre reçu/attribution puis reprise, paiement tardif sans réouverture, signature invalide sans écriture et commande incertaine ancienne bloquée. Suspension, propriétaire tiers et expiration contrôlés. Aucun E2E fournisseur réel revendiqué.
Validation finale : TypeScript, build et 113 tests réussis, zéro échec. Migration 0014 générée et inspectée (une table additive). Avertissement de bundles >500 ko inchangé.

## 0.22F — Routes de test
Cinq tests billing-http (configuration fermée, corps exact Unicode, tailles bornées, formats/signature absente, timeout et annulation). Test du Worker compilé avec D1 : restrictions admin/origine/propriétaire et vrai HMAC local + réception idempotente. Suite anonyme enrichie : Checkout 401 et webhook désactivé 503/no-store. Aucun service tiers appelé.
Validation finale : TypeScript et build réussis ; 119 tests réussis, zéro échec, après build. Avertissement de bundles >500 ko inchangé.

## 0.22G — Crédits de test
Cinq scénarios D1 locaux : trente demandes concurrentes pour dix crédits (croquis et traduction cumulés), douze appels identiques exécutent une seule fonction, échec libéré une fois, refus interpropriétaire/type, succès non remboursable, panne de règlement après succès conserve le crédit réservé, suspension/expiration interdisent les nouvelles réservations mais autorisent le règlement interne. Fonctions IA de test synthétiques, aucun appel fournisseur.
Validation finale : TypeScript, build et 124 tests réussis, zéro échec, suite lancée après le build. Migration 0015 générée et inspectée, ajout d’une table et d’un index sans destruction. Avertissement de bundles >500 ko inchangé.

## 0.22H — Croquis facturable de test
Huit scénarios D1/R2 locaux, fournisseur synthétique strictement dans les tests : résultat stocké/débit unique et répétition ; refus B, injection, consentement absent et solde épuisé sans appel ; échecs fournisseur/R2 remboursés ; consentement retiré au commit ; réponse D1 perdue après commit ; échec de libération du verrou après succès ; réservation libérée avant commit ; panne du débit entraînant rollback de la proposition. Worker compilé : refus anonyme, non-admin, origine externe, saisie invalide et session inexistante. Pas d'appel distant ni de validation hébergée authentifiée.
Validation finale H : TypeScript, build et 132 tests réussis, zéro échec.

## 0.22I — PDF traduit avec crédits test
Six scénarios D1/R2 locaux et fournisseur synthétique : génération/débit puis cache à zéro crédit ; régénération avec ancien PDF conservé, signatures vierges et rejet répétition ; propriétaire/saisie/révision/consentement ; erreur fournisseur et retrait de consentement avant commit ; réponse de commit perdue avec reprise gratuite ; échec SQL du débit annulant la référence PDF. Worker compilé : anonyme, non-admin, origine, corps et session absente. Aucune recette fournisseur réelle ni navigateur connecté.
Validation finale I : TypeScript, build Sites et 138 tests réussis ; zéro échec.

## Démarrage A/B — 2026-10-23
`tests/participant-start.test.mjs` : créateur B/invité A ; invitation renouvelée ; listes et propriété ; impossibilité de modifier rôle, fiche ou langue distante ; droits photo ; CAS ; consentement sur le bon côté ; prérequis IA et réservation durable par révision, succès, échec et relance manuelle. Réponses OpenAI synthétiques uniquement. Suite 143 tests validée (test Worker exécuté après build). Vérifications HTTP privées : 33 refus anonymes.
Recette restante : deux comptes autorisés, QR scanné sur le second appareil, langues distinctes et PDF de chacune, saisies concurrentes, photos du responsable, consentements et qualité d'un croquis réel. Prévisualisation démarrée, navigateur bloqué par politique ; aucune recette mobile revendiquée.

## Audit du 23 octobre 2026
148 tests réussis sur le code final, zéro échec. TypeScript, build Sites, diff et 33 contrôles HTTP anonymes réussis. `audit-20261023.test.mjs` couvre l’ordre des écritures et reprise après échec ainsi que les flux fournisseur trop grands. `translation-worker.test.mjs` exerce une préparation PDF traduite dans workerd et rejette une redirection sans la suivre. `participant-start.test.mjs` ajoute les courses à la création et au renouvellement. Aucun OpenAI réel. La prévisualisation démarre, mais navigateur bloqué : contrôles UI/mobile et autosave dans navigateur réel restent à faire.

## Simplification de la saisie — 23 octobre 2026, non publiée
Référence : Sites 36 publiée, commit 2aca6bb ; point de restauration before-ux-simplification-20261023. Revue globale documentée dans docs/SIMPLIFICATION_2026-10-23.md. Lot appliqué : cinq rubriques repliables pour les 24 champs complémentaires dans les trois parcours, une liste ou une saisie libre au lieu des deux contrôles simultanés, consigne par étape, réglages de démarrage et partage repliables. Toutes les valeurs et validations conservées ; aucun changement serveur ni migration. Guide et tutoriel FR/EN/DE/NL actualisés.
Validation : TypeScript, build Sites, git diff --check et 150 tests réussis, zéro échec, dont contrôles des routes privées compilées. Tests supplémentaires : chaque champ historique présent une seule fois dans les rubriques ; chaque langue couvre les rubriques et cinq étapes. Règles CSS responsive et focus relues ; navigateur Preview bloqué antérieurement par politique, pas de recette visuelle ni d'interaction mobile revendiquée. État des panneaux et sélecteurs à vérifier dans le navigateur.
Limites : PDF et compte évalués mais non réorganisés, pas d'autosauvegarde réseau ni OCR ajouté. Le site complet n'est pas déclaré simplifié et validé de bout en bout. Prochaine étape : recette mobile, puis publication sur autorisation explicite et lots PDF/compte distincts.

## Validation du lot parcours
TypeScript, build Sites et diff réussis ; 150 tests réussis sur la version finale, zéro échec, y compris les contrôles Worker compilés. Les tests métier existants couvrent les droits A/B, invitations, révisions, consentements, PDF et sauvegardes. Aucun test navigateur de la nouvelle présentation n’a été exécuté ; recette visuelle et deux comptes réels restent nécessaires.

## Saisie express par documents — 2026-10-23
Import JPEG/PNG/WebP/PDF par conducteur, extraction IA et sélection des champs avant application. Les modifications intervenues pendant la relecture sont protégées contre l'écrasement. Consentement explicite, documents non archivés par Accordia, aucune reconnaissance faciale. Limites : 3 Mio, images 4 Mpx, 5 tentatives/heure/compte et plafond IA global partagé de 100 appels/jour. Les échecs peuvent consommer une tentative.
Positionnement Premium affiché sur accueil, tarifs et formulaire en FR/EN/DE/NL. Achats toujours fermés : serveur refuse les comptes ordinaires (402), essai réel réservé au superadministrateur existant. Aucun droit payant ni paiement simulé. Avant ouverture commerciale : paiements réels, droits Premium vérifiés et tarif final.
Tests synthétiques uniquement ; extraction avec documents réels et compatibilité du modèle configuré restent à vérifier. Aperçu navigateur indisponible dans cette session.

## Audit transversal et synchronisation — 23 octobre 2026
Rapport : docs/AUDIT_SYNCHRONISATION_2026-10-23.md. Référence Sites 42 ; restauration before-sync-audit-20261023.
Offres vitrine dérivées de pricingCopy ; montants principaux partagés avec validation serveur via features/product/catalog.ts. Couverture documentaire commune dans formulaire, tarifs, compte/offres, vitrine, guide et tutoriel. Ajout des types remorque et identité du preneur avec champs distincts. États réseau/chargement/annulation/délai IA corrigés, libellés vitrine localisés, consentements clarifiés, règle permanente de synchronisation dans AGENTS.md.
Aucun droit commercial accordé, aucun achat ouvert, aucune donnée privée publiée. Validation : TypeScript, build Sites, 160 tests de la suite complète et un contrôle supplémentaire des pages compilées réussis (161 au total), zéro échec. Sept pages/rendus HTTP contrôlés : accueil, constat, compte, tarifs FR/EN/DE/NL. Recette visuelle et vraie lecture fournisseur non réalisées. L'audit n'est pas une certification exhaustive.

## 2026-10-23 — Questionnaire chronologique gratuit
Option disponible dans les trois parcours, sur les données Report existantes : sécurité, date/heure, lieu GPS, dommages communs, fiches conducteur/preneur/véhicule/assurance, compléments par groupes de trois champs maximum, circonstances et témoins. Photos/croquis/relecture/signatures conservent leurs écrans. Choix 1/2 véhicules sans suppression des données du second ; conducteur partagé limité à sa fiche, faits communs réservés à A. Passage questionnaire/formulaire complet sans effacement ; compteur de position, pas de complétude. Validation finale et sauvegarde réseau explicite inchangées. Import documentaire Premium disponible dans la fiche ; aucune nouvelle requête fournisseur ni paiement.
Vitrine : carte avec illustration SVG animée existante, pause et réduction des mouvements héritées. Description centrale QuestionnaireInfo/questionnaire-copy en FR/EN/DE/NL réutilisée dans vitrine, tarifs, compte, guide et tutoriel. Consigne permanente étendue dans AGENTS.md pour les futurs champs.
Validation : TypeScript, compilation Sites, diff et 166 tests de la suite complète réussis, aucun échec. Tests dédiés : couverture des champs de base/compléments, ordre et identifiants stables, périmètre A/B, absence de mutation, parité des traductions. Ajustement final de présentation : panneaux de réglages repliés en mode guidé ; nouvelle compilation. Aucun test navigateur/mobile ni essai multi-compte réel ; blocage Preview antérieur non contourné. Synchronisation GitHub non effectuée, authentification Git locale indisponible. Version préparée sans publication, autorisation de production non demandée dans ce lot.

## 2026-10-23 — Audit version 45 et correctifs
Rapport docs/AUDIT_APPROFONDI_2026-10-23.md. Contrôles de rubrique du questionnaire (sécurité, date, lieu, identités/assurance, courriel, circonstances) avec champs facultatifs préservés ; reprise du curseur par onglet/dossier/conducteur, sans nouveau stockage de données personnelles ; tutoriel autosauvegarde corrigé FR/EN/DE/NL. Informations partagées actualisées dans toutes les surfaces via QuestionnaireInfo.
Sécurité dépendances : Next.js 16.4.1, overrides fast-uri 3.1.8 et source-map-js 1.2.2 ; audit production final zéro alerte (14 auparavant). Aucune exception à la politique d'ancienneté, aucune migration, aucun changement de droit ou paiement. Sauvegardes locales toujours liées au navigateur/appareil.
Version préparée sans publication ; recette navigateur/mobile, deux comptes réels, fournisseurs et synchronisation GitHub restent ouverts. Restauration identifiable : before-audit-questionnaire-20261023.

Validation finale après toutes les mises à jour : TypeScript, build Sites, git diff --check et 168 tests réussis, zéro échec. Audit pnpm de production : zéro alerte. Le premier contrôle de typage a détecté une erreur JSX pendant l’implémentation ; corrigée avant ces validations finales.

## 2026-10-23 — Choix du mode de saisie
Deux cartes après rôle/langue dans le formulaire principal : saisie guidée gratuite par défaut, saisie express Premium. Lien secondaire vers le formulaire complet. Composant commun EntryMode dans session partagée et appareil commun ; Express cible uniquement le conducteur choisi. Accès vérifié via API existante, interface fermée par défaut, chargement/erreur/réessai explicites ; serveur Premium et autorisations inchangés.
Administrateur : import réel dans une fenêtre dédiée, relecture/application des propositions, puis retour au questionnaire du même constat. Comptes ordinaires : Bientôt disponible, aucun achat simulé. Réponses appliquées préservées ; fermeture abandonne analyse/propositions non appliquées, mention explicite. Description commune FR/EN/DE/NL ajoutée à QuestionnaireInfo, donc vitrine/tarifs/compte/guide/tutoriel synchronisés.
Fichiers : entry-mode (composant, modèle, traductions), workspace/session-client/same-device, document-import, questionnaire-info, styles, tests. Aucun schéma, migration ni changement de quota. Version préparée non publiée ; recette navigateur/mobile et extraction fournisseur réelle non effectuées. Synchronisation GitHub non rétablie.

Validation finale du choix de saisie : TypeScript, build Sites, git diff --check et 171 tests réussis, zéro échec. Tests ajoutés sur accès Express fermé par défaut, application isolée à la fiche choisie et parité des quatre langues.

## 2026-10-23 — Présentation et parcours simplifiés
Rapport docs/EXPERIENCE_2026-10-23.md. Accueil Commencer/Rejoindre, trois étapes, modes guidé/Express, exemple A/B, confiance/FAQ, détails secondaires repliés sans supprimer de fonction ; animations conservées avec pause accessible. Nouvelle page /join contrôlant les invitations locales, langue conservée, autorisations serveur inchangées.
Rôle/langue visibles, réglages photos/IA repliables avant création ; questionnaire conditionnel (19 rubriques sans compléments pour deux véhicules), préférences d'affichage sans destruction de réponses ; cinq phases, liens de correction/relecture et statuts local/session clarifiés. Explications communes FR/EN/DE/NL diffusées dans vitrine/tarifs/compte/guide/tutoriel. Styles écran uniquement, impression conservée.
Pas de migration, de suppression, de fournisseur simulé ni d'achat activé. Préparé sans publication. Contrôles visuels/mobile, vrais comptes/QR et synchronisation GitHub encore ouverts.

Validation : TypeScript, compilation Sites et revue du diff réussis ; suite complète de 175 tests réussie, zéro échec. Après l’ajout du repère visuel Document dans le panneau partagé : typage/build et tests ciblés du rendu des huit pages et de l’expérience relancés. Aucune recette navigateur/mobile ou fournisseur réel revendiquée.

## 2026-10-23 — Listes des marques, assureurs et dégâts
142 marques proposées, anciennes 18 conservées ; 17 suggestions d'assureurs. Questionnaire raccordé à la même source que les fiches complètes. Dégâts apparents : 20 suggestions localisées ajoutables au texte, plusieurs choix, sans effacement ni présélection ; protection doublons/4000 caractères. Toutes les valeurs restent libres et les données importées ou anciennes sont conservées.
Audit des autres champs dans docs/AUDIT_LISTES_2026-10-23.md : listes existantes pays/permis/point de choc/couverture maintenues ; identité, numéros, adresses et récits restent libres. Vitrine/compte/tarifs/guide/tutoriel actualisés via QuestionnaireInfo en FR/EN/DE/NL. Aucun changement serveur ni migration. Version préparée non publiée ; vérification visuelle/mobile et GitHub encore ouverts.

Validation : TypeScript, build Sites, git diff --check et 177 tests réussis, zéro échec. Tests ajoutés : anciennes marques conservées, valeurs libres acceptées, mêmes listes dans quatre langues, texte de dégâts conservé, ajouts multiples, doublons et taille limite.

## 2026-10-23 — Publication 49 et audit transversal
Version 49 publiée ; audit docs/AUDIT_COMPLET_V49_2026-10-23.md. Compléments du questionnaire raccordés aux listes pays/permis/point de choc/couverture et bonne langue ; langue déclarée de Rejoindre actualisée pour les lecteurs d'écran.
Dépendances : Vite 8.1.6, image-size 2.0.3, Undici 7.29.1, sharp 0.35.5, brace-expansion 1.1.21/5.0.12. Scan production : 0 alerte ; scan complet : 25 → 1, braces sans version corrigée disponible. Aucun contournement de la politique de dépendances.
Revue accès/permissions, partage, données, IA, PDF, paiements et listes ; logs production sur trois heures : aucun événement d'erreur retourné. Les limites navigateur/mobile, deux comptes, fournisseur réel, achats fermés et GitHub restent explicites dans le rapport. Guide/tutoriel vérifiés : les commandes existantes et explications centralisées restent exactes ; pas de nouveau parcours ni de promesse ajoutée. Publication des correctifs autorisée dans ce tour.

Validation finale de l’état publié : TypeScript, build Sites, git diff --check et 177 tests réussis, zéro échec. Tests incluent rendus des huit pages et refus anonymes des routes privées. Scans de dépendances séparés production/développement conservés dans les conclusions.

## Régressions de l’audit à trois agents — 23 octobre 2026

`node --experimental-strip-types --test tests/three-agent-services.test.mjs tests/three-agent-pdf.test.mjs tests/three-agent-evidence.test.mjs` : sept tests, dont parcours complet via véritables fins A/B sans préparation SQL des confirmations, six écritures/minute, signatures persistées et reprise après panne R2 soumise au quota, expiration à l’UPDATE de l’invitation, concurrence synchronisée des INSERT, positions PDF réelles et mots intacts dans quatre langues, retours asynchrones du vrai gestionnaire Evidence après cinq scénarios. Fixtures fictives et fournisseurs contrôlés uniquement dans les tests.
Suite finale après build : `node --experimental-strip-types --test tests/*.test.mjs` → 184 réussites, zéro échec. Cinq contrôles fonctionnels échouent sur la référence précédente. Preview : choix initial B/DE respecté, changements A/B et FR/EN/DE/NL, un seul choix de saisie après plusieurs transitions guidé/complet. Pages 5/6 des PDF fictifs FR/EN/DE/NL inspectées. TypeScript, build, diff et audit de production réussis.
Non couverts par une recette réelle : deux comptes hébergés, téléphones physiques, import lent sur mobile, fournisseur IA, paiements, GPS/caméra et signature personnelle dans l’interface. Pas de contournement des restrictions blob. Voir docs/CORRECTIFS_AUDIT_TROIS_AGENTS_2026-10-23.md.

## Harmonisation des offres et pages — 23 octobre 2026

Deux tests product-presentation : montants des préférences conformes au catalogue serveur, identifiants autorisés inchangés, un seul choix flotte générique et absence de droit/paiement produit côté présentation ; quatre langues strictes et parité du guide commun. Worker product-pages enrichi : six cartes Tarifs, ordre particuliers/flottes/services, trois cartes identiques sur accueil/compte public, routes et liens localisés FR/EN/DE/NL.
Contrôles finaux : TypeScript et build Sites, puis `node --experimental-strip-types --test tests/*.test.mjs` → 186 tests réussis, zéro échec ; diff vérifié. Preview navigateur : pages Tarifs dans quatre langues, compte non connecté, accueil NL, Rejoindre NL→DE avec texte saisi conservé ; largeur réelle de Tarifs DE sans débordement sur ordinateur. Responsive relu sans test physique mobile. Aucun test authentifié dans le navigateur, fournisseur, paiement, GPS/caméra ou transmission assureur. Rapport docs/HARMONISATION_TARIFS_2026-10-23.md.

## 2026-11-01 — Sécurité et modes
Tests onboarding : bascule solo avec deux véhicules sans mutation/perte de B, langues/photos/rôle conservés, persistance par schéma, anciens brouillons et mode inconnu, questionnaire commun de A et périmètre B, parité FR/EN/DE/NL. Suite métier existante pour droits A/B, signatures, invitations et révisions. Recette UI à exécuter : consignes initiales/112/confirmation ; trois radios au clavier, bouton désactivé sans choix ; chaque routage, retour/changement sans perte ; réaffichage consignes sans perte des saisies/PDF ; rechargement/reprise et nouveau dossier ; quatre langues, largeur 375 px, focus et débordements ; connexion et QR avec deux comptes. Prévisualisation gérée : lancement tenté, arrêt pour délai de disponibilité, aucune URL exploitable retournée ; aucune recette navigateur/mobile revendiquée.

Contrôle de fiabilité du test de quota : le scénario fixe désormais la fenêtre courante en même temps que les six écritures, au lieu de dépendre d’une fenêtre ancienne susceptible d’expirer pendant le test. Logique serveur inchangée. Reprise du brouillon appareil commun raccordée directement au même parcours. Une exécution de tests compilés a croisé une recompilation (dist temporairement absent) : ces résultats ne sont pas utilisés comme validation ; suite finale relancée après fin du build.

Validation finale du lot : TypeScript, build Sites, git diff --check et suite complète APRÈS build — 191 tests réussis, zéro échec. Ce résultat remplace les essais intermédiaires ci-dessus. Cinq scénarios onboarding inclus ; routes privées compilées et règles A/B exercées par la suite existante. Prévisualisation gérée toujours indisponible : rendu navigateur, mobile, clavier réel et deux comptes non validés. Sources destinées à la branche GitHub feat/safety-device-modes-20261101 avec rattrapage des sources Sites récentes ; main et production conservés. Lot sauvegardé sans déploiement ; recette Preview reste nécessaire.

## 2026-11-01 — Audit complet et durcissement
Six tests onboarding : les cinq scénarios initiaux plus refus de 20 000 éléments en photos/tracés avec un diagnostic borné, sans affirmation de mesure mémoire absolue. Suite complète après compilation : 192 réussites. Zod 4, droits A/B, PDF/signatures, extraction et routes privées inclus dans les suites. Installation figée et scans de dépendances production/complet exécutés.
Recette Preview : sécurité et conservation du lieu ; saisie B et retour solo sans modification d’A ; trois modes et connexion requise ; FR/EN/DE/NL ; viewport réel de 375 px via iframe temporaire (retirée), absence de défilement horizontal, radios Espace/flèche et poursuite. Premier feuillet PDF fictif FR rendu et inspecté ; FR/DE générés. Console : erreurs d’extension Chrome isolées, pas d’erreur applicative observée. Lint comparé à la référence : 46 erreurs et 61 avertissements, pas de diagnostic nouveau. Restent téléphones physiques/deux comptes, fournisseur, GPS/caméra et paiement réels. Aucun déploiement.

## 2026-11-01 — Recette de saisie rapide
200 tests réussis après build, dont matrice questionnaire 4 langues × 1/2 véhicules, contrôles A/B alignés sur participantReady, contraintes, invalidations, et 24 variantes PDF (4 langues × 3 styles × 1/2 véhicules) avec lecture du JSON joint. Cas photo B exclue du document à un véhicule mais source conservée. Régression de fuite B reproduite sur référence. Recette navigateur réelle décrite dans docs/RECETTE_REMPLISSAGE_RAPIDE_2026-11-01.md. Lint comparé : 45 erreurs / 61 avertissements historiques ; aucun nouveau diagnostic. Téléchargement blob expiré, signatures personnelles/deux comptes et fournisseurs réels non recettés. Publication autorisée après contrôles.

## 2026-11-01 — Photos documentaires et lot IA
Nouveaux tests document-photo-batch et document-photo-ui : sources/doublons/contradictions, prudence des sélections, éditions concurrentes, budgets source/PDF et formats, parité FR/EN/DE/NL, préparation image/PDF/annulation ; vrais gestionnaires DocumentImport sous hooks contrôlés : ordre séquentiel, arrêt quota, reprise sans doublon, limite atomique, application confirmée et partielle, conservation de dégâts et pièces non lues, choix explicite de contradiction, échec avant envoi, fermeture et annulation tardives. Fournisseur et APIs contrôlés uniquement dans les tests ; aucune donnée réelle envoyée.
Recette Preview : parcours solo et bouton Express indisponible sans droit ; guide/tutoriel mis à jour dans quatre langues ; guide en iframe 375 px sans débordement (zone utile 360 px, scrollWidth 360). La file et relecture administrateur ne sont pas recettées dans un navigateur authentifié ; aucun téléphone physique, caméra réelle ni fournisseur réel testé. Le fichier temporaire de mesure a été retiré avant build. Vérification finale TS/build/suite complète après build à consigner dans STATUS.

## 2026-11-01 — Levée des réserves, état réel
Voir docs/VERIFICATION_RESERVES_2026-11-01.md : protocole physique en neuf étapes, preuve attendue de fichier ouvert depuis le stockage local de chaque téléphone, contrôle des droits et invalidation après correction. Réexécutés : lint (43 erreurs/61 avertissements), audit production (0), audit complet (1 modérée développement), génération PDF de relecture en Preview. Téléchargement navigateur non validé : timeout downloadMedia 15 s, aucun chemin/fichier ; historique Chrome refusé par politique, aucun contournement. Aucun test réel de deux comptes/téléphones, aucune signature personnelle. Code inchangé : build/TS/suite de 215 tests antérieurs non relancés pour ce lot documentaire. Diff contrôlé avant synchronisation, production conservée.

## 2026-11-01 — Audit de robustesse applicative
Nouvelle commande pnpm verify (scripts/verify-platform.mjs) : TypeScript, lint, build puis suite complète, arrêt sur échec. Exécution finale : 223 tests réussis, zéro échec, lint 0 erreur/54 avertissements, build/TS réussis. Quatre tests http-body-hardening sur deadline, annulation bloquée, UTF-8 invalide et Unicode valide ; quatre tests robust-lifecycle sur PDF tardif, confirmation unilatérale, invalidation/retour à l’ancienne valeur A/B et préférence de langue. Hooks des composants réels contrôlés dans ces scénarios ; pas de faux fournisseur livré à l’application. Sonde de référence : UTF-8 invalide accepté silencieusement, désormais refusé. Harnais Evidence adapté aux layout effects, cinq scénarios différés conservés.
Preview : reprise du brouillon fictif et sécurité, confirmations A/B → PDF ; modification de langue invalide la préparation sans supprimer l’historique, retour à l’ancienne valeur ne restaure pas la confirmation. Rejoindre sans paramètre reprend EN après rechargement, lien FR explicite prioritaire. Scans production 0 / complet 1 modérée de développement. Logs bornés : un 401 anonyme cohérent, pas d’exception identifiée dans l’événement renvoyé. Restent physique/deux comptes, fournisseur réel et récupération du PDF final ; aucun nouvel essai mobile complet ou lecteur d’écran revendiqué. Rapport et priorités : docs/AUDIT_ROBUSTESSE_2026-11-01.md.

Après ajout de la clé de session côté page, commande de vérification intégrale relancée sur la source finale ; cette isolation de montage ne remplace pas la recette à deux comptes réels.

## 2026-11-01 — Recette mobile avec comptes existants et CI
Le propriétaire confirme deux comptes ChatGPT déjà autorisés. Protocole, données A/B fictives et feuille à remplir sur chaque téléphone : docs/RECETTE_MOBILE_COMPTES_EXISTANTS_2026-11-01.md. Aucun compte ou droit simulé introduit, pas de signature ni paiement réel exécuté par l’agent. Les colonnes physiques restent Non testé. Localement : YAML/permissions/épinglage vérifiés et 18 tests three-agent-services/three-agent-pdf/onboarding/quick-completion réussis. Le workflow GitHub exécute vérification complète puis audits bloquants ; résultat distant à constater, alerte dev Minimatch non ignorée. Les contrôles techniques ne sont pas une preuve de recette sur deux appareils.

Complément constaté : première exécution GitHub 41321009732 sur b97d5fe, installation figée/qualité/build/223 tests réussis, audit production réussi, audit complet échoué sur une seule modérée Minimatch ; pas de contournement. Sur le site publié v56, compte A connecté reconnu, création normale d’une session TEST FICTIF, fiches A/B et lieu relus depuis le serveur v1, B encore en attente. Pas de signature ni de téléchargement final, pas de deuxième connexion physique ; ne pas convertir ces résultats en recette à deux téléphones validée.


## 2026-11-01 — Synthèse IA avant croquis
Tests synthesis et synthesis-ui : schéma strict/borné, quatre langues, absence de noms dans les champs structurés transmis, double consentement distinct, fin A/B, rôles, refus, révisions et dernière proposition, verrou, suspension au commit, réponse tardive, plafonds heure/jour/historique, tentative auto unique même après échec, purge. Pipeline réel synthèse → croquis → PDF avec fournisseur contrôlé ; retrait de validation avant et pendant commit PDF ; ancien PDF conservé. Fixtures de synthèse explicitement approuvée pour les tests centrés sur croquis/crédits, aucun bypass livré. Composants réels testés sous hooks contrôlés. Preview temporaire du composant réel : validation/retrait, cinq rubriques, FR/EN/DE/NL et iframe 375 px (zone utile/scrollWidth 360/360), texte sans espaces long. Routes QA retirées avant build final ; pas de service simulé livré. Aucun fournisseur réel, téléphone physique ou seconde authentification recetté.


## 2026-11-01 — QR d’accès sur le constat
QR : URL fixe, refus des URL externes/chemins/tokens/identifiants invalides ; matrice PDF 4 langues × local/session, annotation cliquable, source inchangée et version moteur. Rendu et décodage logiciel à taille de page ; permissions session existantes retestées par suite. Scan caméra/téléphone physique non exécuté.


## 2026-11-01 — Réparation du partage mobile
Huit nouveaux scénarios invitation-recovery/session-invitation-ui : restauration après connexion sans fragment, expiration/cache malformé/stockage bloqué, contrôle origine/dossier/query/token dupliqué/trop long, vrais handlers du formulaire dans quatre langues, vrai SessionClient sans nettoyage prématuré ni jeton dans URL auth, réponse POST perdue sans rejeu, refresh not_found explicatif, stockage navigateur interdit, copie manuelle. Harnais ancien Join adapté aux nouvelles dépendances réelles. Preview : page réelle de session fictive, lien incomplet refusé, récupération locale puis rechargement conservé, largeur 375 px dans FR/EN/DE/NL (clientWidth=scrollWidth=375). Aucune adhésion serveur réelle, connexion fournisseur ou téléphone physique exécuté dans cette recette. Page QA temporaire retirée avant build final.

## Confort — 2026-11-02
279 tests : tests/comfort.test.mjs vérifie tous les chemins de complétude face aux conflits remorque, conservation des valeurs, compatibilité historique et ouverture/fermeture du contrôle d’accès Express en quatre langues. Recette mobile réelle : erreur des champs obligatoires, progression solo, sauvegarde locale, options repliées accessibles. Les essais physiques à deux comptes et le téléchargement final restent requis.

## Première utilisation — 2026-11-02
Test du composant Questionnaire : repère dans les quatre langues, disparition au clic, préférence persistante au remontage, stockage refusé sans blocage ni mutation des données. Preview : focus au titre courant après fermeture et largeur mobile sans débordement.

## Recette exploitation — 2026-11-02
Tests document-first-questionnaire : deux réponses avant rendu ne doivent jamais se remplacer ; focus d’erreur respecte reduced-motion. tests/recovery-exercise.test.mjs rejoue un instantané chiffré cohérent D1/R2 dans une deuxième instance isolée : tous les objets/tables, historique, droits A/B et refus du tiers, PDF signé identique et altération refusée. Aucun test physique ni sauvegarde de production revendiqué. Recette navigateur solo jusqu’à génération PDF, rechargement/récupération, correction en relecture ; téléchargement réel bloqué par délais du navigateur de test.

## Scène vitrine — 2026-11-02
accident-story.test.mjs : composant réel FR/EN/DE/NL, phases, lecture unique, pause/reprise, hors écran/arrière-plan, pause globale, replay, reduced-motion et libération des ressources. landing-refresh conservé : guide, invitations, compte, démo/menu et comparaison ne régressent pas. Preview desktop et 360/375/768 : lisibilité, CTA réel toujours disponible et seuil de visibilité sur l’art. Pas de mesure de conversion ou de certification d’accessibilité.

## Narration — 2026-11-02
Tests du contrôleur réel : quatre langues, fin de phrase, pause/reprise au début de phrase, arrêt et callbacks tardifs, erreur sans relance automatique, voix locale et timeout. Test navigateur : clic d’écoute et erreur native de secours confirmés, pas de qualité audio ni lecture réussie revendiquées. Le fichier vocal enregistré nécessite le choix de connexion fournisseur.

Master v77 corrigé : tests/master-fixes.test.mjs, questionnaire A/B avec saisies et import avant rendu, seuil 0/1/59/60 %, pause après démarrage, fichier vocal différé et repères, erreurs/événements tardifs. 294 tests réussis ; recette réelle deux téléphones et téléchargement toujours ouverte.

## Feedback avec images — 2026-11-02
tests/feedback.test.mjs : persistance image valide, décodage/format/taille, droits et compte bloqué, concurrence/quota, réponse perdue/idempotence, formulaire réel avec échec/retry quatre langues, UUID sans randomUUID, pagination sans images ni identité dans les listes. worker-routes inclut les trois nouvelles méthodes privées. Preview : ajout/retrait image fictive, refus sans connexion et conservation du texte/aperçu ; 360/375/768/1280 sans débordement, quatre langues à 360. Route QA supprimée avant build final. Envoi connecté et consultation admin dans navigateur hébergé restent à confirmer après publication. Voir docs/FEEDBACK_2026-11-02.md.

## Présentation 57 secondes — 2026-11-02
Huit séquences et fin entre 50 et 60 s, frontière 56,5 s encore active/56,75 s terminée à pas 250 ms ; reprise exacte du média, huit phrases natives et callbacks tardifs, quatre langues. Durée réelle ffprobe 56,502844 s.


## Partage de la présentation — 2026-11-02
tests/story-video-share.test.mjs : URL constante, MIME/HTTP/flux vide/taille maximale, support Web Share, invocation immédiate, annulation, échec, secours et copie quatre langues, faststart, deux clics/anti-doublon. 308 tests réussis. Aperçu mobile quatre langues et lecture réelle MP4 jusqu’à fin ; partage vers application mobile non testé. Décodage complet et mesures audio enregistrés dans le rapport.
