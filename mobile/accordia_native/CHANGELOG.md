# CHANGELOG

## 2026-11-11 — APK de la recette hébergée

Accordia Recette v1 est déployée en privé, avec migration 0023. Passerelle Render gratuite à Francfort et déploiement automatique désactivé. Le build de la branche feat/accordia-recette-site reçoit les deux origines HTTPS de recette. Les secrets sont configurés uniquement côté serveur. Guide vérifié, le parcours par code reste identique. Recette complète avec deux comptes réels encore à effectuer.


## 2026-11-11 — Compilation Android pour la recette

Le workflow Flutter accepte les deux origines HTTPS d’une instance de recette lors d’un lancement manuel. Le contrôle refuse une origine absente, le site actif Accordia et une passerelle sur la même origine. Les deux valeurs sont publiques et aucun secret n’entre dans l’APK. Quatorze contrôles locaux de configuration réussis. Les builds ordinaires gardent leur comportement. Aucun APK connecté n’a été généré faute d’origines de recette disponibles.


## 2026-11-11 — Isolation de l’environnement de recette

Le relais exige une origine HTTPS Accordia explicite. Flutter exige les origines HTTPS du relais et de la confirmation web au build. Le test local traverse le relais HTTP et les routes Worker compilées, avec deux comptes de test et la migration 0023 appliquée sur D1 isolé. Guide vérifié, commandes conducteur identiques. La version 94 n’a pas d’URL Preview hébergée. Voir mobile/gateway/PREVIEW.md pour la configuration et la recette à deux comptes réels.


## 2026-11-11 — Confirmation web et retour Flutter

Écran de confirmation web FR/EN/DE/NL et retour manuel dans Flutter par code copié. Le vérificateur et le jeton restent en mémoire dans l’application. La passerelle HTTPS se configure via ACCORDIA_MOBILE_GATEWAY_ORIGIN. Le périmètre mobile connecté couvre la liste et la lecture des dossiers ainsi que la révocation. Analyse Flutter sans diagnostic, 65 tests Flutter et six tests serveur/relais réussis. La migration et l’isolation de deux identités fictives ont été vérifiées sur D1 local avec Miniflare. La compilation web complète, le déploiement Preview hébergé, les deux connexions réelles et l’APK de cette révision restent à vérifier.


## 2026-11-11 — Échange de session mobile côté serveur

Ajout d’une création de code depuis la session web et d’un échange à usage unique avec preuve détenue par le mobile. La passerelle possède son propre secret de service et transmet uniquement l’échange, la révocation et la lecture des dossiers. Le propriétaire provient de la session mobile et les contrôles existants de lecture sont réutilisés. Six tests ciblés réussis, dont deux comptes, expiration, révocation et concurrence dans SQLite. Aucun déploiement ou migration productive. Guide vérifié sans modification visible. L’écran de confirmation web, le raccordement Flutter, la migration D1 en Preview et la recette réelle restent à effectuer.


## 2026-11-11 — Préparation de l’accès aux dossiers mobiles

Relais Node en lecture seule ajouté dans mobile/gateway, trois tests locaux réussis. L’accès au routeur Sites depuis un service a été vérifié. Les routes de session côté Accordia, la liaison au compte et le raccordement Flutter restent à réaliser. Guide vérifié, aucun impact utilisateur à ce stade.


## 2026-11-11 — Lisibilité de la saisie locale

- En-tête compact qui rassemble le numéro et le titre de l’étape, le repère visuel et le statut du brouillon.
- Commande Retour en contour, Continuer et Enregistrer en boutons pleins.
- Le test d’affichage exerce désormais les deux sens de navigation à 320 px et avec un texte agrandi à 160 % en FR/EN/DE/NL.

## 2026-11-09 — Documents de session

- Liste native des PDF de relecture et signés, avec langue et révision fournies par l’API.
- Aperçu Flutter des octets du PDF d’origine, partage et impression via les commandes du lecteur. Les contrôles de session, d’appartenance et d’accès au dossier restent côté serveur.
- Guide mobile en quatre langues et cas de test pour les chemins, les refus, le contenu invalide et l’affichage à 320 px. Les parcours web et leur guide sont inchangés.

Recette CI GitHub Actions 42543918790 : formatage et analyse Flutter sans diagnostic, 64 tests réussis et APK Android ARM64 debug compilé. Artefact Accordia-Native-Pages-test 13642642006. Huit tests de contrat web/mobile réussis localement. La recette sur téléphone, le build iOS et le partage réel de dossiers restent ouverts.

