# Recette de remplissage et simplification — 1 novembre 2026

## Objectif et référence
Cahier exécutable : PROMPT_REMPLISSAGE_RAPIDE_2026-11-01.md. Référence Sites 55 / a01a8d6 ; restauration before-fast-completion-20261101. Demande du propriétaire : remplissages fictifs représentatifs, vérification/correction des contraintes, saisie lisible et rapide, puis publication autorisée. Aucun pourcentage de couverture exhaustive ni durée garantie de remplissage n’est revendiqué.

## Changements livrés
- Réglages de rôle/langue/Express repliés ; accès au formulaire complet conservé et retour au guidé disponible. Titres courts par sujet ; rubrique n/N et barre de position, distinctes de la validité du dossier.
- Champs invalides signalés avec aria-invalid ; défilement/focus vers le premier champ, groupe ou message à corriger. Actions de suite visibles au bas du questionnaire sur mobile.
- Fin locale guidée directement vers relecture/PDF. Photos/croquis accessibles séparément, toujours facultatifs. Les compléments vides sont repliés en relecture à l’écran ; les données, le détail consultable et l’impression intégrale restent conservés.
- Sur appareil commun, fin guidée = confirmation réelle du côté ; A doit aussi avoir des faits communs valides. Passage automatique A→B ; deux confirmations ouvrent la préparation du document, sans nouvelle saisie du même formulaire. Les corrections continuent d’invalider les confirmations selon les empreintes existantes.
- En session partagée, le bouton de fin appelle persist(true) et n’ouvre la relecture que si le serveur confirme la fin sans modification concurrente. Le bouton de photos reste accessible ; aucun droit, paiement, quota ou consentement IA remplacé par de l’interface.
- Aperçu local incomplet signalé, nom de téléchargement marqué INCOMPLETE ; aucun statut signé inventé. Message spécifique pour le nombre maximal de photos et conservation des originaux après refus d’un lot.
- Export à un véhicule : la fiche B inactive et ses photos attribuées ne sont plus dessinées ni incorporées dans le JSON du PDF. Le brouillon original reste intact et récupérable en revenant à deux véhicules. Les photos non attribuées restent communes. Exception préservée pour une déclaration unilatérale explicite. Empreinte du moteur PDF v3 ; anciennes copies et PDF signés non modifiés.
- Guide, tutoriel, aides communes, vitrine/tarifs/compte synchronisés via quick-flow-copy / QuestionnaireInfo en FR/EN/DE/NL.

## Scénarios réellement exécutés
| Parcours / contrainte | Données et actions | Résultat |
|---|---|---|
| Solo guidé, 1 véhicule | 12 rubriques, date/heure natives 30/10/2026 12:20, lieu TEST FICTIF, conducteur A et assuré DISTINCT, BMW, TEST-A-001, police fictive, email example.invalid, récits fictifs, cas 1 confirmé, témoins fictifs | Tous les champs requis passent ; fin ouvre directement la relecture ; génération du PDF et liens réels affichés. |
| Réponses manquantes / blessés | Continuer sans réponse ; Oui aux blessés puis Non | Erreur explicite et blocage ; aucun Non prérempli ; sortie amiable bloquée en cas de blessés. |
| Email / circonstances | Email invalide puis correction ; 17 cases non confirmées puis case 1 et confirmation | Refus puis poursuite, aria-invalid vérifié. Le nom déjà saisi reste conservé. |
| Date/heure | Champs natifs remplis et validés ; cas impossibles/futurs/heure 25:00 exercés dans les tests de règles | Les valeurs valides passent. Le remplissage Playwright des dates ne notifiait pas le contrôle React dans cet environnement : utilisation de la saisie native, sans mutation d’état interne. |
| Appareil commun A/B | Reprise d’A depuis le même constat ; ajout pays BE et remorque fictive FR ; confirmation A ; saisie B indépendante, DAF, TEST-B-002, autre assureur/police, cas 8 confirmé | A terminé, passage B ; B terminé ; bouton Préparer PDF actif ; génération réelle et écran de relecture/signature A affichés. Pas de re-saisie des champs déjà validés. |
| Photos | PNG de test créé explicitement, importé par le vrai sélecteur ; lot de quatre images ensuite | Photo attribuée A et sauvegarde locale ; lot refusé ; une photo conservée ; message 3/côté, 6/constat vérifié après correction. |
| Mobile 375 px | Vrai formulaire dans iframe temporaire, pas une reproduction ; champs requis manquants ; FR/EN/DE/NL | Largeur défilante 360 px < viewport 375 ; bouton Continuer 48 px de haut ; focus sur FIELDSET aria-invalid=true dans la zone visible ; titres localisés sans débordement. Iframe temporaire retirée des sources. |
| PDF : 24 variantes | FR/EN/DE/NL × clavier/bleu/noir × 1/2 véhicules, moteur réel | Documents analysables ; faits A conservés ; B présent uniquement à deux véhicules ; contrôle du texte dessiné et du JSON réellement incorporé. Source de saisie inchangée. |
| Photos B dans PDF à 1 véhicule | Photo PNG valide attribuée B dans le brouillon | Aucune photo B incorporée ; une seule pièce jointe de données expurgées ; photo B toujours dans le brouillon. |
| Régression reproduite avant correction | Version de référence avec count=1 et nom B fictif resté dans le dossier | Le nom B était dessiné dans le PDF. Les nouveaux tests démontrent son absence après correction. |
| Sessions / documents / signatures / refus / accès / concurrence | Suites existantes de vrais services D1/R2/Worker locaux avec identités et fournisseurs synthétiques de test uniquement | Appartenances, limites, confirmations, gel, signatures fictives, anciennes versions et refus anonymes restent couverts. Pas d’identité injectée dans le produit. |

## Contrôles finaux
- TypeScript et build Sites réussis.
- **200 tests réussis, zéro échec**, suite complète exécutée après le build. Huit nouveaux tests (dont deux matrices PDF) ; harnais Evidence actualisé pour charger la nouvelle source de texte, sans affaiblir le test d’import différé.
- Scan dépendances : zéro alerte de production ; une alerte modérée de développement Minimatch, correctif encore sous délai de sept jours. Aucune dépendance ni exception de politique ajoutée dans ce lot.
- Lint : 45 erreurs / 61 avertissements historiques, aucun nouveau diagnostic ; une erreur du harnais de test supprimée en renommant sa variable locale. Le lint global reste non réussi.
- Diff contrôlé ; aucun schéma SQL, secret, rôle ou accès commercial modifié.

## Limites exactes
Le téléchargement blob a été déclenché dans le navigateur de contrôle mais l’attente du fichier a expiré ; aucun fichier téléchargé n’est présenté comme vérifié de bout en bout. La génération et les liens sont prouvés dans l’interface, le contenu par le moteur réel et les tests PDF. Pas de confirmation de signature personnelle dans le navigateur : tests de signatures fictives dans les services uniquement. Deux comptes ChatGPT hébergés et deux téléphones physiques, GPS/caméra, extraction IA réelle et paiements réels ne sont pas exercés ici. Les fonctions Premium restent fermées au public comme auparavant. Le PDF complet peut comporter des annexes ; aucune suppression pour prétendre garantir une seule page.

Publication : autorisation explicite reçue dans cette demande. Déployer la source validée après push GitHub et sauvegarde Sites ; conserver l’audience custom. Vérifier le résultat terminal du déploiement. Ne pas assimiler cette recette représentative à toutes les combinaisons possibles de champs ou à une certification.
