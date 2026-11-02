# Réserves de recette — état revérifié le 1 novembre 2026

## Référence et plan

Source Sites 394692c9fc4d18747ca0ab58d83e2237678519f2, version 57 sauvegardée sans déploiement ; GitHub e678d96452bf77959f3e0af33507ba646f085d57, arbre identique 28e05becf3ec9e613a20cfa0958ab5909f5c0928. État Git initial propre et source distante concordante. Production version 56 conservée. Point de restauration before-outstanding-verification-20261101.

Lot de vérification : relancer lint et scans production/complet ; reprendre le PDF fictif en Preview ; différencier preuve de génération, récupération du fichier et test physique à deux comptes ; mettre à jour la documentation uniquement. Critère : chaque réserve est marquée validée ou ouverte avec preuve et limite. Aucun correctif de dette React globale n’est inclus ni prétendu réalisé.

## Résultats réels

| Point | État | Preuve / limite |
|---|---|---|
| Dépendances de production | Scan sans alerte | Nouveau pnpm audit --prod : 0 info, faible, modérée, élevée, critique. |
| Dépendances complètes | Réserve ouverte | Nouveau pnpm audit : 1 modérée Minimatch GHSA-g3hv-75wg-m249, développement uniquement. |
| Lint | Réserve ouverte | 43 erreurs et 61 avertissements, exit code 1. Aucun diagnostic masqué ni règle désactivée. |
| Génération PDF en Preview | Vérifiée | Brouillon fictif A/B récupéré, deux confirmations de fin, génération réelle et lien de relecture/téléchargement obtenus. |
| Récupération navigateur | Réserve ouverte | downloadMedia sur le lien réel v1 a expiré après 15 s. Aucun chemin de fichier retourné, aucun octet récupéré. |
| Deux téléphones / deux comptes réels | Non exécuté | Aucun contrôle de deux appareils physiques et de deux connexions indépendantes disponible dans cette session. |
| PDF final signé à deux comptes | Non validé en navigateur | Les tests de services ne remplacent pas une recette authentifiée réelle ; aucune signature personnelle confirmée dans cette vérification. |

La tentative de consulter chrome://downloads pour distinguer un échec de capture du navigateur d’un téléchargement déjà enregistré a été refusée par la politique de protocoles du navigateur de test (HTTP/HTTPS uniquement). Aucun contournement tenté. Ce refus et l’expiration de téléchargement ne prouvent pas que le produit échoue chez l’utilisateur. Aucune fausse validation du téléchargement final.

Le site conserve une audience custom et un visiteur externe autorisé. Cette configuration ne prouve ni une connexion effective du second compte, ni le fonctionnement du QR sur un téléphone physique. Aucun accès ajouté ou élargi.

## Vulnérabilité de développement

Avis primaire relu : https://github.com/advisories/GHSA-g3hv-75wg-m249 — déni de service par amplification de motifs, modéré, version corrigée 11.0.1. Le rapport npm signale les versions installées transitives de développement. La politique pnpm-workspace.yaml impose minimumReleaseAge: 10080 (sept jours), sans exception ajoutée. La date de publication déjà établie pour 11.0.1 est le 27 octobre à 22:26 UTC ; éligibilité le 3 novembre 2026 à 23:26 Europe/Brussels. Pas de mise à jour majeure forcée des consommateurs historiques 3/9, pas de garantie anticipée de compatibilité. Prochaine action : vérifier à cette date les versions corrigées éligibles et leurs usages, appliquer une mise à jour compatible ou une migration ciblée, puis relancer build/tests/scans. Aucune tâche planifiée automatiquement par ce rapport.

## Inventaire du lint

Répartition des 43 erreurs : 24 react-hooks/set-state-in-effect, 14 react-hooks/refs, 2 @typescript-eslint/no-explicit-any et 3 @next/next/no-html-link-for-pages. Ce sont des diagnostics de qualité du code ; ils ne constituent pas tous des pannes utilisateur reproduites. Les corriger exige des changements ciblés des cycles de vie et des contrôles de régression, sans simplement différer les setters pour faire disparaître le lint.

