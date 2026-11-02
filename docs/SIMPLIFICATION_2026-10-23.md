# Revue de simplicité Accordia — 23 octobre 2026

## Objectif et référence
Base publiée : Sites 36, commit 2aca6bb0965ccfd183708b78936f5c368af550de. Git propre et source distante synchronisée avant édition. Point de restauration : before-ux-simplification-20261023.
Objectif : réduire la charge de lecture et de saisie sans supprimer de fonction ni préremplir des faits d'accident. Revue des composants et routes ; ce document ne constitue pas une étude d'utilisabilité auprès de conducteurs ni une validation visuelle complète.

## Parcours et décisions
| Zone | Constat dans le code | Traitement |
|---|---|---|
| Accueil | Un accès principal au constat, cinq étapes illustrées, tarifs et compte | Conserver les illustrations publiées et le bouton principal. Pas de refonte de marque nécessaire. |
| Démarrage | Rôle, langue, photos, guide, refus, partage et sauvegarde précèdent chaque étape | Réglages de départ et partage repliables. Ouverts à la première étape ; repliés après progression. Lien d'invitation rouvre le partage. |
| Situation | Informations nécessaires et GPS soumis à accord | Ajouter une consigne courte par étape. Conserver date, heure, pays, blessures, tiers et confirmation du lieu. Ne pas répondre « non » à la place du conducteur. |
| Véhicules | 24 champs complémentaires affichés ensemble par véhicule | Cinq rubriques : titulaire, conducteur/permis, assurance, véhicule/remorque, choc. Compteur descriptif des champs renseignés ; aucune certification de validité. |
| Suggestions | Liste plus saisie texte simultanées | Une liste par défaut, choix de saisie libre explicite. Valeurs historiques ou personnalisées préservées et retour à la liste sans effacement. |
| Circonstances | 17 cases officielles et ancienne liste secondaire | Conserver toutes les cases et leur confirmation. Consigne : cocher seulement les faits et expliquer les doutes. Ne pas déduire les cases avec l'IA. |
| Photos / croquis | Import, limites, dessin et IA avec consentements | Consigne simple ; conserver import et dessin. Le schéma interactif de dégâts et les propositions photo restent un lot distinct non réalisé. |
| Partage A/B | Compte, invitation, accès au site et enregistrement explicite | Champs simplifiés communs aux trois modes. Ne pas annoncer une sauvegarde réseau automatique. La simplification de l'accès invité exige un chantier d'identité distinct. |
| PDF / signatures | Plusieurs styles, traductions, versions, signatures et relecture | Conserver les contrôles existants. Prochain lot proposé : déroulé « préparer → relire → signer → télécharger », avec les prérequis visibles, sans signer automatiquement. |
| Compte | Offre, stockage, accès administration | Fonctionnel mais mélange de tâches. Prochain lot proposé : dossiers en premier, offre et réglages en second ; pas de modification de rôle ni d'abonnement dans ce lot. |
| Tarifs | Achats fermés explicitement | Conserver la transparence. Aucun paiement, crédit ou accès commercial simulé. |
| Guide | Texte détaillé et tutoriel par mode | Ajouter l'explication des rubriques et des réponses libres en FR/EN/DE/NL, dans le guide et le tutoriel. Une refonte complète en aide contextuelle reste ultérieure. |
| Administration | Configuration sensible et autorisations serveur | Aucune modification. L'interface conducteur ne doit pas dévoiler les réglages administratifs. |

## Lot appliqué
- `fields.tsx` : choix liste/texte libre ; labels et required conservés ; aucune mutation au montage ni à l'ouverture du champ.
- `form-details.tsx`, `detail-groups.ts` : toutes les clés historiques une fois chacune, champs montés dans des details natifs, compteurs renseignés.
- `workspace.tsx` : consigne à chacune des cinq étapes ; réglages et partage repliables, CloudPanel reste monté pour conserver ses opérations et son lien.
- `simple-copy.ts`, `usage-guide.tsx`, `tutorial.tsx` : consignes FR/EN/DE/NL.
- `app/globals.css` : labels, contraste, focus clavier, rubriques adaptatives et cibles mobiles.
- Tests : exhaustivité des champs et cohérence des traductions, suite de régression existante.

## Critères et limites
Aucune modification serveur, migration, secret, donnée, consentement, signature ou intégration. Retour arrière possible par réversion des fichiers de ce lot, sans migration inverse. Les contrôles serveur de droits et de validité restent identiques.
L'ouverture d'une rubrique est un état d'interface uniquement ; la fermer ne supprime aucune valeur. Les champs marqués * et les confirmations obligatoires restent contrôlés. Les compteurs ne constituent pas une validation.
Vérifications visuelles/clavier réelles et parcours à deux comptes restent à faire : l'accès navigateur à la Preview a été bloqué par politique pendant cette session ; aucun contournement tenté. La revue des règles CSS ne prouve pas l'absence de défaut visuel. Pas de publication autorisée pour ce nouveau lot.

## Suite recommandée
1. Recette mobile 320/390 px : listes, saisie personnalisée, ouverture des cinq rubriques, conservation après changement de langue et d'étape, lien d'invitation.
2. Réorganiser le PDF et le compte dans un lot distinct avec leurs tests d'état ; évaluer les erreurs réelles de cinq utilisateurs avant d'ajouter davantage de commandes.
3. Aborder l'autosauvegarde réseau avec gestion des conflits et la lecture de documents/photos avec validation humaine. Ne pas confondre ces fonctionnalités non réalisées avec les simplifications d'affichage livrées.

Validation automatique finale : TypeScript et build réussis ; 150 tests réussis, zéro échec ; diff vérifié. Aucun appel fournisseur réel.
