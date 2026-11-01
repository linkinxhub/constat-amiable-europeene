# Audit du constat, des pièces et du croquis — 23 octobre 2026

## Verdict

Le transfert des données documentaires validées vers les cases du constat fonctionne. Le produit reste à compléter et à valider avant un usage réel généralisé : l'export standard n'applique pas la demande d'une page unique, un PDF de relecture incomplet est téléchargeable, et le croquis IA réel n'a pas encore été testé de bout en bout avec deux identités.

Aucun nouveau défaut critique reproduit dans les contrôles exécutés. Cela ne constitue ni une garantie de sécurité complète, ni un pentest indépendant, ni une validation juridique du constat.

## Référence, méthode et préservation

Site publié v52, audience custom conservée ; source de référence 3474215d881afae8b4e5637b8efa126cfeb21641. Les notes INTEGRATION_CONSTAT.md, STATUS.md et CHANGELOG.md déjà présentes en travail local sont préservées. Aucun code applicatif, secret, rôle, abonnement, sinistre ou PDF utilisateur modifié ; aucune publication dans cet audit.

Périmètre : PDF fourni, modèle et rendu PDF, saisie Express, intégration des champs, parcours local/appareil commun/session A/B, autorisations serveur, consentements IA, croquis et finalisation, stockage/rétention, tests et dépendances. Lecture des instructions et documents du projet ; inspection source, tests automatisés, compilation, lecture et rendu du PDF, contrôle de la page navigateur sur ordinateur.

Le PDF fourni est lu depuis sa copie attachée courante. Une page A4, 411553 octets ; aucun champ AcroForm, aucune annotation. Les 14 valeurs attendues des derniers imports sont présentes sur sa page, notamment plaques, véhicules, assureurs, polices, preneurs, identité A et dates. Le document est statique : l'absence de champs interactifs n'est pas un défaut de remplissage. Son rendu a été inspecté.

Les cinq appels documentaires réels réussis du tour précédent sont des preuves antérieures, conservées dans EXTRACTION_REELLE.md ; ils n'ont pas été relancés. Aucun appel fournisseur supplémentaire, aucune dépense IA pendant l'audit. Les réponses fournisseur des tests automatisés sont synthétiques et ne prouvent pas la qualité de reconnaissance réelle.

## Écarts confirmés et actions proposées

P2 = écart fonctionnel ou risque de confusion à traiter avant ouverture générale ; P3 = amélioration de diagnostic ou de présentation. Les limites de recette sont séparées des défauts.

| ID | Priorité | Constat et preuve | Action et critère d'acceptation |
| --- | --- | --- | --- |
| AUD-01 | P2 | La demande d'export sur une seule page n'est pas implantée dans la plateforme. pdf-renderer.ts ajoute les annexes ; le dernier export navigateur complet avait quatre pages. Les PDF d'une page remis sont des copies préparées séparément, pas un nouveau réglage utilisateur. | Ajouter un mode explicite une page. Toutes les valeurs retenues doivent tenir et rester lisibles ; si elles dépassent, annoncer le problème et proposer une solution avant export. Ne pas simplement couper les annexes de tous les dossiers : des valeurs longues, traductions, photos et mentions pourraient disparaître. Préserver les PDF déjà gelés. |
| AUD-02 | P2 | LocalPdf permet de préparer un PDF avec des champs manquants (seul injured=yes le désactive). Reproduit dans le parcours précédent ; le fichier ouvert manque date/heure/lieu, identité B, circonstances, croquis et signatures. La page porte document non signé, sans repère visible incomplet. Le panneau de complétude du site signale les manques. | Distinguer nettement aperçu incomplet et document prêt. Afficher les manques et marquer le PDF incomplet. Les PDF serveur finalisables doivent conserver leurs contrôles de complétude et fins A/B. Un aperçu incomplet peut rester utile, mais doit être identifiable après téléchargement. |
| AUD-03 | P2 | Le croquis IA est réservé au parcours partagé. LocalPdf et SameDevice passent sketch:null au rendu ; AiPanel utilise une session et les consentements A/B. Le simple import d'une pièce ou d'une image dans le parcours local ne génère donc pas un croquis IA. | Clarifier le parcours dans l'interface ; si le croquis IA est souhaité sur appareil commun/local, concevoir et tester ses consentements et sa validation propres sans contourner ceux du partagé. Critère : photo adaptée + récits + consentements + proposition + approbations + dessin dans la case13, dans chaque parcours effectivement annoncé. |
| AUD-04 | P3 | extractDocument convertit les erreurs fournisseur, délais et sorties invalides en document_failed ; l'interface les regroupe en échec générique, hors quotas. Constat source, pas nouvel échec réel reproduit. | Ajouter des diagnostics sûrs et localisés : délai, service indisponible, clé/modèle/quota fournisseur, document illisible ou réponse invalide. Ne jamais exposer clé, corps d'erreur fournisseur ou données privées. Tester chaque branche. |
| AUD-05 | P3 | La copie jointe contient une seule page, mais le fond du formulaire affiche Feuillet1/2. Ambiguïté visuelle confirmée ; cela ne signifie pas qu'une seconde page existe dans le fichier. | Gérer explicitement le repère de pagination du mode une page, en préservant les mentions utiles du modèle. Contrôler visuellement après export et signature. |

