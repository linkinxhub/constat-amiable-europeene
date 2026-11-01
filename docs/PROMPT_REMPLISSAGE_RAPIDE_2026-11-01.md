# Cahier de travail — remplir simplement et produire le constat

## Mission
Agir comme ingénieur produit responsable d’Accordia. Réduire les répétitions et la charge de lecture pour une personne stressée sur téléphone, tout en conservant chaque valeur saisie, les rôles A/B, les originaux, la séparation conducteur/preneur et les validations serveur. Utiliser uniquement des données fictives clairement identifiables pour la recette. Ne pas simuler un fournisseur, un paiement ou une identité dans le produit.

## État de référence et restauration
Source Sites 55 / a01a8d6 ; point de restauration before-fast-completion-20261101. Branche GitHub feat/safety-device-modes-20261101. Vérifier les versions distantes avant push et préserver toute divergence. Autorisation de publier reçue dans la demande du 1 novembre 2026 ; audience inchangée.

## Lot exécutable
1. Tester les chemins : solo 1/2 véhicules ; appareil commun créateur A/B ; deux appareils et droits propres ; guidé et complet ; FR/EN/DE/NL. Relecture, sauvegarde/reprise, corrections, photos/croquis, PDF clavier/bleu/noir et signatures fictives dans les tests de services.
2. Repérer les doubles saisies, confirmations ambiguës, boutons sans action, libellés longs et erreurs peu visibles. Prioriser les obstacles qui empêchent la sortie du document.
3. Dans le questionnaire : titres courts par sujet, progression de navigation explicite, erreurs de champs accessibles, contrôle avant fin. Réglages et Express accessibles sans occuper tout le premier écran.
4. Fin guidée : solo vers relecture/PDF ; appareil commun vers confirmation réelle et passage A/B ; partagé vers sauvegarde serveur avec finish=true, puis relecture. Aucun statut terminé sans les prérequis du côté concerné.
5. Photos et croquis restent facultatifs et accessibles ; pas de saut destructeur. Rendre visible la différence entre aperçu incomplet, document non signé et document signé. Ne pas inventer d’info inconnue ni une signature.
6. Guide/tutoriel et aides FR/EN/DE/NL actualisés dans le même lot. Conserver les API, quotas, accès Premium, consentements IA, documents anciens et mécanismes de gel/signatures.

## Critères d’acceptation
- Une fin de questionnaire ne réaffiche pas inutilement les mêmes champs.
- Aucune valeur A/B ni photo n’est perdue lors d’un changement de mode, langue ou rubrique.
- Une partie A ne peut être déclarée terminée localement si les faits communs obligatoires manquent ; la fin partagée est confirmée par le serveur.
- Aucun passage avec date future/impossible, heure invalide, email invalide renseigné, champs requis vides ou circonstances non vérifiées ; les champs facultatifs vides restent acceptés.
- Le mode solo conserve le nombre de véhicules et l’autre fiche. Les modes partagés ne donnent aucun droit sur la fiche distante.
- Parcours navigateur fictif jusqu’au PDF de relecture ; contrôle des variantes métier par tests avec vrais services locaux. Distinguer ces preuves d’une recette hébergée à deux comptes et d’un téléphone physique.
- Bureau et 375 px : commandes lisibles, clavier/focus, pas de débordement horizontal ; bouton de suite repérable.
- TypeScript, build, tests pertinents puis suite complète après build. Scans de dépendances et comparaison du lint ; aucune règle désactivée pour annoncer un succès.

## Fichiers et retour arrière
Modules prévus : questionnaire/copy/modèle, EntryMode, Field, Workspace, SameDevice et son modèle, SessionClient, LocalPdf, CSS, sources communes d’aide, tests et documentation. Pas de migration SQL prévue. Retour arrière par commit de restauration du lot et redéploiement de la version précédemment publiée, sans supprimer les dossiers ni les anciens PDF.

## Livraison
Rapport des scénarios réellement exécutés, défauts et corrections, contrôles et limites. STATUS.md et CHANGELOG.md mis à jour. Push GitHub vérifié avec arbre identique à la source testée, sauvegarde Sites puis publication autorisée de cette version. Vérifier l’état de déploiement terminal et retourner l’URL réelle. Ne pas annoncer une couverture littéralement exhaustive de toutes les combinaisons de champs.
