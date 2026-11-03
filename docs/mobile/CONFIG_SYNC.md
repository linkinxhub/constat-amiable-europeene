# Flutter — configuration distante et démarrage, 3 novembre 2026

## État de référence
Référence canonique d186f57 propre et synchronisée vérifiée, checkpoint
checkpoint/before-bootstrap-20261103. Lot isolé feat/mobile-bootstrap-20261103.
Production Sites toujours v82 ; migration 0020/configuration mobile non publiées.

## Livré et fichiers
- lib/config/config_io.dart : HTTPS vers l’origine Accordia connue, endpoint
  /api/mobile/config fixe ; aucun en-tête d’identité fabriqué, cookie, secret ou
  dossier transmis. Refus des redirections, HTML, HTTP non 200, réponses >4 Kio,
  UTF-8/JSON invalides ; délai global de 5 s, client fermé à chaque tentative.
- ConfigRepository : restauration du cache validé (délai 500 ms), récupération
  regroupée, schéma/révision vérifiés, mise à jour uniquement à frontière sûre,
  écritures du cache sérialisées. Panne réseau/stockage ne bloque pas l’accueil.
  Cache JSON de présentation sans secret, pas un stockage de dossiers hors ligne.
- FileConfigCache : fichier à fournir dans le répertoire privé Application Support,
  lecture bornée et remplacement par fichier temporaire atomique.
- HorizonBootstrap : composition du vrai routeur via contentBuilder, reprise au
  lancement et retour premier plan, conservation pendant reportInProgress,
  application quand ce booléen redevient faux ; pas de délai artificiel ni attente
  réseau avant l’accueil, pas de faux parcours métier.
- Localisations Material FR/EN/DE/NL du SDK ajoutées, dépendances figées dans
  pubspec.lock, .gitignore mobile ; code Dart formaté avec l’outil officiel.
- Correctif réel de compilation Horizon : Icons.draft_outlined inexistant remplacé
  par Icons.drafts_outlined ; withValues remplace l’API dépréciée withOpacity.

## Environnement et vérification réelle
SDK officiel Flutter stable 3.47.9, archive vérifiée SHA-256
25ed8c3c29d51a7353f2a944310b478af8214920639524b19c50a19e6c044c5a.
Flutter revision c197ca5199, Dart 3.13.7. Les premiers appels de l’outil sont
restés sur un verrou ; une installation de travail séparée avec analytics et
contrôle de version automatique désactivés a fonctionné. Les exigences SDK du
package reflètent désormais la version testée.

Workflow .github/workflows/flutter.yml ajouté : SDK épinglé et empreinte vérifiée,
permissions contents:read, aucun secret, contrôles format/analyse/tests sur push
mobile et pull request. Son résultat distant doit être constaté séparément.

Résultats : flutter pub get --enforce-lockfile réussi ; dart format ; flutter analyze « No issues
found » ; flutter test --reporter expanded : 17 tests réussis, zéro échec.
Scénarios : quatre langues, 320 px et texte agrandi, cinq actions injectées,
mouvement réduit, modèle de configuration, cache corrompu, réseau indisponible,
concurrence/coalescence, reprise, frontière de saisie, rollback monotone, source
non autorisée et résultat tardif après démontage. Les dépendances réseau sont
contrôlées : aucune connexion native à la production ou recette HTTPS complète
revendiquée. Aucun téléphone physique ni build APK/IPA. Pas de preuve visuelle
pixel à pixel.

## Limites et prochaines étapes
API non publiée et passerelle Sites privée : face à 401/404 le client retient le
cache/défaut, sans contourner la connexion. main.dart, projets Android/iOS,
routeur des constats, authentification native, choix automatique du dossier privé,
son et splash natif restent à intégrer. Logo master officiel non identifié après
recherche de ressources et fichiers nommés Accordia ; slot conservé avec titre
textuel, aucune image inventée présentée comme officielle.
Guide/tutoriel web vérifiés sans changement : aucun nouveau parcours conducteur
web disponible. Les anciens résultats « SDK absent » restent historiques.
Retour arrière : revert du seul commit ; aucune migration/donnée productive.
GitHub : branche de revue issue du miroir v79, pas de parité globale avec Sites
v82. Aucun déploiement, fusion, changement d’audience ou de secret.
