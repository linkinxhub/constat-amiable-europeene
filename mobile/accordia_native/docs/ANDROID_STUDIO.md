# Ouvrir et poursuivre dans Android Studio

1. Extraire l’archive dans un dossier simple, par exemple C:\Projets\AccordiaNative.
2. Installer le SDK Flutter (référence validée 3.47.9 / Dart 3.13.7), Android Studio et
   ses plugins Flutter/Dart. Le plugin seul ne fournit pas le SDK Flutter.
3. Dans Android Studio, choisir Open et sélectionner le dossier contenant pubspec.yaml.
   Ne pas ouvrir uniquement android/ pour développer les pages Flutter.
4. Sélectionner votre SDK Flutter dans les réglages du plugin. Dans SDK Manager,
   installer Android SDK 36, Build-Tools, Command-line Tools, Platform-Tools,
   Emulator ; laisser Gradle installer les versions NDK/CMake demandées si nécessaires.
5. Dans le terminal du projet, exécuter flutter doctor -v puis
   flutter doctor --android-licenses, lire les licences et les accepter vous-même.
6. Exécuter flutter pub get --enforce-lockfile. Ne pas remplacer le lockfile ou lancer
   une mise à jour globale des paquets avant un build de référence réussi.
7. Démarrer un émulateur via Device Manager, ou connecter un téléphone avec débogage
   USB autorisé. Vérifier flutter devices, puis ouvrir lib/main.dart et cliquer Run.
8. Vérifier le splash, les langues et une préparation fictive locale. Ne pas utiliser
   de données d’accident réelles pendant la qualification du portage.

Commandes de contrôle :

```sh
flutter analyze
flutter test
flutter build apk --debug --target-platform android-arm64
```

## Où reprendre le travail

- Navigation et menus : lib/native/app.dart.
- Une page par fichier : lib/native/pages/ ; entrée commune lib/native/pages.dart.
- Formulaire et PDF locaux : lib/reports/.
- API/identité : lib/native/api.dart, puis adapter le serveur au protocole mobile
  officiellement supporté. Ne pas copier des cookies du navigateur ni ajouter
  oai-authenticated-user-* ou des clés OpenAI dans le client.
- Priorités et limites : PARITY_MATRIX.md et ROADMAP.md à la racine.

## Dépannage

- SDK Dart trop ancien : utiliser le SDK de référence ; changer seulement la contrainte
  dans pubspec ne rend pas un ancien SDK compatible.
- Android SDK introuvable : terminer SDK Manager et relancer flutter doctor.
- Erreur de signature à l’installation : conserver l’ancienne application et ses données ;
  ce projet utilise un package de développement distinct. Prévoir une clé stable avant diffusion.
- Les pages de compte affichent une connexion à raccorder : c’est la limite serveur
  documentée, pas une raison d’inventer une session ou de désactiver les autorisations.
- Une erreur 409 : recharger la version avant d’éditer ; ne pas forcer un écrasement.
- iOS : nécessite un Mac avec Xcode, une équipe de signature et une recette spécifique.

Documentation officielle de référence, vérifiée le 3 novembre 2026 :
https://docs.flutter.dev/platform-integration/android/setup
