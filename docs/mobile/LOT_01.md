# Flutter — lot 01, 3 novembre 2026

## Référence et périmètre
Source canonique propre b4d11d99, production Sites v82. Point de restauration
checkpoint/before-flutter-20261103. Aucun changement des routes, données ou droits.
Couleurs extraites de app/globals.css : bleu #064cec, texte #101e3c.

Le premier lot implémente le modèle de configuration Flutter et l’application
aux frontières sûres du parcours. Aucun écran métier, API distante ou panneau
administrateur mobile n’est livré à ce stade. Ne pas présenter cette base comme
une application installable. Aucun logo officiel haute définition indépendant
identifié dans les fichiers inspectés ; public/favicon.svg ne suffit pas à prouver
qu’il s’agit du master officiel. Ne pas inventer un logo.

## Acceptation et fichiers
- mobile/accordia/lib/config/mobile_config.dart : validation stricte des champs
  connus, schéma versionné, révisions croissantes, défaut intégré et report de
  l’application pendant un constat ; préférence sonore utilisateur prioritaire.
- mobile/accordia/test/mobile_config_test.dart : quatre scénarios de garde.
- mobile/accordia/pubspec.yaml : package Flutter initial.
- Aucun code exécuté à distance. Aucun secret ni droit dans la configuration.
- Retour arrière : retirer uniquement ce lot ou revenir au checkpoint ; aucune
  migration ni donnée productive affectée.

## Suite et décisions d’architecture
1. Ajouter la configuration serveur persistée avec révision atomique, historique,
   permissions administrateur existantes, brouillon/aperçu/publication/rollback.
   Un rollback crée une nouvelle révision, il ne réduit pas le compteur.
2. Ajouter transport, cache validé et ressources HTTPS versionnées. Aucun endpoint
   mobile inventé dans ce lot ; aucun appel vers un endpoint inexistant.
3. Définir l’authentification native : l’identité actuelle vient du dispatcher
   Sites, pas d’un jeton mobile. Ne pas forger ses en-têtes ni embarquer un secret.
   Vérifier un flux navigateur système + PKCE avec fournisseur compatible avant
   réutilisation des API privées. Conserver tous les contrôles A/B serveur.
4. Confirmer les ressources officielles, créer accueil/splash/introduction et
   réglages utilisateur ; générer les projets Android/iOS avec le SDK Flutter.
5. Recette téléphone et Preview avant toute publication autorisée.

Le nom/icône installés, splash natif, permissions et nouveau code nécessitent
une livraison native. Seule la présentation Flutter implémentée sera distante.
Le son doit être validé légalement et testé physiquement pour le mode silencieux.

## Vérifications réelles
Dépôt propre au départ ; documentation projet consultée ; diff contrôlé.
Flutter et Dart absents du PATH : tests Dart, analyse Flutter et builds non
exécutés. Tests ajoutés mais non validés. Aucun APK/IPA ni recette visuelle.
Guide vérifié, aucun impact utilisateur : module non raccordé au site ni exposé.
Les réserves de l’audit v82 et du miroir GitHub demeurent ouvertes.
