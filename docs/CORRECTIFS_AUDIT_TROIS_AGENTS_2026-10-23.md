# Corrections du rapport à trois agents — 23 octobre 2026

Référence : [audit version 50](AUDIT_TROIS_AGENTS_V50_2026-10-23.md). Restauration : tag `before-three-agent-fixes-20261023`, commit documentaire `2b685bb`. Code de référence publié : `2a4754419d930c8bf914cff62ca526ce42e13e9d`.

Les huit points ont reçu une correction ciblée. Aucun changement de schéma, de droit, d’abonnement, de fournisseur ou de données existantes. Pas de publication de production dans ce lot : préparation et recette en Preview, puis sauvegarde d’une version livrable.

## Résultats par point

| Point | Correction | Preuve et portée |
|---|---|---|
| A01 — quota PDF | La finalisation interne réutilise la réservation de l’action de signature qui vient d’être acceptée. Une reprise manuelle reste soumise au quota ; budget de stockage, verrou PDF, révision, comptes actifs et droits A/B restent contrôlés. | Parcours réel des services D1/R2 locaux : création, fins A/B via updateSession, préparation et deux signatures fictives donnent un PDF final avec six écritures dans la même minute. Répétition idempotente et octets identiques. Panne R2 injectée uniquement dans le test : signatures conservées, reprise limitée par quota puis réussie au renouvellement simulé du quota. |
| A02 — invitation expirée | La requête qui consomme le lien vérifie atomiquement l’existence du rapport et sa rétention, ainsi que le compte propriétaire actif. | Expiration injectée entre autorisation et UPDATE : réponse invite_invalid, participant non affecté et empreinte de l’invitation inchangée. Refus générique conservé pour ne pas divulguer le dossier. |
| A03 — création concurrente | ON CONFLICT cible seulement l’unicité propriétaire/rapport. Le concurrent récupère la session gagnante après contrôle d’accès, sans renouveler ni révéler son jeton. | Deux créations synchronisées juste avant INSERT réussissent avec le même identifiant, une seule ligne et un seul jeton retourné. Ce jeton reste utilisable. Les autres conflits et erreurs ne sont pas masqués. |
| A04 — conducteur B | L’effet de changement de dossier reprend le rôle configuré, au lieu d’imposer A. Le retour A après préparation du PDF reste intentionnel pour la séquence des signatures. | Preview fraîche : choix B + allemand → appareil commun ouvert sur B, langue DE et fiche B. Passages A/B et changements FR/EN/DE/NL sans perte des données fictives. |
| A05 — chevauchement PDF | La hauteur des libellés d’annexe dépend du nombre réel de lignes. La première ligne de valeur et le libellé restent ensemble lorsque possible ; pagination conservée pour les valeurs longues. | Instrumentation des vrais appels PDF : aucune intersection entre note et correction en FR/EN/DE/NL. Inspection visuelle des pages d’annexe concernées des quatre PDF fictifs. |
| A06 — mots coupés | Retour à la ligne commun aux annexes et à la page des signatures, par mots ; seuls les jetons trop longs pour une ligne sont découpés. Pagination de la page des déclarations si nécessaire. | Tests paragraphes, identifiants longs et notes des quatre langues ; assemblage des lignes effectivement dessinées identique à la note. Inspection visuelle des quatre pages finales. |
| A07 — choix de saisie doublé | Clés React distinctes et stables pour EntryMode et Questionnaire dans appareil commun et session partagée. La collision entre deux composants frères était la cause du doublon observé. | Avant correction, deux blocs visibles dans le DOM. Après correction, un seul bloc et un seul bouton de formulaire complet après changements A/B, langues et modes guidé/complet. Session partagée relue et compilée ; recette avec deux comptes réels encore requise. |
| A08 — photo dans le mauvais dossier | Chaque import capture une identité de contexte (dossier et côté). Tout résultat, erreur ou changement d’état tardif est ignoré si le contexte change ou si le composant est démonté. Evidence est également identifié par dossier et côté dans appareil commun. | Test du vrai gestionnaire asynchrone du composant, avec décodeur différé réservé au test : édition du même dossier fusionnée correctement ; changement de dossier, aller-retour A→B→A, changement de côté et démontage n’appliquent aucune image tardive. Pas de reproduction sur téléphone physique avec fichier lent. |

