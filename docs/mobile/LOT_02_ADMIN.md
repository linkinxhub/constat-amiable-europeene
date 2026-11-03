# Configuration mobile — lot 02, 3 novembre 2026

## État et portée
Référence canonique b4d11d99 et socle 88718c0 vérifiés contre les branches
distantes. Travail isolé feat/flutter-admin-20261103 ; checkpoint avant modification.
Aucune publication ni migration de production. Authentification mobile native
et branchement réseau/cache Flutter toujours à réaliser.

## Livré dans les sources
- features/mobile/model.ts : schéma strict de présentation ; titre, couleur hex,
  direction signature/minimal/premium, introduction 0–1500 ms et défaut sonore.
- server/mobile-settings.ts : historique append-only, brouillon, publication et
  rollback sous nouvelle révision. CAS et rôle administrateur/statut actif
  revérifiés dans l’INSERT ; aucun rôle accordé par la configuration.
- API GET/PUT /api/admin/mobile-settings : identité existante, garde d’origine,
  en-tête d’intention, JSON limité à 4 Kio. GET /api/mobile/config ne renvoie
  que la présentation publiée, jamais auteur/historique. La passerelle privée
  Sites reste applicable : ce GET ne contourne pas l’accès à la plateforme.
- Section Application mobile dans /admin après activation réelle du rôle.
  Recharger charge l’état ; enregistrer crée un brouillon ; publier exige le
  dernier brouillon sans changement non sauvegardé ; historique de 50 entrées
  avec republication des configurations publiées précédentes. Erreurs conservent
  la saisie ; ne pas recharger avant d’avoir copié une modification à préserver.
- Aperçu de paramètres uniquement, pas un rendu Flutter fidèle. Les identifiants
  de design sont stockables mais leurs écrans Flutter restent à intégrer.
- Dart accepte designId et configuration de défaut révision zéro. Les gardes
  de session existantes restent locales ; aucun transport/cache ajouté ici.
- Migration Drizzle 0020 additive et snapshot générés, aucune donnée supprimée.

## Administration et limites
Commandes et explications FR/EN/DE/NL dans features/mobile/copy.ts. Le guide des
conducteurs et la vitrine sont vérifiés sans modification : aucune fonction
mobile annoncée disponible au public et aucune nouvelle action conducteur web.
Logo officiel master, import médias, son personnalisé, fonctions métier et
traductions distantes restent hors de ce lot. Les écrans de choix présentés
séparément sont des propositions visuelles, pas l’application installable.

## Contrôles
Cinq tests ciblés passent : confidentialité, publication/rollback, schémas,
autorisations/suspension, concurrence et vrai formulaire dans quatre langues.
TypeScript, lint ciblé et build réussis. Lint complet hors stockage local :
0 erreur, 54 avertissements préexistants. La commande verify initiale a parcouru
le magasin de dépendances .sites-runtime et épuisé la mémoire ; vérifications
équivalentes séparées avec exclusion de ce seul répertoire d’infrastructure.
La recette navigateur reste non vérifiée : sites-preview start/status échouent
avec « preview relay unavailable ». Aucun contournement de l’infrastructure.
Flutter/Dart absents : pas de test Dart, APK/IPA ni validation physique sonore.
Résultat final de la suite complète consigné dans STATUS.md.

## Retour arrière et prochaine étape
Revenir au checkpoint ou retirer uniquement le lot avant publication. Ne pas
effacer la table historique en production ; la migration n’y a pas été appliquée.
Prochaines étapes : choix graphique, logo master, SDK/build mobile, authentification
native, transport sécurisé/cache et recette du parcours complet.
