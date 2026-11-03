# Accordia — Horizon + WebView, 0.3.0+3

## Objectif et périmètre

Conserver l’interface actuelle de l’application, intégrer la plateforme réelle en
WebView et raccorder scan/liens/partage de saisie. Accueil Horizon, illustrations,
logo, splash, son, préférences et module natif existants préservés. Aucun formulaire
web réécrit ni droits déplacés vers le client. Aucune modification du site publié.

Critères vérifiables : commandes normales internes ; scan/collage de liens de la
bonne origine ; fragment #invite intact ; serveur seul responsable du compte et
des droits A/B ; pas d’import de cookies Chrome, pas de redirection externe sans
confirmation ; préparation native existante toujours accessible séparément.

## Fichiers et architecture

- `mobile/accordia/lib/platform/page.dart` : InAppWebView, navigation contrôlée,
  cookies/Web Storage persistants du moteur, fenêtres redirigées vers la même vue,
  domaine visible, retour historique, confirmation avant fermeture/rechargement,
  état erreur sans effacement de session. Pause/reprise avec le cycle de vie.
  Pages de connexion ChatGPT/OpenAI autorisées pour navigation seulement ; aucune
  permission native ni lecture PDF sur ces origines. Autres sorties HTTPS/tel/mail
  après confirmation ; file/data/javascript/intent et HTTP refusés. TLS par défaut,
  aucun certificat accepté arbitrairement, contenu mixte refusé.
- `policy.dart` : origine HTTPS exacte, port 443, aucun user-info ; scan limité aux
  destinations de navigation Accordia. Invitation et accès PDF restent différents :
  le lien n’accorde aucun droit. Aucun token affiché dans la barre de titre ou loggé.
- `scanner.dart` : caméra QR native mobile_scanner, action explicite, arrêt en
  arrière-plan et après détection, dispose, refus lisible et collage de secours.
- `copy.dart` : interface/guide FR/EN/DE/NL ; étapes créateur → lien complet/QR →
  compte distinct B → rejoindre ; session native/web et connexion Chrome distinctes.
- `app/app.dart` : boutons Horizon vers routes fixes ; Rejoindre propose scan et
  collage ; Brouillons distingue plateforme/natif ; Réglages garde la préparation
  native hors ligne. `_reportActive` protège la configuration pendant la WebView.
- `config/config_repository.dart` : stageFromWebView borne/valide la présentation,
  conserve les dernières valeurs valides et applique seulement à frontière sûre.
  La WebView fetch le seul `/api/mobile/config` avec ses propres cookies ; elle
  transmet uniquement le JSON public. Pas de copie de jeton ni en-tête d’identité.
  Lecture à la fin du chargement et avant retour à l’accueil ; pas de push temps
  réel promis. Seuls les champs pris en charge par MobileConfig s’appliquent.
- `main.dart` : journal de plugin coupé même en debug, inspection Android coupée ;
  isInspectable=false iOS. Pas de pont addJavaScriptHandler exposé aux pages.
- `android/app/build.gradle.kts`, AndroidManifest.xml : version/package de test,
  caméra et position sur demande, caméra facultative, sauvegarde et HTTP désactivés.
- `ios/Runner/Info.plist` : motifs caméra/photos/position, aucune ouverture ATS.
- pubspec/lock : flutter_inappwebview 6.1.5, mobile_scanner 7.5.0,
  permission_handler 13.0.2. Licences par dépendances et écran légal Flutter habituel.
- tests/native_shell_test.dart, tests/webview_policy_test.dart,
  tests/config_repository_test.dart : navigation et copie, isolation, liens,
  refus adverses, invitation intacte, configuration différée.

## Fichiers, caméra et GPS

Sélecteur de pièces existant géré par le moteur natif du plugin ; caméra web
accordée seulement à l’origine Accordia et seulement pour CAMERA, après consentement
et permission système. Microphone et ressources inconnues refusés. Position exacte
ou approximative suivant le téléphone, uniquement au besoin de la page Accordia,
sans mémoriser une autorisation web globale. Validation des pièces reste serveur.
Comportements OS/constructeurs à confirmer, pas de réussite matérielle revendiquée.