## Validation

- TypeScript : réussi sur l’état applicatif final.
- Build Sites : réussi sur l’état applicatif final ; avertissements de taille de bundle et classification de routes existants, sans erreur de compilation.
- Suite complète : **184 tests réussis, aucun échec**. Inclut contrôles des routes compilées, rendu des pages produit, isolation et permissions, consentements, invalidation et conservation des PDF.
- Sept nouveaux tests : quatre services, deux PDF, un gestionnaire photo avec cinq scénarios. Cinq contrôles fonctionnels échouent sur le code de référence antérieur puis passent sur les corrections ; le test de découpage de texte couvre en plus le nouvel utilitaire.
- Audit des dépendances de production : **aucune vulnérabilité connue retournée**. Aucun changement de dépendance. L’alerte de développement braces déjà documentée dans l’audit transversal n’est pas prétendue corrigée par ce lot.
- Diff et périmètre revus, aucune migration. Revue React : clés uniques et stables, effets bornés au dossier/côté, annulation logique des retours asynchrones, composants et imports PDF dynamiques conservés.
- Preview navigateur : rôle B/DE à l’ouverture, alternance A/B, FR/EN/DE/NL, choix guidé/complet et unicité du bloc ; données exclusivement fictives.
- PDF : quatre documents fictifs, six pages chacun ; contrôles visuels des pages 5 et 6 dans chaque langue, plus tests sur les octets signés et la conservation des versions.

## Préservation et documentation produit

Les originaux, anciennes versions, signatures existantes et PDF conservés ne sont pas réécrits. Le moteur de nouvelle génération porte une empreinte v2 pour distinguer son rendu corrigé des anciennes générations ordinaires. Les anciennes versions traduites réutilisées depuis le cache restent leurs octets historiques ; la régénération explicite existante reste le moyen de demander une nouvelle version traduite, avec ses consentements et limites habituels. Aucune nouvelle consommation IA pour l’audit ou la recette.

`entry-mode-copy.ts` explique en FR/EN/DE/NL le maintien du rôle/langue à l’ouverture et l’abandon d’un import lors d’un changement de dossier/conducteur. QuestionnaireInfo réutilise cette source dans vitrine, tarifs, compte, guide et tutoriel ; aucune fonctionnalité prévue n’est annoncée comme active. Les corrections serveur et PDF ne changent pas les commandes de signature ou les droits.

Fichiers applicatifs : `server/final-service.ts`, `server/session-service.ts`, `server/pdf-renderer.ts`, nouveau `server/pdf-text.ts`, `features/constat/same-device.tsx`, `session-client.tsx`, `evidence.tsx` et `entry-mode-copy.ts`. Tests : `tests/three-agent-services.test.mjs`, `three-agent-pdf.test.mjs`, `three-agent-evidence.test.mjs`. Documentation : présent rapport, audit initial, STATUS, CHANGELOG et TEST_PLAN.

## Limites et prochaine étape

La version publiée reste inchangée. Aucun paiement, compte réel, permission GPS/caméra, fournisseur IA ou envoi assureur testé. Les signatures des tests sont des images de fixture explicitement fictives. Le navigateur de contrôle interdit les URL blob : aucune validation intégrale de signature personnelle dans l’interface n’est revendiquée. La recette mobile physique, à deux comptes autorisés et en production, reste nécessaire ; la réussite locale n’est pas une certification juridique ni une garantie de fonctionnement à 100 %.

Retour arrière : restaurer les seuls fichiers applicatifs depuis le tag de référence et reconstruire ; aucune restauration de base nécessaire. Avant publication autorisée, relire ce rapport et conserver les données et versions historiques. Les sources sont préparées via Sites ; aucune synchronisation GitHub n’est revendiquée.

Références techniques primaires vérifiées : [React — clés uniques parmi les composants frères](https://react.dev/learn/rendering-lists), [SQLite — ON CONFLICT ciblé et DO NOTHING](https://www.sqlite.org/lang_upsert.html).
