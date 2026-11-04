# Vitrine Accordia — contrôle et corrections du 3 novembre 2026

## 2026-11-03 — Vitrine harmonisée et contraste corrigé, sans publication

Demande : corriger les chevauchements et couleurs, notamment Vous gardez le contrôle, et vérifier les vulnérabilités repérées. Base propre 4b56749 (documentation post-v84), source distante ouverte/vérifiée avec le workflow Sites ; production v84. Restauration checkpoint/before-landing-harmony-20261103. Lot limité aux styles .marketing-v2, robustesse de la langue et tests correspondants ; aucune donnée, fonction métier, offre, intégration, permission, vidéo ou configuration mobile retirée.

Défauts confirmés sur le site publié : titre trust #153454 sur fond #112f3b (contraste 1,11:1), légendes claires et section-index mal contrastés ; barre sticky superposée au contenu pendant le défilement et dans une capture complète ; blocs sombres contigus et titres trop grands dans les colonnes intermédiaires. Corrections dans app/marketing-refresh.css : titre blanc (14,06:1), légendes et index renforcés, navigation relative dans le flux, menu dès 1100 px, grilles minmax(0,…) et passages 2/1 colonnes, typographie et interlignes harmonisés, séparation trust 32–64 px, cartes mobiles lisibles. Styles métier/formulaires non touchés.

Durcissement dans features/marketing/landing.tsx : Object.hasOwn remplace `in` pour la préférence de langue stockée ; valeurs de sélection contrôlées et fermeture du menu au changement de langue. Les clés héritées __proto__/constructor/toString ne peuvent plus provoquer une langue invalide et un écran cassé. Test réel du composant ajouté dans tests/landing-refresh.test.mjs. Aucun sink HTML dynamique identifié dans le périmètre marketing ; lien externe existant déjà noopener/noreferrer, garde serveur conservée.

Validation finale : TypeScript/build réussis ; 327 tests / 0 échec, dont 5 tests ciblés vitrine/cohérence produit ; lint ciblé 0 erreur / 1 avertissement img préexistant. Audit dépendances production : 0 vulnérabilité, 280 dépendances comptées. Audit complet : 1 avis modéré de développement, Minimatch 3.1.5 via ESLint (GHSA-g3hv-75wg-m249), 0 élevée/critique. Correctif annoncé >=11.0.1 ; remplacement majeur non forcé car API incompatible avec la chaîne de lint actuelle. Cette réserve préexistante est documentée, pas déclarée résolue ; aucune dépendance changée.

Recette CUA sur aperçu officiel, vrai site dans iframe de mesure temporaire : FR/EN/DE/NL × 360/375/768/1024/1280/1440 = 24 combinaisons. Zéro débordement horizontal des éléments contrôlés, zéro intersection des blocs successifs, titre trust blanc et séparation >=32 px. Menu tablette ouvert/fermé et navigation vers Fonctionnalités contrôlés. Audit DOM des couleurs sur fonds unis : aucune insuffisance parmi les textes mesurables de la vue finale ; images, gradients et transparences ne constituent pas une certification d’accessibilité. Captures bureau/mobile inspectées, console finale sans erreur applicative dans l’échantillon borné. Route de mesure retirée avant build, absente du Worker, aperçu arrêté.

Guide/tutoriel/vitrine/tarifs vérifiés dans les quatre langues : commandes, offres et limites inchangées ; aucune promesse de barre fixe dans la vitrine. La consigne du guide concerne la barre du formulaire, intacte. Aucune nouvelle instruction à ajouter pour ces corrections de présentation. Rapport : docs/VITRINE_HARMONISATION_2026-11-03.md. Retour arrière par checkpoint ; publication production soumise à autorisation explicite. Prochaine étape : publier la version sauvegardée, puis contrôle visuel hébergé.

## Critères d’acceptation

- Titre lisible sur la surface sombre et contraste suffisant des textes mesurables sur fonds unis.
- Navigation fermée dans le flux, menu utilisable sur tablette et mobile.
- Sections successives séparées et absence de débordement des titres, liens et cartes sur les 24 variantes.
- Contenus, liens de saisie/compte/guide, vidéo, consentements et offres conservés.
- Préférences de langue malformées refusées sans écran cassé ; aucun changement de droit serveur.
- TypeScript/build/tests réussis et sources synchronisées GitHub avant publication.

## Matrice de recette

| Langue | 360 | 375 | 768 | 1024 | 1280 | 1440 |
|---|---|---|---|---|---|---|
| FR | Conforme | Conforme | Conforme | Conforme | Conforme | Conforme |
| EN | Conforme | Conforme | Conforme | Conforme | Conforme | Conforme |
| DE | Conforme | Conforme | Conforme | Conforme | Conforme | Conforme |
| NL | Conforme | Conforme | Conforme | Conforme | Conforme | Conforme |

Les largeurs sont celles des iframes ; la zone utile peut être réduite de 15 px par la barre de défilement. Les mesures portent sur la page rendue, les blocs directs et les éléments de contenu contrôlés. Pas de test sur téléphone physique, de pentest exhaustif ni de promesse de sécurité absolue.