## 2026-11-03 — Premier projet Flutter entièrement natif, isolé
Lot : inventaire réel des 9 pages/25 routes API et création de mobile/accordia_native (0.5.0+8), en conservant mobile/accordia. Accueil Azur en relief, logo et splash Sérénité animés, quatre langues, préparation locale A/B/A+B, brouillons chiffrés, PDF préparatoire et scanner repris. Chaque page possède un fichier Dart et les accès connectés utilisent les API réelles, sans WebView ni identité simulée. CI dédiée et guide Android Studio inclus.
Critères du lot initial : neuf pages mappées, aucune dépendance navigateur, données existantes préservées, erreurs serveur explicites et projet ouvrable. Analyse Flutter : zéro problème ; 43 tests réussis, dont confirmation de sortie et conservation de saisie participant. Build bundle local non exécuté avec succès : Android SDK absent. Build Android CI à vérifier séparément ; iOS et téléphones physiques non testés.
Limites : authentification native serveur non fournie, photos/GPS/croquis/OCR/signatures et parité métier complète non portés ; fonctions connectées non qualifiées de bout en bout. Voir mobile/accordia_native/docs/PARITY_MATRIX.md. Aucune publication de production ni migration de données. Prochain lot : contrat d’authentification mobile, puis portage métier progressif.


## 2026-11-04 — Parité des fiches natives A/B, 0.5.1+9
Cible utilisateur : interface entièrement native avec champs/choix/saisies équivalents au site. Lot livré : 10 champs principaux + 24 compléments véhicule, listes exactes et saisie libre, 4 dates natives, ville locale, suggestions de dégâts et circonstances historiques/normalisées. Composants partagés local/session, guide FR/EN/DE/NL actualisé. Export depuis sources web et test de contrat, pas de copie manuelle divergente. Référence web 91a07f6 intégrée, conflits documentaires résolus en conservant les deux historiques.
Validation : 49 tests Flutter et 5 tests de contrat web/natif réussis ; analyse Flutter sans problème. Rendu/interaction 320 px en 4 langues, conservation des inconnues, suggestions sans écrasement/doublon, confirmation de circonstances invalidée. Une première exécution a révélé un libellé ville mal raccordé ; correction puis suite complète réussie. Chargement des ressources volumineuses en test déplacé dans runAsync. Build Android de 0.5.0 confirmé réussi (CI 41717985674) ; build de 0.5.1 à qualifier en CI, Android SDK local absent. iOS/terrain non réalisés.
La parité fonctionnelle à 100 % reste non atteinte : identité mobile, médias, GPS, OCR, croquis, signatures/PDF final, questionnaire, règles temps/fuseaux, administration complète et synchronisation à qualifier. Détails : mobile/accordia_native/docs/FORM_PARITY_2026-11-04.md. Aucun rôle/droit/abonnement ni compte inventé, aucune production publiée. Point de restauration : checkpoint/before-native-parity-20261104. Prochaine priorité bloquante pour les parcours connectés : authentification mobile supportée avec identités existantes.


## 2026-11-04 — Saisie native en relief et croquis local, 0.6.0+10
Demande : poursuivre le portage avec priorité esthétique des saisies, authentification en dernier point fonctionnel. Lot : cartes relief blanches/bleu profond, médaille A/B, rubriques, champs arrondis, largeur 760 px, barre d’actions fixe et cinq étapes natives. Champs/listes web et données inconnues conservés. Croquis manuel 800×320 (500 traits/5000 points), annuler/effacement confirmé, brouillon chiffré et PDF préparatoire vectoriel en annexe. Aucune signature implicite ; photos restent à porter. Guide FR/EN/DE/NL actualisé et roadmap réordonnée. Fiche participant protégée contre modifications pendant l’envoi.
Preuves : 57 tests Flutter réussis, 5 contrats web/natif réussis, analyse sans problème ; contrôles d’interaction/rendu en 4 langues, 320 px avec texte 1,6× et captures 390 px avec données fictives. PDF A4 de contrôle inspecté via Poppler, croquis en annexe visible ; source inchangée après export/reprise chiffrée. Les échecs initiaux de surface Material et de synchronisation des premiers événements de dessin ont été corrigés puis retestés. Android 0.5.1 précédent compilé avec succès (CI 41744949323) ; nouveau build 0.6 à qualifier en CI. SDK Android local absent, iOS et téléphones physiques non qualifiés.
Réserves : photos/GPS/annotations, questionnaire/OCR/IA, signatures/modèle PDF exact et administration complète restent à porter ; authentification différée sans contournement des autorisations. Recette connectée à effectuer après sa mise en place. Aucun site publié, serveur/droits/abonnement/audience inchangés. Documentation : mobile/accordia_native/docs/INPUT_DESIGN_2026-11-04.md ; point de retour checkpoint/before-native-input-design-20261104. Prochain lot indépendant : photos puis GPS.


