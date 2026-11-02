# Recette — photographier les papiers et préremplir

## Résultat et périmètre
Lot développé sur la version 56, sans nouveau serveur IA, droit Premium, paiement, migration ou suppression. Le composant commun DocumentImport est consommé par le formulaire complet, le questionnaire et la fenêtre Express dans les parcours local, appareil commun et session. File de cinq pièces, types explicites, prise de photo/import, préparation locale d’image, appels séquentiels, consolidation et confirmation avant insertion. Les pièces non lues survivent à une application partielle ; les données appliquées suivent les sauvegardes existantes.

## Vérifications exécutées
- TypeScript sans erreur ; build Sites réussi, après dernière modification applicative.
- 15 tests nouveaux : cinq fonctions/budgets/préparation/parité, neuf vrais gestionnaires UI asynchrones sous hooks contrôlés, un raccordement des propositions au véritable rendu PDF et à son JSON incorporé.
- Suite complète après build : résultat final consigné dans STATUS.md.
- Tests serveur existants : consentement, formats, corps, plafonds horaire/global, comptes ordinaires refusés, acteur suspendu/anonyme, côté interdit même propriétaire B, champs autorisés par type, dates, fournisseur redirigé/sortie invalide.
- Lint du code ajouté/modifié et nouveaux tests : aucun diagnostic ; lint global 43 erreurs / 61 avertissements, contre 45 / 61 avant le lot. Deux diagnostics historiques supprimés dans DocumentImport, aucun désactivé.
- Aucun changement de dépendance ; le scan de référence de production était à zéro vulnérabilité, une modérée de développement reste documentée dans l’audit précédent. Aucun nouveau scan n’est revendiqué pour ce lot.
- git diff --check réussi ; aucun fichier temporaire QA dans les sources finales.

## Cas testés
1. Même valeur sur recto/verso regroupée avec ses sources, sans mutation des résultats originaux.
2. Deux valeurs différentes pour une plaque : aucune présélection ; choix humain explicite testé.
3. Valeur incertaine ou champ déjà renseigné : pas de présélection ; une lecture incertaine dégrade une valeur identique donnée par une autre pièce.
4. Modification manuelle pendant la lecture : application refusée atomiquement, saisie conservée.
5. Lot excessif refusé sans effacer la file existante.
6. Premier succès puis erreur de quota : arrêt avant la suite ; reprise explicite saute le succès.
7. Application partielle : pièces non lues conservées, pas d’appel supplémentaire automatique.
8. Annulation pendant préparation et fermeture pendant réponse : aucun résultat tardif appliqué, pas d’envoi des pièces suivantes.
9. Préparation : redimensionnement 4 000 × 3 000 vers 2 000 × 1 500, réencodage JPEG, PDF intact, dimensions excessives/annulation refusées. FileReader/Image/canvas sont contrôlés dans ce test ; ce résultat ne prouve pas un test de caméra physique ni l’extraction EXIF de toutes les variantes réelles.
10. Valeurs documentaires fictives conducteur/preneur/plaque/assurance/permis insérées dans le véritable PDF ; données B et dégâts déclarés préservés ; seule la pièce jointe JSON habituelle est présente, sans les papiers sources ni leurs noms.

## Preview navigateur
Preview gérée à l’adresse interne retournée par sites-preview. Parcours sécurité → solo → réglages de saisie vérifié ; Express reste « Bientôt disponible » sans droit. Guide et tutoriel affichent les nouvelles instructions FR/EN/DE/NL. Guide contrôlé dans un cadre de 375 px : largeur utile 360 px et scrollWidth 360 dans les quatre langues, sans débordement horizontal. Le cadre HTML temporaire a été retiré avant build.

## Limites explicites
Pas d’identité administrateur authentifiée dans le navigateur de recette : l’interface de file/relecture est exercée par ses vrais gestionnaires de composant sous hooks contrôlés, pas par un E2E administrateur. Ni papiers personnels ni appel réel OpenAI envoyés. Compatibilité et qualité du modèle vision/PDF configuré non prouvées. Caméra physique, autorisations caméra, HEIC (non accepté), rotations/éclairage réels, deux comptes/téléphones et qualité OCR multilingue réelle restent à recetter. Les tests ne certifient pas les champs extraits ; relecture humaine obligatoire.

Les achats et droits Premium clients restent fermés côté serveur. Ce lot est préparé/synchronisé sans nouvelle publication de production. Ouvrir commercialement exige un lot distinct de droits et paiements réels. Les fichiers et propositions non appliqués sont en mémoire ; fermer abandonne la file. store:false n’est pas une garantie de rétention nulle du fournisseur. Une tentative déjà envoyée peut être facturée même après annulation.

## Fichiers et retour arrière
Prompt et critères : docs/PROMPT_PHOTOS_DOCUMENTS_2026-11-01.md. Code : document-import.tsx, document-batch.ts, document-photo.ts, document-photo-copy.ts, document-copy.ts, app/globals.css. Tests : document-photo-batch/ui/pdf.test.mjs. Documentation produit/architecture/décisions/roadmap/plan de tests/état/changelog actualisée. Retour arrière : tag before-document-photo-batch-20261101, sans migration ni restauration destructive des dossiers.