PDF : téléchargement explicite blob Accordia ou HTTPS même origine, fetch dans le
contexte du moteur avec credentials same-origin et redirect:error, lecture plafonnée
à 64 Mio et signature %PDF-, extraction par blocs. Aperçu Flutter printing, partage
système au choix de l’utilisateur. Aucun téléchargement natif avec cookies recopiés,
aucun endpoint de commande fourni par une iframe. Buffers effacés après usage.
Autres formats signalés non pris en charge ; pas d’ouverture navigateur automatique.

## Partage réel et identité

Le parcours de la plateforme est conservé : lien/QR d’invitation complet, compte B
différent de A, adhésion explicite, validation serveur et séparation des écritures.
La session WebView persiste dans le moteur, mais reste distincte de Chrome/Safari.
Une WebView ne crée ni compte ni droit Sites. Requête HTTPS anonyme sur /constat :
401, conformément à l’accès custom observé. Aucun bypass SIWC ou faux en-tête.
Un fournisseur peut refuser une connexion embarquée ; un secours externe confirmé
reste possible sans prétendre réimporter sa session. E2E connecté requis avant
qualification de fonctionnement du partage dans l’APK.

Scan/collage et liens cliqués dans la WebView sont pris en charge. Association de
liens Android App Links/iOS Universal Links non configurée : elle exige domaine,
certificat stable et équipe Apple. Un lien reçu dans une messagerie ne lance pas
encore automatiquement cette application. Le lien complet peut être collé/scanné.

## Données existantes et livraison

Package debug `be.adilbtp.accordia.webpreview`, libellé Accordia Horizon (test),
0.3.0 code 3, ARM64. Distinct des deux APK précédents à signatures CI temporaires.
Ne pas désinstaller l’ancien APK pour essayer celui-ci. Chaque package conserve
son propre stockage : les brouillons des anciens APK restent dans ces anciennes
installations. Le nouveau menu natif ne les importe pas automatiquement. Aucune
migration ou effacement ; distribution durable avec signature stable à préparer.

Main canonique 7a6586a observé et préservé. Branche dédiée issue de d89e425,
checkpoint/before-webview-20261103. Pas de fusion d’un miroir web plus ancien et
pas de publication de la plateforme. Configuration serveur/admin existante consommée,
pas modifiée. Guide web/tutoriel inchangés car mêmes commandes côté plateforme ;
guide natif mis à jour dans les quatre langues dans le même lot.

## Preuves et limites

35 tests Flutter, analyse et formatage réussis ; 9 tests ciblés web A/B : D1/R2 réel
isolé, invitation à usage unique, droits, conflits, reprise d’adhésion, récupération
du fragment et copie manuelle. Le double de surface dans le test widget ne remplace
pas la WebView dans l’application. XML/plist parsés. Pas de test navigateur hébergé
connecté ni téléphone, ni test réel scanner/caméra/GPS/fichier/PDF, ni build iOS.
Build Android distant et livraison à renseigner après résultat natif.

Recette indispensable : deux téléphones/comptes réellement autorisés ; ouverture
/connexion, partage A→B et scan, fiche propre éditable/étrangère verrouillée,
modifications concurrentes, sauvegarde/reprise après redémarrage, refus caméra/GPS,
import photo/PDF, signature du parcours réel et téléchargement/partage final,
retour/historique et réseau coupé. La plateforme a besoin d’Internet ; le module
natif hors ligne reste une préparation locale séparée.

Références primaires : https://inappwebview.dev/docs/webview/in-app-webview/ ;
https://inappwebview.dev/docs/webview/javascript/communication/ ;
https://pub.dev/packages/mobile_scanner ; code source des versions verrouillées.

## Compatibilité Android constatée pendant la compilation

La première compilation 41627170206 a échoué pendant l’évaluation du plugin
flutter_inappwebview_android 1.1.3 : AGP 9.1 refuse proguard-android.txt. Analyse et
35 tests ont réussi. Correctif de construction reproductible, avant chaque build :
`python3 tool/prepare_android_plugins.py`. Le script localise la dépendance verrouillée
via package_config, vérifie le SHA-256 exact du fichier d’origine, puis remplace
uniquement les deux références par proguard-android-optimize.txt. Idempotent ; source
inattendue => arrêt, aucune substitution permissive. Pas de code Java, de droit,
de certificat ou de contrôle serveur modifié. Étape ajoutée à la CI. Retrait prévu
après revue d’une version stable amont compatible. Build release non validé.
Référence Android : https://developer.android.com/build/releases/agp-9-0-0-release-notes .