## 2026-11-04 — Modèle PDF original et commandes web dans le lot natif 0.6
Demande ajoutée pendant le développement : même modèle original du site, même style des boutons et options. Implémenté : fond JPEG original identique, police standard identique et WOFF manuscrit décompressé en TTF avec caractères/avances/contours contrôlés ; coordonnées des cases A/B reprises de server/reference-page.ts, croquis dans la case, QR local sans donnée de dossier, clavier/stylo bleu/noir et langue des annexes. Valeurs longues conservées en annexes. Véhicule B inactif absent de la sortie. Le modèle français reste français comme sur le web. Source des saisies inchangée par la génération.
Contrôles de commandes : arrondi 10 px, listes/champs et contours harmonisés, boutons de choix oui/non et nombre, styles PDF avec état sélectionné accessible. Couleur des commandes par défaut #1557c0, couleur administrateur publiée prioritaire.
Preuves déjà obtenues : 8 tests de contrat web/natif réussis ; rendu des 3 styles × 4 langues testé avant l’ajustement final du QR, comparaison Poppler de la page 1 web/native sur dossier fictif (différence moyenne 0,61/255 avant harmonisation de la marge QR), exclusion B vérifiée. Les moteurs et annexes sont différents : pas d’identité octet/pixel revendiquée. La dernière vérification locale est interrompue par disparition du cache de dépendances hors workspace ; les vérifications finales et le build sont confiés à une installation propre GitHub Actions, résultats à consigner. Aucune dépendance ajoutée, aucune production publiée ni identité contournée. Authentification maintenue en dernier point fonctionnel.


## 2026-11-04 — Livraison 0.6 qualifiée sur installation propre
GitHub Actions 41749345804 / job 126310243522 : succès complet. Source runtime GitHub 9ee90b4ecec75393e9e0f50a63a191517cb1eb73 ; formatage, analyse (0 problème), 58 tests Flutter et compilation APK réussis. 13 tests Node de contrat/régression web exécutés localement après intégration de canonical/main 8df9c60. La première tentative CI 41749228006 a été rejetée avant les jobs pour contexte runner utilisé dans l’environnement du job ; chemins statiques corrigés, puis vérification complète réussie. Aucune dépendance mise à jour.
APK 0.6.0+10 : be.adilbtp.accordia.nativepagespreview, min SDK 24 / cible 36, moteur ARM64, 116 509 095 octets, SHA-256 c409c8bfa0b60353e39bcdaec006c3cf9f2a56458b6d90f9b6084ec7fc79e8ea. Signature debug v2 vérifiée (un signataire) et CRC valide ; fond/polices/copie embarqués identiques aux sources. Distribution de test uniquement, sans publication production. iOS et téléphones physiques non testés.
Preuves de rendu récupérées depuis l’artefact CI 13285346237 (ZIP SHA-256 bd30fc42fe87b04a9fbab5167db37586b7ac776e522f1d06dfd480e9f786890e) : douze PDF (3 styles × 4 langues), un cas véhicule B inactif et deux aperçus Flutter fictifs. QR du PDF décodé vers /account?lang=fr, sans identifiant de dossier ; absence de PRIVATE_B vérifiée dans la sortie mono-véhicule. Comparaison Poppler page 1 web/native : différence moyenne 0,40/255 après marge QR, non assimilée à une identité de pixels. Le modèle/fond et les placements sont repris ; annexes et moteurs restent différents.
Le présent enregistrement ne modifie que la documentation : mêmes sources runtime que le build testé. Projet source complet à ouvrir via pubspec.yaml, guide et limites inclus. Prochains lots : photos/GPS/annotations, questionnaire/OCR/IA, signatures et administration complète ; authentification maintenue en dernier point fonctionnel. Aucune promesse de parité globale à 100 %.
