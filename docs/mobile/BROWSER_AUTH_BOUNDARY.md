# Accordia — connexion dans un contexte navigateur cohérent, 0.3.2+5

## Diagnostic borné

La capture fournie montre Chrome (barre d’adresse et onglets), auth.openai.com/error,
client_id_not_found_in_session. Le request_id, le payload et l’image ne sont pas
publiés dans le dépôt. Elle confirme le moteur où l’erreur est affichée, pas la
cause serveur exacte. Source 0.3.1 : _external ouvrait directement l’URL reçue.
Une transaction commencée dans une WebView pouvait donc poursuivre dans un autre
stockage de cookies ; c’est un défaut du routage client corrigé ici. Aucune preuve
d’un mauvais mot de passe ou client OpenAI supprimé n’est revendiquée.

## Implémentation et fichiers

- `lib/platform/policy.dart` : isAuthenticationDestination reconnaît les origines
  HTTPS exactes OpenAI/ChatGPT, Google, Microsoft et Apple, sans user-info ni port
  différent. externalBrowserDestination redémarre celles-ci à l’entrée réelle du
  site /signin-with-chatgpt, avec return_to interne borné. Pas de copie des
  paramètres OAuth state/code/client_id ni du fragment d’invitation. Les autres
  liens (aide, conditions, téléphone) conservent leur destination.
- `lib/platform/page.dart` : confirmation spécifique avant ce redémarrage. Aucun
  état de session/cookie copié et aucun fournisseur usurpé. Les contrôles TLS,
  origines, fenêtres et permissions introduits précédemment restent en place.
- `lib/app/site_browser.dart` et `main.dart` : url_launcher réel, navigateur intégré
  sécurisé préféré pour HTTPS via inAppBrowserView, service externe uniquement si
  indisponible/échec. Téléphone/mail restent externes. Schémas dangereux refusés.
  Aucun navigateur simulé dans l’application ; doubles uniquement dans les tests.
- AndroidManifest.xml : query limitée à CustomTabsService pour détecter le service,
  pas de QUERY_ALL_PACKAGES ni nouvelle permission utilisateur.
- `lib/app/app.dart` : un lancement de secours vers l’entrée SIWC choisit un mode
  navigateur volatile pour les prochaines routes connectées. Ce booléen est un
  choix d’affichage, jamais une identité ou un rôle. Réglages affiche la limite et
  Réessayer la WebView désactive le mode. Horizon et le module natif restent en place.
- `lib/platform/copy.dart` : explications et guide FR/EN/DE/NL, continuité navigateur,
  stockage distinct et invitation à rouvrir au complet. Guide/tutoriel web vérifiés,
  aucun changement serveur ou nouveau champ de constat dans ce lot.
- pubspec.yaml, build.gradle.kts, manifeste : 0.3.2 code 5,
  be.adilbtp.accordia.browserauthpreview, Accordia Accès (test), ARM64. Signature CI
  debug distincte : coexistence pour conserver les données des anciens packages.

## Connexion et saisie partagée

Le navigateur recommence tout le parcours depuis Accordia et reçoit sa propre
session de connexion. Après le choix du secours, compte, dossiers et liens scannés
s’ouvrent dans ce même navigateur. La fenêtre intégrée se ferme pour revenir à
Horizon. Les deux comptes doivent conserver leur droit d’accès au site privé et
leurs invitations réelles ; le serveur valide l’adhésion et les droits A/B.

Le fragment #invite ne va pas dans la connexion OAuth. Pour B, rouvrir après la
connexion le lien complet ou le scanner/coller de nouveau depuis l’application ;
le mode navigateur conserve alors le contexte connecté et transmet le lien complet
au site Accordia. Le token ne devient pas un droit implicite. Aucun partage ni
adhésion automatique. Aucun paramètre fournisseur brut déplacé vers le nouveau
contexte navigateur.

## Limite structurelle explicite

Custom Tabs et WebView sont des contextes distincts. Fermer le navigateur ne
connecte pas la WebView. Ce correctif maintient donc le parcours connecté dans le
navigateur choisi pour cette session, au lieu de simuler un retour authentifié.
Réessayer la WebView ne transfère rien. Au redémarrage de l’app, le choix volatile
est réinitialisé. Le navigateur garde son propre comportement de session.

Stockages natif, WebView et navigateur distincts ; ni import ni suppression. Garder
les anciennes applications pour leurs brouillons. Les présentations Flutter
existantes restent en cache : aucune nouvelle synchronisation depuis Custom Tabs
n’est promise. Une identité mobile avec retour authentifié nécessite un mécanisme
backend supporté, des callbacks/domaines et une signature de distribution stables ;
aucun token SIWC partagé ni faux header d’identité ne sera utilisé pour le contourner.

## Validation réelle

41 tests Flutter réussis, analyse sans diagnostic et formatage conforme. Quatre
nouveaux tests : reconnexion sans export de la transaction fournisseur, choix du
navigateur intégré/repli/téléphone, erreurs et protocoles refusés, parcours widget
mode de secours → compte dans navigateur → retour WebView. Les 37 tests existants
restent verts. Le test widget charge la même ressource JSON embarquée de manière
synchrone pour éviter une attente d’asset d’une ancienne zone FakeAsync ; ce n’est
pas un changement de stockage de production. Aucun test de connexion réel à un
compte utilisateur ni d’adhésion distante n’est revendiqué.

Compilation Android et livraison à renseigner après exécution distante. Recette
nécessaire : login depuis le secours sur le téléphone, accès compte/dossiers dans
le même navigateur, fermeture vers Horizon puis reprise, invitation complète B et
droits séparés, essai Réessayer la WebView et conservation des données. iOS non
compilé. Pas de publication du site, d’accès ou de configuration serveur modifié.

Références primaires :
https://developer.android.com/develop/ui/views/layout/webapps/overview-of-android-custom-tabs
(session de navigateur et cookies) ; https://pub.dev/packages/url_launcher
(API et visibilité CustomTabsService) ;
https://help.openai.com/en/articles/7426629-why-cant-i-log-in-to-chatgpt ;
code source verrouillé url_launcher 6.3.3 et app/chatgpt-auth.ts.
