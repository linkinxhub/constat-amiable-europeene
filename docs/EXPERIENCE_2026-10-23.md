# Présentation et parcours — implantation de l’étude

Référence : version Sites 47 préparée, commit 0905f7f6d73123a76858dd0d280d21cb902168f7. Restauration : before-design-implementation-20261023. Production 46 conservée durant ce lot.

## Lot appliqué

- Accueil : Commencer/Rejoindre, promesse simplifiée, trois étapes illustrées, deux modes, exemple A/B explicitement fictif, confiance/limites, tarifs, FAQ et actions finales. Détails des anciennes fonctions et espace compte regroupés dans un panneau ouvrable, sans suppression de capacité. Démonstration existante séparée des données réelles. Animations existantes conservées, pause placée hors des panneaux repliables ; réduction des mouvements héritée.
- Rejoindre : page `/join`, collage du lien existant et orientation vers le QR du téléphone. Validation stricte de l'origine, du chemin de session et du fragment invite (un seul token). Aucun lien externe ni token dans les paramètres de requête ; droits et expiration toujours validés par le serveur. L'accès restreint et le compte nécessaire sont expliqués. Langue choisie conservée dans la préférence existante.
- Démarrage : rôle/langue visibles ; réglages photos et IA repliables, à vérifier avant création car le serveur les fixe ensuite. Aucun changement silencieux de configuration existante.
- Questionnaire : compléments choisis par rubrique, affichés initialement si déjà renseignés. Décocher ne supprime rien ; formulaire complet et fiches originales conservés. Choix et curseur repris dans l'onglet, données du Report inchangées. Sans compléments sélectionnés : 19 rubriques pour deux véhicules au lieu de 37 dans le parcours exhaustif antérieur ; toutes les rubriques restent disponibles. Tests historiques de couverture conservés. Les cinq phases sont des repères, pas des confirmations de complétude.
- Relecture : liens Modifier par situation et fiche/circonstances, retour au récapitulatif dans le parcours principal. Session A/B : liens de modification visibles seulement pour la fiche propre et faits communs seulement pour A. Les vérifications serveur restent autoritaires.
- Sauvegarde : composant explicite local/session ; aide longue repliable. Pas d'autosauvegarde réseau ajoutée, pas de modification des invitations, signatures, paiements, quotas ou fournisseur.
- Présentation écran : colonne de saisie, boutons tactiles, dispositions mobile, barre de navigation du questionnaire visible en bas. Styles nouveaux limités à l'écran, impression conservée.
- Informations communes : experience-copy.ts et QuestionnaireInfo diffusent les explications FR/EN/DE/NL dans vitrine, tarifs, compte, guide et tutoriel.

## Références de conception consultées

- https://design-system.service.gov.uk/patterns/question-pages/
- https://design-system.service.gov.uk/patterns/check-answers/
- https://www.w3.org/WAI/tutorials/forms/multi-page/
- https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html

Les choix visuels sont des décisions de produit, pas une certification d'accessibilité ni une preuve d'efficacité mesurée.

## Recette et limites

Tests nouveaux : navigation invitation interne/externe, format et doublons ; activation des compléments, données existantes et isolation B ; assainissement de préférences stockées ; parité FR/EN/DE/NL. Le test de rendu du Worker inclut /join, accueil, constat, compte et tarifs quatre langues. Pas d'identité fabriquée ni appel fournisseur facturable.

Recette visuelle navigateur/mobile non réalisée (accès Preview précédemment bloqué, sans contournement). Invitation réelle entre deux comptes, GPS, scanner QR sur téléphone, extraction documentaire et qualité des PDF avec vraies données à vérifier. Pas d'ouverture commerciale Premium ni de promesse de transmission à l'assureur. Synchronisation GitHub non réalisée : accès Git local indisponible lors de l'essai précédent.

Validation : TypeScript, compilation Sites et revue du diff réussis ; suite complète de 175 tests réussie, zéro échec. Après l’ajout du repère visuel Document dans le panneau partagé : typage/build et tests ciblés du rendu des huit pages et de l’expérience relancés. Aucune recette navigateur/mobile ou fournisseur réel revendiquée.
