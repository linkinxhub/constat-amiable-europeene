# Accordia — recette des lots publiés 0.14 à 0.17

État : scénarios préparés, essais réels non exécutés. Utiliser des données fictives, deux comptes réellement autorisés et deux téléphones. Ne pas injecter d’identité ni signer à la place d’un conducteur. Toute dépense fournisseur doit correspondre à un essai explicitement consenti.

| Parcours | Manipulation | Résultat attendu |
|---|---|---|
| Invitation | A crée le lien, B rejoint avec son propre compte | Même dossier ; chacun édite uniquement son côté |
| Saisie concurrente | A et B modifient leur partie ; vérifier un conflit de sauvegarde | Aucune saisie locale effacée, conflit expliqué |
| Session inchangée | Ajouter des photos, laisser la page visible sans modification | Vérifications légères ; aucune retransmission périodique des photos |
| Onglet masqué | Masquer puis réafficher la session | Rafraîchissement principal suspendu puis repris au prochain intervalle |
| Fin A/B | Terminer A seulement, puis B | Préparation finale bloquée jusqu’aux deux confirmations |
| Correction | Modifier les faits communs après confirmations | Confirmations invalidées, nouvelle validation nécessaire |
| Traduction | Consentements séparés, préparation DE puis FR | Originaux conservés, chaque document demande les deux signatures |
| Régénération | Refaire une traduction | Nouveau PDF, ancien conservé, aucune signature recopiée |
| Téléchargement | Télécharger deux langues et deux générations | Noms distincts avec session, langue, révision, style et statut |
| Capacité | Consulter le compteur et une session de test remplie | Compteur fidèle ; aucune suppression automatique ni promesse de nouvelle version au-delà de 20 |
| Stockage | Récupérer un compte de test avec plusieurs lots | Message Continuer tant qu’il reste du travail ; historique et signatures conservés |
| Fournisseur réel | Avec accord, essayer une génération de chaque type | Résultats relus humainement ; erreur exploitable sans perte des saisies |

Le plafond de 100 appels se vérifie par tests locaux, pas en consommant volontairement 100 appels réels. Les tests automatiques incluent concurrence D1 et absence de fetch au plafond.

## Dépendances — prochain passage
Après le 21 septembre 2026 à 16:38:44 UTC, vérifier les correctifs image-size 2.0.4, leur compatibilité Vinext et l’éligibilité pnpm sans exception. Mettre à jour seulement la dépendance concernée avec le flux d’installation du projet, inspecter le lockfile, relancer le scanner et les vérifications, passer en aperçu puis attendre l’autorisation de publication. Ne pas qualifier les alertes de résolues avant preuve.

## Preuves à consigner
Pour chaque scénario : date, version, comptes de test, appareils, résultat, anomalie et capture sans données sensibles. La restauration d’infrastructure et la validation pays/assureurs restent des chantiers distincts.

## Complément 0.18–0.19 — préparé, non exécuté en production
| Parcours | Manipulation au signal du propriétaire | Résultat attendu |
|---|---|---|
| Refus | Préparer une déclaration unilatérale dans chacun des trois parcours | Document distinct, marqué non signé ; aucune signature commune copiée |
| Offre | Choisir chacune des quatre préférences puis recharger le compte | Choix conservé, aucun paiement ni privilège accordé |
| Expiration | Utiliser uniquement un environnement isolé et des dossiers fictifs expirés | Lecture et écriture refusées ; un dossier actif reste accessible |
| Maintenance | Dans cet environnement isolé, déclencher de l’activité authentifiée | Lot borné, suppression des seuls objets expirés identifiés, compteur cohérent |
| Incident | Simuler une panne R2 dans l’environnement isolé puis rétablir le service | File conservée, reprise sans double remboursement ; parcours conducteur maintenu |
| Administration | Comparer un compte ordinaire et le super-administrateur | Suivi interdit au compte ordinaire ; aucune donnée de sinistre dans le suivi |

Ne pas modifier l’horloge ni les échéances de vrais dossiers pour tester la purge. Ne pas assimiler ces scénarios préparés à une recette réalisée.

## Conditions restantes de finalisation commerciale
- Planificateur : disposer d’un déclencheur serveur pris en charge par l’hébergement, avec identité de service limitée, journal d’exécution et reprise. Les automatisations conversationnelles disponibles ne constituent pas ce déclencheur.
- Offres : confirmer le prix par dossier, le prix et la périodicité de l’abonnement particulier, le mode de facturation flotte et les quotas inclus. Aucun montant inventé.
- Paiement : raccorder le compte marchand réel, valider webhooks signés et idempotence en environnement de test, protéger les droits côté serveur avant activation réelle.
- Conservation : clarifier les sauvegardes hébergeur et les objets historiques non attribuables avant toute garantie de suppression complète.
- Recette réelle : reste suspendue au signal explicite du propriétaire, indépendamment de la publication déjà effectuée.
