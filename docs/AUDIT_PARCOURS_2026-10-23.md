# Audit des parcours et simplification — 23 octobre 2026

## Référence et portée
Version 39 publiée avec succès au début de cette intervention, déploiement appgdep_6adae8ae52708191909fa12e53043ee0. Source de départ 189a1eeb9aca5d1cb942b3b6465b882434cf6015, Git propre et synchronisé ; tag before-entry-audit-20261023. La demande autorise publication, audit et corrections de simplicité/design.
Revue du code de la saisie locale, du mode sur appareil commun, des sessions A/B, du partage, des photos, de la préparation PDF/signatures, du compte, des aides et de la vitrine. Complément aux audits techniques déjà présents. Ce n’est pas un pentest externe, une certification juridique ni une recette réelle à deux identités.

## Problèmes confirmés et corrections
1. **Inviter avant de choisir son rôle, actions répétées** : barre supérieure réduite à l’aide et au raccourci d’invitation. Panneau de collaboration après rôle/langue, avec deux cartes : chacun sur son téléphone, ou un appareil commun. Les deux commandes réelles sont préservées ; aucune invitation envoyée automatiquement.
2. **Partage mélangé à la gestion du compte** : sauvegarde en ligne, listes, historique et restauration regroupés dans un panneau secondaire. Le composant reste monté, les données et liens ne sont pas effacés lors du repli. Messages d’erreur et de succès restent en dehors de ce panneau secondaire.
3. **Création d’invitation peu explicite** : explication en quatre langues du constat à deux véhicules, de l’ouverture de sa fiche, du QR/lien et du compte distinct de l’autre conducteur. Autorisation d’accès au site toujours annoncée. Le partage ne contourne pas l’identité ou les droits serveur.
4. **Page compte dominée par les réglages** : constats partagés accessibles en premier avec SharedList existant, lien vers formulaire/sauvegardes ; offre, stockage et administration regroupés. Les permissions et achats ne changent pas.
5. **PDF sans repères de progression** : titres explicites de préparation puis de relecture/signature ou de téléchargement selon l’état réel du document. Boutons, contrôles de consentement, historique et langue conservés.
6. **Statut local incohérent sur appareil commun** : le statut dépendait de `localSaved && !dirty`, alors que l’autosauvegarde ne réinitialise pas dirty. Passage à localSaved, qui est invalidé à chaque modification et confirmé uniquement pour le snapshot courant. Ce statut concerne le brouillon, pas les PDF/signatures conservés séparément.
7. **Échec local affiché comme sauvegarde en cours** : le bloc de sauvegarde montre l’erreur lorsqu’elle est connue au lieu du texte de progression. Bouton manuel préservé.
8. **Animations infinies sans pause manuelle** : commande Pause/Reprendre ajoutée dans la section des fonctionnalités, applicable aux deux ensembles d’illustrations. Animation continue par défaut ; réduction des mouvements système conservée.
9. **Surcharge au-dessus du formulaire** : refus et informations de lancement déplacés dans « Aide et situations particulières ». Blessures, orientation secours et contrôles de sécurité conservés dans le parcours.

## Critères de contrôle
- Tous les champs A/B, 17 circonstances et saisies libres restent disponibles ; cinq groupes complémentaires conservés.
- Aucune migration, aucune suppression de données, aucun secret, rôle, montant ou fournisseur modifié.
- Paramètres et contrôles d’invitation, usage unique/expiration et isolation des participants inchangés.
- Panneaux accessibles par summary natif et clavier ; cartes en colonne à moins de 760 px ; boutons multilignes avec hauteur minimale. Il s’agit d’une revue CSS, pas d’une mesure DOM sur téléphone.
- Guide et tutoriel mis à jour ensemble en FR/EN/DE/NL ; compte et PDF expliqués, enregistrement réseau toujours explicite.
- Retour arrière : réversion du lot de présentation et des deux affichages de sauvegarde. Aucun retour arrière de base de données nécessaire.

## Restes à valider ou traiter
- **Recette visuelle et ergonomique** : non réalisée, navigateur Preview précédemment bloqué par politique. Aucun autre chemin utilisé pour contourner ce blocage. Tester 320/390 px, clavier, listes libres et repli/dépli des panneaux.
- **Deux conducteurs réels** : compte autorisé, QR scanné, choix de langue, reprise réseau, signatures et PDF final ; non exécuté. Les tests de services utilisent des identités synthétiques.
- **Réseau lent** : certains appels client de partage/compte/PDF n’ont pas de délai d’abandon. Un serveur qui ne termine pas la réponse peut laisser un état d’attente. À traiter dans un lot réseau avec reprise idempotente ; pas de relance automatique d’une invitation ou d’une signature.
- **Dossiers du compte** : la liste partagée est accessible par bouton et les sauvegardes individuelles par le formulaire. Pas de tableau unifié ni de recherche ajoutés.
- **PDF** : ajout de repères, pas de suppression des choix avancés. La signature demeure une action personnelle, jamais automatisée.
- **Sauvegarde** : automatique locale uniquement ; confirmation attendue, stockage navigateur requis, signatures/PDF séparés. Sauvegarde réseau explicite. La rétention et les sauvegardes hébergeur gardent les limites de l’audit technique précédent.
- **IA et dommages** : pas d’appel fournisseur réel, pas de validation de qualité d’un croquis ; OCR et diagnostic photo automatique non implémentés.
- **Commercial/juridique** : achats fermés, aucune transmission assureur ni conformité universelle revendiquée. Dépendances non réauditées par scanner distant dans ce lot ; anciennes alertes à traiter séparément.

## Validation du lot parcours
TypeScript, build Sites et diff réussis ; 150 tests réussis sur la version finale, zéro échec, y compris les contrôles Worker compilés. Les tests métier existants couvrent les droits A/B, invitations, révisions, consentements, PDF et sauvegardes. Aucun test navigateur de la nouvelle présentation n’a été exécuté ; recette visuelle et deux comptes réels restent nécessaires.
