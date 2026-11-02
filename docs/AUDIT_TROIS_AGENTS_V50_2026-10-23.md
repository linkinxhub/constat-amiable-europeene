# Audit du parcours constat — trois agents — 23 octobre 2026

Suivi : les huit points ont été corrigés et testés dans une version préparée, sans publication de production. Voir [le rapport de corrections et ses limites](CORRECTIFS_AUDIT_TROIS_AGENTS_2026-10-23.md). Les observations ci-dessous décrivent l’état initial de la version 50 et sont conservées pour traçabilité.

Base : version publiée 50, commit 2a4754419d930c8bf914cff62ca526ce42e13e9d. Audit sans correction applicative ni publication. Données entièrement fictives, aucun assureur contacté.

## Verdict

La génération d’un document final est développée et fonctionne dans les tests locaux, mais la plateforme ne peut pas être déclarée opérationnelle à 100 %. Un défaut de quota peut empêcher temporairement la finalisation partagée après enregistrement des deux signatures. Les problèmes ci-dessous nécessitent une correction et une nouvelle recette avant validation générale.

## Répartition et preuves

- Agent saisie : questionnaire, données, GPS, listes, reprise et appareil commun ; 60 exécutions de tests réussies.
- Agent collaboration : invitations, rôles, concurrence et services D1/R2 locaux ; 21 exécutions de tests réussies, plus trois reproductions de défauts.
- Agent PDF : document figé, signatures, invalidation, conservation et téléchargements ; six exécutions de tests réussies. PDF synthétique de six pages généré avec les fonctions réelles renderPdf/stampPdf et inspecté visuellement.
- Coordinateur : parcours navigateur en prévisualisation supervisée, saisie des faits et des deux fiches fictives, circonstances, relecture, confirmations A/B et préparation du PDF. Le PDF est proposé en lien et un tracé de test est accepté par le pavé de signature.

Les 87 exécutions des agents comprennent des ensembles recoupés : ce ne sont pas 87 tests uniques. Leur réussite ne couvre pas les défauts découverts par les sondes complémentaires. Aucun nouveau build nécessaire pour cet audit documentaire ; aucun fichier applicatif modifié.

## Défauts confirmés

| ID | Priorité | Problème et impact | Reproduction / source | Correction recommandée |
|---|---|---|---|---|
| A01 | P1 | Finalisation partagée rapide rejetée avec HTTP 429 après persistance de la seconde signature. Les deux signatures existent mais le PDF final manque. | Dans la même minute : écriture initiale, fin A, fin B, préparation, signature A, signature B. La finalisation interne réserve une septième écriture pour un quota de six. D1 : signedA=1, signedB=1, finalReady=0. server/report-service.ts et server/final-service.ts. | Ne pas facturer la finalisation interne comme une nouvelle action utilisateur ; tester le parcours avec les véritables validations A/B. Vérifier reprise et idempotence après erreur. |
| A02 | P2 | Une invitation à un rapport expiré est acceptée et consommée, puis toute lecture échoue 410. | D1/R2 local : expiration de rétention entre invitation et acceptation. participant_b affecté et jeton consommé, readSession refuse ensuite retention_expired. server/session-service.ts, joinSession. | Vérifier la rétention avant de consommer l’invitation, avec protection atomique contre la course. |
| A03 | P2 | Deux créations simultanées d’une session pour le même rapport produisent une erreur serveur brute sur l’une. | Deux createSession simultanés : UNIQUE shared_sessions.owner_id, shared_sessions.report_id. server/session-service.ts. | Rendre la création idempotente et traiter explicitement le conflit concurrent. |
| A04 | P2 | Démarrer comme conducteur B ouvre le mode appareil commun sur A, avec sa langue. | Reproduit dans le navigateur : choisir B puis « Deux conducteurs sur cet appareil ». same-device.tsx initialise selon ownerSide mais son effet [report.id] impose setSide(0). | Réinitialiser depuis le rôle du rapport à son changement ; conserver le retour A intentionnel lors de la préparation du PDF. |
| A05 | P2 | Chevauchement de la note sur la signature et du texte « Pour corriger… » dans l’annexe PDF. | PDF fictif standard FR, page 5. server/pdf-renderer.ts, entry() avance de 15 points après un libellé multilignes sans tenir compte de sa hauteur. | Calculer la hauteur réelle du libellé et réserver la place de la valeur, avec saut de page si nécessaire. |
| A06 | P3 | Coupure au milieu des mots dans la déclaration finale PDF. | Page 6 : « qualifiée » coupé en « q » / « ualifiée ». stampPdf/block dans server/pdf-renderer.ts découpe caractère par caractère. | Utiliser un retour à la ligne par mots, puis tester les quatre langues et textes longs. |
| A07 | P3 | Deux blocs identiques de choix saisie guidée/express apparaissent en mode appareil commun guidé. | Snapshot navigateur : deux titres et deux boutons « Préférer le formulaire complet ». Vérification DOM : les deux boutons ont des rectangles visibles, sans ancêtre [hidden]. Les deux statuts d’accès peuvent différer pendant le chargement. Cause précise non isolée. | Reproduire dans une session fraîche et supprimer le rendu redondant ; vérifier l’hydratation et la navigation entre vues. |

