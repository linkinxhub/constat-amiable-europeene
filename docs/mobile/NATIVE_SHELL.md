## Build Android réussi — preuve du 3 novembre 2026

GitHub Actions 41610058395 terminé success : formatage, analyse, 21 tests et
compilation APK debug réussis ; artefact 13218732438. Source GitHub
b0fa483db352040b4ab4c8efcbdad9336dc2cd13, source canonique 7a5180f.
Sous-arbre mobile/accordia identique des deux côtés :
66263e381856eae968658ed447b26f07cbc9f51e.
APK livré : Accordia-Android-test.apk, 82 785 282 octets ; SHA-256
e6624b5a504ca332b0125d2bb9f255429735ceff45043a2aaeebd10009cf1e6e.
Archive téléchargée et CRC contrôlés. apksigner verify : signature v2 valide ;
aapt : nom Accordia, be.adilbtp.accordia, version 0.1.0 (1), minSDK 24, target 36.
Permissions fusionnées : INTERNET et permission privée du récepteur AndroidX ;
pas de caméra, localisation ou microphone natifs. Aucun lancement sur téléphone
physique ni validation iOS revendiqué. Le build local reste historiquement échoué
pour le réseau Java, le build CI réussi le remplace comme preuve de compilation.

# Accordia — application de test native, 3 novembre 2026

## Référence et périmètre
Source eca4133 propre et synchronisée vérifiée avant modification. Checkpoint
checkpoint/before-native-shell-20261103. Nouveau point d’entrée lib/main.dart,
projets Android/iOS générés avec Flutter officiel 3.47.9. Aucun déploiement web,
migration, signature App Store/Play Store ou modification des accès.

## Résultat réel
- Démarrage natif puis accueil Horizon, code Flutter exécutable avec main.dart.
- Réglages natifs langue/son sauvegardés dans Application Support privé ; cache
  des paramètres de présentation désormais créé dans ce même dossier réel.
  Si le stockage est inaccessible, fonctionnement en mémoire et erreur de
  sauvegarde explicite. Aucun dossier d’accident ni secret dans ces fichiers.
- Bouton Réglages dans l’accueil, explications FR/EN/DE/NL. Le son original court
  est intégré, désactivé par défaut, préférence utilisateur prioritaire, une
  tentative à froid, arrêt au passage en arrière-plan et pas de replay à la reprise.
  iOS ambient/mixWithOthers ; Android assistanceSonification sans prise de focus.
- Les boutons métier ouvrent EXPLICITEMENT le site HTTPS existant dans le
  navigateur système après confirmation, par url_launcher. Aucun WebView de
  remplacement, aucun compte ni constat fictif. Origin/path/lang sont fixes et
  ne viennent pas de la configuration distante. Les brouillons web restent dans
  le navigateur et ne sont pas prétendus importés. Aucune ouverture automatique.
- Identité visuelle native reprise du site : ShieldCheck utilisé par l’en-tête
  réel, avec licence Lucide ISC conservée, nom Accordia et bleu Horizon. Icônes
  Android/iOS et splash natif statique assortis. Un master officiel distinct n’a
  pas été identifié et n’est pas inventé. Reproduction des images via script.

## Limite d’architecture assumée
Le parcours entièrement natif et sa connexion aux API privées ne sont PAS livrés.
Le site actuel dépend de l’identité injectée par la passerelle Sites ; le client
ne forge jamais ses en-têtes. Le navigateur conserve le vrai parcours connecté.
La configuration mobile côté serveur n’est pas déployée ; 401/404 côté application
restent traités avec cache/défauts. Les réglages du site ne sont donc pas annoncés
comme synchronisés réellement avec ce build avant publication et recette.

## Plateformes et confidentialité
Identifiant de build proposé be.adilbtp.accordia (non enregistré auprès des
boutiques). Android minSdk 24, compilation SDK 36 ; permission INTERNET seulement,
aucune caméra/GPS/micro natifs ajoutés. Les permissions des parcours web restent
celles du navigateur. Signature de production non configurée ; suppression du
fallback de signature release avec clé debug fourni par le template.
iOS : sources générées, pas de build/Xcode/codesign sur Linux.

## Vérifications
21 tests Flutter passent : tests antérieurs plus routes fixes/quatre langues,
préférences persistées et données corrompues refusées, politique sonore et vrai
composant App (annulation, confirmation, navigateur, réglage sans replay).
Analyse Flutter réussie : No issues found. Assets/manifestes XML/plist
contrôlés structurellement. Pas de recette physique audio/silencieux/DND/Bluetooth,
d’ouverture du navigateur connecté, caméra/GPS ou reprise après arrêt système.
Android SDK officiel téléchargé, empreinte vérifiée : commandlinetools Linux
15859902, SHA256 4e4c464f145a7512b57d088ac6c278c03c9eea610886b35a5e0804e74eedf583.
SDK 36, build-tools 36.0.0 et NDK 28.2.13676358 installés. Build APK local échoué
au téléchargement Gradle : Network is unreachable dans Java, malgré utilisation
du proxy fourni et tentative IPv4. Aucun contournement réseau ; aucun APK local
réussi revendiqué. Workflow GitHub étendu pour build debug arm64 et artefact de
7 jours : résultat distant à constater, sources et tests ne prouvent pas le build.

## Fichiers et suite
lib/app, lib/main.dart, android, ios, assets/audio et assets/brand, pubspec/lock,
script de marque, test/native_shell_test.dart et workflow Flutter.
Guide et tutoriel web vérifiés : aucun bouton conducteur web changé. L’aide et
les limites de l’interface mobile sont dans lib/app/copy.dart en quatre langues.
Prochaine étape : obtenir et vérifier un APK de test, recette physique, puis
raccorder les parcours natifs à une authentification/API supportées. Les médias
administrables personnalisés restent à implémenter. Retour arrière par revert
sans migration productive ; production et données existantes conservées.
GitHub : branche de revue dédiée, miroir web historique non réconcilié avec v82 ;
aucune fusion ni déploiement.
