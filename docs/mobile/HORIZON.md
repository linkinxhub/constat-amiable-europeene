# Horizon — direction validée le 3 novembre 2026

Le propriétaire a choisi Horizon après les propositions Horizon/Duo/Crystal.

## Lot implémenté dans les sources
- Nouveau défaut de configuration « horizon » pour les paramètres neufs ; les
  anciens identifiants signature/minimal/premium sont toujours acceptés. Aucun
  réglage publié existant n’est modifié par ce changement de défaut.
- Accueil Flutter HorizonHome : illustration 3D embarquée et optimisée, titre
  configurable, quatre langues, actions commencer/rejoindre/brouillons,
  navigation et aide ; libellés natifs hors image, cartes empilées à petite largeur
  ou avec grands caractères. Le routeur doit fournir tous les callbacks réels.
- Thème Material 3 horizonTheme : bleu configurable, couleurs de bouton calculées
  selon luminance, surfaces claires et coins doux.
- HorizonIntro : introduction Flutter assortie, durée configurée plafonnée,
  réduction des animations respectée, sans délai de navigation imposé.
- Logo officiel injectable par Widget ; faute de master vérifié, titre textuel
  configurable utilisé, aucun emblème inventé. Splash natif et lecture audio
  ne sont PAS livrés dans ce lot.

## Fichiers
mobile/accordia/lib/design/horizon/{home,intro,theme,copy}.dart,
mobile/accordia/assets/horizon/hero.webp, pubspec et configuration Dart ;
features/mobile/{model,admin-panel}.tsx/ts ; tests et documentation.

## Intégration et limites
Ce package contient des composants, pas une application distribuable : aucun
main.dart ou projet Android/iOS généré, routeur métier/authentification native,
transport/cache de configuration, lecteur audio ou import logo administrateur.
Aucun écran factice ne remplace un service réel. Le contrat des callbacks empêche
le composant d’annoncer une création, connexion ou sauvegarde simulée.
Prochaine étape : préparer SDK/projets natifs, raccorder authentification et
routeur, config distante/cache puis vérifier Horizon sur Android et iOS.
Les composants devront recevoir une configuration validée à une frontière sûre
via ConfigSession ; ne pas l’appliquer directement pendant la saisie.

## Vérification
Six tests serveur/UI de configuration passent, dont compatibilité des anciens
styles et défaut Horizon. TypeScript et lint ciblé réussis. Build web réussi. Tests Flutter ajoutés pour quatre langues à 320 px/grands textes,
actions réelles injectées et introduction en mouvement réduit : NON EXÉCUTÉS,
Flutter/Dart absents. Aucune recette de rendu Flutter ni mobile physique revendiquée.
Guide web vérifié sans impact conducteur : seuls des composants mobiles non
raccordés et un choix admin sont ajoutés. Aucune publication ; production v82
conservée. Référence 2b3b2ab et branche canonique contrôlées avant modification ;
checkpoint/before-horizon-20261103 permet le retour arrière sans migration.

Synchronisation : branche canonique dédiée et branche GitHub de revue Horizon.
Cette dernière prolonge le lot mobile sur le miroir v79 ; la parité globale avec
Sites v82 n’est pas revendiquée, aucune fusion ou publication déclenchée.
