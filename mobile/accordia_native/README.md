# Accordia Native — projet Flutter initial 0.5.1+9

Ouvrir CE dossier (celui qui contient pubspec.yaml) dans Android Studio, pas seulement android/.
Il s’agit d’un **premier portage d’interface 100 % Flutter natif**, sans WebView et sans
lanceur de navigateur. Le projet source est complet pour être ouvert et poursuivi.
**Ce n’est pas encore une migration fonctionnelle intégrale du SaaS.**

Conservés : design Azur sculpté, logo et splash Sérénité n° 2 animé/son optionnel,
FR/EN/DE/NL, types de véhicules et attelage, préparation locale A/B/A+B, brouillons
AES-GCM/Keystore-Keychain, suppression confirmée, PDF de préparation non signé, QR caméra.
Ne désinstallez pas les anciennes applications : leurs données restent dans leur package.

Les neuf pages web ont un équivalent Dart. Les pages connectées font des requêtes HTTPS
aux vraies API et affichent leurs refus/erreurs. Elles **ne créent pas de faux compte**.
L’hébergement utilise actuellement une identité ChatGPT/SIWC de navigateur : aucun contrat
natif de connexion/renouvellement n’est encore fourni par ce backend. Le premier travail
serveur est donc cette authentification mobile supportée, pas l’insertion d’un token de
contournement ou d’en-têtes oai-authenticated-user-* dans l’application.

Photos/GPS/croquis/OCR/signatures et parité complète du formulaire, PDF final, upload
feedback, rollback/admin IA et conservation restent détaillés dans docs/PARITY_MATRIX.md.
Les achats Premium restent fermés, conformément au site. Aucune clé fournisseur dans l’app.

## Démarrer

Flutter de référence : **3.47.9**, Dart **3.13.7**, Java 17 et Android SDK 36.

```sh
flutter doctor -v
flutter pub get --enforce-lockfile
flutter analyze
flutter test
flutter devices
flutter run
```

Les licences Android se lisent et s’acceptent sur votre machine via
`flutter doctor --android-licenses`. Le plugin Flutter d’Android Studio ne remplace pas
l’installation du SDK Flutter. Guide détaillé : docs/ANDROID_STUDIO.md.

## Points d’entrée

- lib/main.dart : stockage privé, préférences, client réel et démarrage.
- lib/native/app.dart : navigation native, menus et langue.
- lib/native/routes.dart : correspondance des neuf routes web.
- lib/native/pages/ : un fichier par page et sous-écran.
- lib/native/api.dart : API réelle, HTTPS/origine fixe, JSON borné, CAS, erreurs 401/403/409.
- lib/reports/ : formulaire local, modèles conservant les propriétés, chiffrement, PDF.
- lib/design/horizon/ : Azur et splash animé réutilisés depuis la dernière version.
- docs/SITE_MAP.md : plan et modules ; docs/PARITY_MATRIX.md : état sans ambiguïté.

Le client n’envoie aucune identité inventée, n’élève aucun rôle, n’accorde aucun abonnement,
et n’affiche « enregistré » qu’après réponse réussie. Le transport est injectable pour
l’authentification future documentée et les tests ; le transport livré est un vrai HttpClient.
Les doubles de service sont réservés aux tests et ne sont pas montés au démarrage réel.

Fiches A/B : NativeVehicleFields est partagé entre préparation locale et fiche de session. Les listes, groupes et libellés sont exportés du web via scripts/export-native-form.mjs à la racine du dépôt ; tests/native-form-contract.test.mjs vérifie leur correspondance. Cette archive garde les données exportées et les tests Flutter.
