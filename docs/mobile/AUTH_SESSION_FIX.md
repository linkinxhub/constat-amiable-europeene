# Accordia — session de connexion WebView, 0.3.1+4

## Constat et niveau de certitude

Erreur signalée : client_id_not_found_in_session à 12:18:25Z le 3 novembre 2026.
Le request_id du propriétaire n’est pas publié dans le dépôt. Inspection Sites :
statut active, auth_client_id renseigné, accès custom, version 84 observée ; erreurs
Worker interrogées sur 180 min : aucun événement retourné. Pas d’accès aux logs du
fournisseur ; la cause exacte de cette transaction n’est donc pas démontrée.
L’hypothèse retenue est un contexte de connexion perdu dans le moteur ou entre
moteurs. Deux défauts du client sont réels : cookies tiers toujours refusés et
popups remplacées par un nouveau GET loadUrl. L’APK ne peut pas lire la session de
Chrome ni la réimporter automatiquement. Aucun identifiant client inventé.

## Correctif inclus

- `platform/page.dart` : nouvelle WebView avec le windowId fourni par le moteur,
  initialUrlRequest absent pour une fenêtre enfant. POST, opener et contexte
  natif conservés ; aucun rechargement automatique du parent après fermeture.
  Fenêtres limitées à deux niveaux, une enfant par parent, origines Accordia et
  OpenAI explicitement autorisées. Fenêtre about:blank seulement au démarrage
  d’une enfant ; destinations ultérieures soumises aux mêmes contrôles.
- Cookies tiers et ouvertures JS activés pendant l’initialisation de connexion.
  Désactivation demandée après JSON valide de /api/mobile/config, vérifié avec
  MobileConfig dans le contexte même origine, sans copie de cookies. La mutation
  conserve les autres settings en reprenant getSettings : TLS/contenu mixte,
  fichiers, inspection et permissions ne sont pas relâchés. Réactivation avant
  navigation vers le fournisseur ou /signin-with-chatgpt.
- Nouveau contrôle Recommencer la connexion sur une page d’erreur fournisseur
  reconnue par son chemin/query ou sur un refus d’accès. Confirmation utilisateur
  et entrée réelle du site /signin-with-chatgpt. Aucun rechargement de l’URL auth
  périmée, aucun effacement global cookies/cache/Web Storage/rapports.
- `platform/policy.dart` : return_to interne, uniquement lang et document bornés,
  exclusion des fragments et paramètres étrangers (client_id, access_token, etc.).
  L’invitation initiale reste dans l’objet URI natif. Après reprise de connexion,
  Reprendre la page permet sur confirmation de réouvrir le lien initial complet
  dans Accordia, sans placer le token dans OAuth. Pas d’adhésion automatique.
- `platform/copy.dart` : consignes/guide FR/EN/DE/NL pour les deux commandes ; guide
  web existant vérifié et inchangé, aucun nouveau parcours backend.

## Données et distribution

Aucun dossier, brouillon ni consentement supprimé. Aucun cookie lu/exporté ni faux
header d’identité. Nouveau package debug be.adilbtp.accordia.webauthpreview,
libellé Accordia Connexion (test), version 0.3.1 code 4, ARM64. La signature debug
CI précédente n’est pas réutilisable : package séparé pour préserver les anciennes
installations et leurs données. Pas de migration entre packages ; garder l’ancien
APK pour accéder à ses brouillons. Signature stable pour les futures mises à jour
reste un chantier séparé ; pas de clé privée placée dans le code.

## Contrôles et limites

37 tests Flutter réussis localement, analyse sans diagnostic et formatage appliqué.
Deux nouveaux tests : reprise depuis l’entrée serveur sans secret d’invitation ou
paramètre client tiers ; refus d’origines non fiables, récursion et doubles popups.
Les tests natifs précédents de navigation, langues, stockage et PDF restent verts.
La sémantique windowId est celle du plugin, pas une session d’identité simulée.
La véritable connexion n’est pas qualifiée par ces tests unitaires/widgets.
Compilation et livraison vérifiées dans la section finale ci-dessous.

Retest requis sur le téléphone : ouvrir la nouvelle application, démarrer puis
utiliser la méthode habituelle ; si erreur, Recommencer la connexion. Vérifier
la fermeture de la fenêtre de connexion et Reprendre la page si proposé. Tester
ensuite invitation avec deux comptes autorisés et le lien #invite complet. Ne pas
actualiser en boucle un écran auth expiré. Si le fournisseur impose le navigateur
externe, celui-ci garde sa session distincte et ce correctif ne prétend pas la
réimporter ; cette limite doit rester visible. Aucun build iOS/recette téléphone.

Sources primaires consultées :
https://help.openai.com/en/articles/7426629-why-cant-i-log-in-to-chatgpt
(recommande cookies et JavaScript autorisés pour le login) ;
https://inappwebview.dev/docs/webview/in-app-webview/ (gestion des fenêtres) ;
code source verrouillé flutter_inappwebview 6.1.5. Aucun nouveau déploiement du site.

## Preuve de compilation et livraison

CI [41647706567](https://github.com/linkinxhub/constat-amiable-europeene/actions/runs/41647706567)
réussie : dépendances verrouillées, compatibilité Android, formatage, analyse,
37 tests, build APK et artefact 13235793573. Source canonique 6f2a2da ; commit
GitHub 2f147e18ba1f95f9edc5eee80e4403e2cf55b3c5. Sous-arbre mobile strictement
identique `9c4f525ac571f79303f1a6b02aa845521daa7701`, vérifié par les arbres Git.
ZIP CRC valide ; SHA-256 conforme au digest de l’artefact GitHub :
`c9bfe8bf30860aed9d7587d4d16054ddfbd604dfcfbbf41ece9bd02a07feba16`.
APK : 117 471 149 octets, SHA-256
`57ebb13f291fc29a82ab63791f3276201caf52f8715e93a9bb3456f3bbea5222`.
apksigner : signature debug v2 valide, un signataire. aapt : package
be.adilbtp.accordia.webauthpreview, version 0.3.1 code 4, SDK min 24 / cible 36,
libellé Accordia Connexion (test), activité be.adilbtp.accordia.MainActivity.
Livraison Accordia-Connexion-test.apk, fichier persistant
libfile_a73e2b48653c819190b2a7337c443773 ; upload réussi et métadonnées appliquées.
Anciens APK conservés. Aucun effacement de données ni déploiement du site.

La construction et le correctif client sont vérifiés ; la résolution de l’erreur
exacte sur le téléphone du propriétaire reste NON confirmée. Ne pas assimiler
37 tests unitaires/widgets et un APK signé à une connexion fournisseur réelle.