Les champs absents ne sont pas à attribuer à une perte OCR : les faits d'accident ne sont pas des données des pièces ; l'identité B n'a pas fait partie des cinq analyses. Ne pas inventer les informations manquantes pour rendre le formulaire visuellement complet.

## Ce qui est protégé et vérifié

- Les propositions sont distinctes des valeurs appliquées. La relecture et la sélection précèdent l'application. Les champs modifiés pendant la relecture sont protégés contre l'écrasement ; types de pièces et conducteur/preneur/remorque séparés.
- DocumentImport met à jour le véhicule courant du report ; LocalPdf reçoit ce report et referencePage place les valeurs dans les cases. Vérification réelle antérieure jusque dans le PDF et contrôle des 14 valeurs du fichier joint répété ici.
- Accès privé : identité serveur, refus anonymes et de comptes suspendus, autorisations A/B, vérification d'origine et d'intention, limites de flux et révisions. Les tests incluent le Worker compilé ; aucune identité de production fabriquée.
- Le serveur refuse la préparation partagée si le dossier est incomplet ou si les deux parties ne sont pas terminées. Les marques de relecture locales ne valent ni identité ni signature.
- Consentements IA séparés, liés à la révision ; croquis IA utilisable au PDF partagé seulement après approbation A/B. Signature sur le PDF de relecture figé ; nouvelles données exigent une nouvelle version. Tests de concurrence, quotas, échecs R2 et réponse perdue inclus.
- Accès Express ordinaire toujours fermé côté serveur. Aucun achat client réel activé par les résultats des tests ou par l'affichage Premium.
- Conservation : expiration calculée en mois calendaires et contrôle d'accès après échéance. Les nettoyages locaux/serveur dépendent de l'activité annoncée ; ce n'est pas une purge physique indépendante à heure garantie. Copies téléchargées hors contrôle du site.

## Résultats techniques de ce tour

| Contrôle | Résultat |
| --- | --- |
| Installation selon verrou de dépendances | Réussie ; paquets réutilisés |
| TypeScript, tsc --noEmit | Réussi |
| Build Sites | Réussi ; avertissement Vinext de classification statique des routes, pas un échec |
| node --experimental-strip-types --test tests/*.test.mjs | 186 réussis, 0 échec, 0 ignoré, 0 annulé ; environ28,3s |
| Audit dépendances production | 0 alerte sur le scan actuel |
| Audit dépendances complet | 1 alerte high sur braces <=3.0.3, épuisement de pile par motifs profondément imbriqués ; aucune version corrigée indiquée par le scan |
| PDF fourni | 1 page A4, 14/14 valeurs attendues retrouvées, rendu inspecté, aucune annotation/AcroForm |
| Page actuelle dans le navigateur, ordinateur | Pas de débordement horizontal : document1348px pour viewport1363px |
| Diff | Contrôle whitespace réussi ; modifications documentaires seulement |

L'alerte braces concerne le graphe de développement, pas le scan de production. Elle doit rester suivie ; le scan ne prouve pas l'exploitabilité du site. Pas de modification automatique du verrou dans ce lot d'audit.

## Limites de validation restantes

1. Croquis IA réel sur image avec deux identités authentifiées, approbations A/B et résultat PDF : non réalisé. Le test de lecture de documents ne le valide pas.
2. Deux comptes réels sur deux téléphones, concurrence réseau et reprise après déconnexion : non validés dans ce tour. La recette des services locaux à deux agents reste distincte.
3. Pièces officielles, photos floues/manuscrites, JPEG/PNG/WebP, toutes catégories documentaires et autres langues : les cinq essais réels précédents couvrent seulement les PDF pédagogiques lisibles décrits.
4. Mobile physique, GPS/caméra réels, lecteur d'écran et audit d'accessibilité complet : non réalisés. Le contrôle de largeur ordinateur n'est pas une recette mobile.
5. Paiement réel, droit Premium commercial, réception assureur, opposabilité de signature, sauvegarde/restauration après incident et pentest indépendant : aucune nouvelle validation revendiquée.

## Ordre de correction recommandé

1. Implémenter le mode une page sans perte silencieuse, et marquer les aperçus incomplets.
2. Tester puis préciser le parcours réel du croquis ; ne pas l'annoncer comme disponible automatiquement dans tous les modes.
3. Améliorer les erreurs documentaires et tester les pièces difficiles.
4. Recette avec deux comptes/appareils, mobile, quatre langues et interruption réseau, puis revue avant ouverture commerciale.

Guide, tutoriel et aides relus contre les chemins concernés : aucun impact utilisateur dans ce lot de consignation, aucune nouvelle fonction annoncée. Les futures corrections visibles devront actualiser ensemble interface, aide et tutoriel FR/EN/DE/NL.

Le PDF attaché conserve sa même identité et son contenu ; audit uniquement, aucune correction ou publication annoncée.