| Fichier | Erreurs | Avertissements | Règles en erreur |
|---|---:|---:|---|
| features/constat/admin-panel.tsx | 0 | 1 | — |
| features/constat/cloud-panel.tsx | 2 | 2 | react-hooks/set-state-in-effect |
| features/constat/entry-mode.tsx | 2 | 0 | react-hooks/refs, react-hooks/set-state-in-effect |
| features/constat/evidence.tsx | 6 | 1 | react-hooks/refs, react-hooks/set-state-in-effect |
| features/constat/final-panel.tsx | 3 | 1 | react-hooks/refs, react-hooks/set-state-in-effect |
| features/constat/invite-qr.tsx | 1 | 1 | react-hooks/set-state-in-effect |
| features/constat/join-panel.tsx | 1 | 0 | react-hooks/set-state-in-effect |
| features/constat/local-documents.tsx | 1 | 1 | react-hooks/set-state-in-effect |
| features/constat/local-pdf.tsx | 2 | 0 | react-hooks/refs, react-hooks/set-state-in-effect |
| features/constat/offer-panel.tsx | 1 | 0 | react-hooks/set-state-in-effect |
| features/constat/questionnaire.tsx | 2 | 1 | react-hooks/refs, react-hooks/set-state-in-effect |
| features/constat/refusal-panel.tsx | 2 | 0 | react-hooks/refs, react-hooks/set-state-in-effect |
| features/constat/retention-admin-panel.tsx | 1 | 0 | react-hooks/set-state-in-effect |
| features/constat/review.tsx | 0 | 1 | — |
| features/constat/same-device-model.ts | 0 | 3 | — |
| features/constat/same-device.tsx | 6 | 4 | react-hooks/refs, react-hooks/set-state-in-effect |
| features/constat/session-client.tsx | 7 | 6 | @next/next/no-html-link-for-pages, @typescript-eslint/no-explicit-any, react-hooks/refs, react-hooks/set-state-in-effect |
| features/constat/signature-pad.tsx | 0 | 2 | — |
| features/constat/sketch-panel.tsx | 0 | 2 | — |
| features/constat/storage-panel.tsx | 0 | 1 | — |
| features/constat/storage.ts | 0 | 1 | — |
| features/constat/translation-options.tsx | 1 | 2 | react-hooks/set-state-in-effect |
| features/constat/tutorial.tsx | 1 | 0 | react-hooks/set-state-in-effect |
| features/constat/workspace.tsx | 2 | 4 | @next/next/no-html-link-for-pages, react-hooks/set-state-in-effect |
| features/marketing/landing.tsx | 1 | 2 | react-hooks/set-state-in-effect |
| server/participant-progress.ts | 0 | 2 | — |
| server/pdf-renderer.ts | 0 | 1 | — |
| server/report-service.ts | 1 | 0 | @typescript-eslint/no-explicit-any |
| server/session-service.ts | 0 | 1 | — |
| server/sketch-service.ts | 0 | 1 | — |
| tests/audit-013-probes.mjs | 0 | 10 | — |
| tests/collaboration.test.mjs | 0 | 1 | — |
| tests/document-extraction.test.mjs | 0 | 1 | — |
| tests/document-worker.test.mjs | 0 | 7 | — |
| tests/translation.test.mjs | 0 | 1 | — |

## Protocole à deux téléphones — à exécuter, non coché

Utiliser deux comptes distincts déjà autorisés au site, chacun connecté sur son téléphone. Employer uniquement un dossier intitulé TEST FICTIF, sans personnes ni sinistre réels. Ne pas utiliser deux onglets d’un même compte comme preuve.

1. Téléphone A : choisir deux conducteurs/deux smartphones, lettre A et FR ; saisir les faits fictifs et créer le lien/QR. Vérifier la connexion de chaque compte sans communiquer leurs mots de passe.
2. Téléphone B : scanner le QR, rejoindre avec son propre compte et choisir DE. Vérifier la lettre B, les faits communs lisibles et l’impossibilité de modifier la partie A.
3. A et B : remplir des preneurs distincts des conducteurs, immatriculations et assurances fictives, circonstances confirmées ; enregistrer chaque partie. Vérifier que les modifications de B apparaissent chez A après actualisation, sans effacer une saisie locale non envoyée.
4. Tenter un lien déjà utilisé puis expiré dans une recette isolée ; vérifier le refus sans accès à un autre dossier. Ne pas modifier artificiellement l’horloge des téléphones pour simuler la sécurité serveur.
5. Confirmer chaque fin de partie, préparer et ouvrir le PDF de relecture. Vérifier toutes les données des deux côtés et la langue des annexes.
6. La validation de signature doit être personnelle et explicitement limitée au document fictif de recette. Ne jamais signer à la place de l’autre participant ni un constat réel pour tester.
7. Télécharger le PDF final sur chaque téléphone. L’ouvrir depuis le gestionnaire de fichiers local, puis le rouvrir sans dépendre du lien de session. Vérifier taille non nulle, deux signatures fictives attendues, données, nombre de pages et absence de champs tronqués. Cette étape seule valide la récupération du fichier.
8. Corriger une déclaration et vérifier l’invalidation des confirmations/signatures en cours, la conservation de la version précédente et l’exigence de nouvelles confirmations.
9. Noter pour chaque étape appareil, version OS/navigateur, comptes A/B distincts (sans secrets), date, résultat, capture utile et nom/taille du fichier réellement ouvert.

## Fichiers et contrôles du présent lot

docs/VERIFICATION_RESERVES_2026-11-01.md, STATUS.md, CHANGELOG.md et TEST_PLAN.md seulement. Guide vérifié, aucun impact utilisateur : documentation de recette uniquement, aucun libellé, commande, droit ou comportement modifié. Pas de nouvelle revue responsive ni de nouvelle certification globale. Build/TypeScript et 215 tests du code inchangé restent les preuves du lot précédent ; ils ne sont pas présentés comme réexécutés ici. git diff --check du lot documentaire doit passer. Aucun déploiement de production.
