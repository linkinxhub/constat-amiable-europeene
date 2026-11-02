# Harmonisation des pages et des offres — 23 octobre 2026

Référence : version préparée 51, commit `8a3419fea66d77210ab3634fcf57d269a9c46923`. Point de restauration : `before-pricing-harmony-20261023`. Publication explicitement demandée par le propriétaire après harmonisation.

## Résultat

La page Tarifs montre les prix avant les explications détaillées : offres particuliers, futures flottes, services, règles puis FAQ. Les six offres et toutes leurs conditions sont conservées. La préparation gratuite a une action directe ; les offres prévues renvoient à la préférence de compte, sans simuler un achat.

Un composant de carte commun présente les trois offres particuliers sur l’accueil, Tarifs et le compte non connecté. Les préférences du compte connecté reprennent les mêmes noms, montants, conditions et statuts depuis les mêmes sources. La préférence flotte reste une préférence globale : elle ne crée ni palier commercial ni espace de gestion.

Tarifs, Mon compte et Rejoindre partagent désormais navigation, marque, pied de page, couleurs, boutons, espacements et typographie. L’accueil conserve ses liens de découverte et son menu adapté, avec les cartes et le pied de page communs. Le formulaire et les sessions conservent leurs commandes métier et adoptent les mêmes couleurs et bordures d’interface. Les styles ajoutés sont limités à l’écran : aucune modification des impressions ou des PDF.

Mon compte distingue dossiers, préférence d’offre et stockage/réglages. Connexion, déconnexion, reprise, stockage et accès administratif existants sont préservés, avec les autorisations serveur inchangées. Les explications sur stockage, rétention et accès restent disponibles dans les détails.

## Langues et conservation

FR/EN/DE/NL dans les textes et composants partagés. Les liens de consultation et de démarrage transmettent la langue choisie. Une URL explicite de langue est prioritaire sur la préférence navigateur pour l’accueil et Rejoindre. Le formulaire accepte cette langue lors de son initialisation ; une reprise de constat conserve ses propres langues enregistrées et ne réécrit pas les déclarations.

Sur Rejoindre, le changement de langue reste une interaction locale : le lien d’invitation saisi est conservé, sans transmission ni acceptation automatique. Le contrôle d’origine et de jeton reste identique.

La documentation `pricingCopy.guide` réutilise `presentationCopy.guide` dans guide et tutoriel : nouvel ordre des offres, vrais libellés « Commencer gratuitement », « Gérer ma préférence », accès direct à « Choisir mon offre », puis « Stockage et réglages », distinction préférence/paiement et langues d’un dossier repris. Mise à jour dans les quatre langues. Les informations questionnaire et pièces restent accessibles via leurs composants communs.

## Préservation

- Catalogue monétaire et validation serveur inchangés : 0 €, 6,90 € TTC par accident, 19,90 € TTC/an, futures flottes dès 19 € HT/mois, avec détails et quotas existants.
- Aucun paiement ni abonnement activé. Aucun droit, quota, secret, consentement ou contrat modifié.
- Aucun changement de schéma, aucune suppression de données ou de fonctionnalité.
- Les huit correctifs de l’audit à trois agents préparés dans la version 51 sont inclus dans cette livraison ; voir `CORRECTIFS_AUDIT_TROIS_AGENTS_2026-10-23.md`.

## Validation

- TypeScript et compilation Sites : réussis ; avertissements préexistants sur la taille de certains bundles et la classification statique des routes conservés.
- Suite complète finale : 186 tests réussis, zéro échec, après les derniers textes de guide.
- Deux nouveaux tests : prix et identifiants des préférences raccordés au catalogue réel, statuts gratuit/prévu/flotte, rejet des langues non prises en charge et parité des textes.
- Test Worker des pages enrichi : six offres et ordre des rubriques Tarifs, trois cartes particuliers identiques sur accueil/compte, routes publiques et langues FR/EN/DE/NL, liens avec langue.
- Preview navigateur : Tarifs dans quatre langues, compte non connecté, accueil néerlandais avec montants et statuts identiques, Rejoindre et conservation d’un lien fictif pendant le passage NL→DE. Aucun débordement horizontal sur la page Tarifs allemande au format ordinateur contrôlé.
- Revue React : composants partagés, clés stables, fonctions et états métier préservés, chargement d’identité et paramètres indépendants en parallèle, aucune nouvelle dépendance ni requête fournisseur.
- Revue des règles responsive : grilles en une colonne, navigation repliée sur plusieurs lignes, boutons et blocs flexibles ; pas de recette visuelle sur téléphone physique.

## Fichiers

`features/product/presentation-copy.ts`, `site-header.tsx`, `plan-cards.tsx`, `offer-options.ts` et `app/product-ui.css` centralisent la présentation. Consommateurs : pages accueil, Tarifs, compte, Rejoindre, composants pricing/landing/offer-panel/join-panel, liens de workspace et import CSS du layout. `pricing-copy.ts` synchronise le guide. Tests `product-presentation.test.mjs` et `product-pages-worker.test.mjs`, STATUS/CHANGELOG/TEST_PLAN actualisés.

## Limites et livraison

Pas de recette navigateur avec identité authentifiée ou deux comptes réels. Les préférences authentifiées sont couvertes par leur modèle commun et les tests de service existants, sans contourner la connexion. Paiement, OpenAI, permissions GPS/caméra et réception par un assureur non testés. Les limites de la recette du constat précédent restent applicables.

Publication après contrôles, audience et accès existants conservés. Le résultat natif de déploiement fournit la version et la confirmation de mise en ligne. Sources synchronisées via Sites ; aucune synchronisation GitHub revendiquée. Retour arrière possible sur la version publiée précédente, sans migration de base.