A01 est temporaire : les signatures restent enregistrées et un bouton de reprise existe après renouvellement du quota. L’erreur reste problématique car elle survient après une action effectivement persistée et impose un rafraîchissement/reprise. Ce n’est pas une perte démontrée des signatures.

## Risque reproduit en test isolé, à confirmer dans le navigateur

**A08 — P2 : import de photo susceptible de changer de dossier.** Le vrai composant Evidence, transpilé en mémoire avec importPhoto différé, est rendu sur report_A, puis sur report_B avant résolution. Résultat : photo TEST_from_A.png appliquée à report_B (crossReportImport:true). Evidence utilise current.current au retour asynchrone ; SameDevice conserve sa clé liée au seul côté. Aucun scénario navigateur avec un fichier réellement lent n’a été exécuté. Capturer/vérifier report.id au retour de l’import et identifier le composant par report.id + côté ; ajouter une régression de changement de dossier pendant import.

## Vérifications positives et limites

La saisie guidée accepte les faits communs puis les deux fiches, préserve conducteur et preneur distincts, propose les listes de marques et d’assureurs, affiche les 17 circonstances et demande leur confirmation. Le constat fictif complet est reconnu comme tel par le panneau de complétude ; les confirmations A/B permettent de préparer le PDF en mode appareil commun. Les tests contrôlent aussi isolation des rôles, révisions concurrentes, suspension pendant écriture, consentements, invalidation après modification, conservation des versions et noms de téléchargement.

Un PDF incomplet du parcours local est explicitement présenté comme brouillon non signé : sa génération n’est pas classée ici comme défaut de finalisation.

La saisie native date/heure par la commande de remplissage du navigateur de contrôle n’a pas persisté ; la frappe dans les segments natifs a fonctionné et le parcours a continué. Ce comportement n’est pas attribué au produit faute de reproduction utilisateur indépendante.

Le navigateur de contrôle interdit l’observation des URL blob. Le lien PDF a ouvert un onglet, mais son contenu n’a pas pu être relu dans ce navigateur ; aucune confirmation personnelle de signature n’a donc été soumise dans l’interface. Le document final de six pages avec signatures fictives provient du test séparé des fonctions PDF ; il ne prouve pas un parcours navigateur intégral jusqu’au téléchargement final.

Non validés : deux comptes réels en production, téléphones physiques, réseau mobile dégradé, permissions GPS/caméra, fournisseur IA réel, paiement, réception par un assureur et valeur juridique/acceptation du document. Aucun contournement d’authentification ou de restriction navigateur. La saisie express reste indiquée « Bientôt disponible » pour l’accès anonyme testé.

Les limites déjà connues (stockage local non chiffré par l’application et accessible au navigateur, rétention, modèle de référence français, absence d’envoi assureur automatique) ne sont pas présentées comme corrigées par cet audit.

## Suite recommandée

Corriger A01 en premier, puis A02–A05 et sécuriser A08. Corriger A06/A07. Ajouter les reproductions aux tests de régression, vérifier le PDF FR/EN/DE/NL et refaire un parcours complet avec deux comptes autorisés sur appareils distincts. Guide vérifié : aucun changement produit dans ce lot documentaire ; aucune explication de fonctionnalité modifiée. Les instructions utilisateur et le tutoriel devront être synchronisés si les corrections changent le parcours.
