# Master audit Accordia — version 88

Date : 4 novembre 2026. Demande : audit complet, sans correction fonctionnelle ni nouvelle publication. Source publiée : `b82701ef7cc9e5d381fbe1fea34a69eb8a2e713d`. Checkout audité : `8df9c600482b4a283ca67c43fc350ba16d29fa02` (documentation postpublication uniquement). Dépôt initial propre, source canonique ouverte et synchronisée. Audience custom conservée. URL : https://accordia-constat.adil-btp.chatgpt.site/ . AGENTS, PRODUCT_SPEC, ARCHITECTURE, ROADMAP, STATUS, DECISIONS et TEST_PLAN consultés.

## Verdict

Les mécanismes principaux testés fonctionnent et aucun défaut critique exploitable n’a été démontré dans ce périmètre. L’ouverture commerciale générale n’est pas validée : la recette physique A/B, la preuve d’exploitation des sauvegardes et les paiements réels restent ouverts. Ce rapport constitue une revue de code, des tests et une recette navigateur bornée ; il ne constitue ni un pentest ni une certification de conformité.

Deux écarts directement reproductibles sont prioritaires : la commande de vérification épuise la mémoire en parcourant des fichiers temporaires ; les quatre messages de quota annoncent 1 210 Mio au lieu des 128 Mio imposés par le serveur. Les réserves média et exploitation précédentes restent ouvertes. Aucun code applicatif, rôle, abonnement, configuration ni donnée serveur modifié pour cet audit.

## Résultats vérifiables

| Contrôle exécuté | Résultat et limite |
|---|---|
| TypeScript | Réussi, `tsc --noEmit`, dans les deux lancements de verify |
| Commande `npm run verify` | Échec à ESLint : épuisement V8. Reproduit avec heap 4 096 Mio. Ne pas déclarer cette commande verte |
| ESLint des sources | 0 erreur, 53 avertissements, avec exclusions supplémentaires `.sites-runtime` et `.wrangler` ; mêmes règles, aucun avertissement supprimé |
| Build | `npm run build` réussi, lancé séparément après l’échec de verify |
| Suite complète après build | 329 tests, 329 réussis, 0 échec, 0 ignoré |
| Audit pnpm production | 0 alerte connue ; 280 dépendances comptées |
| Audit pnpm complet | 1 alerte modérée de développement, 0 élevée/critique ; 799 dépendances comptées |
| Secrets suivis | 574 fichiers texte scannés ; 3 correspondances examinées, toutes des clés explicitement synthétiques de tests. 1 gros fichier exclu ; historique Git non scanné. Aucune clé réelle confirmée dans cet échantillon |
| HTTP sans session | 7 routes renvoient le portail d’accès de l’hébergement en 401 HTML ; cache no-store, referrer no-referrer. Ces réponses ne permettent pas de conclure sur les en-têtes applicatifs authentifiés |
| Navigateur publié | Vitrine chargée, limites Premium visibles ; constat → sécurité → choix solo → questionnaire, sauvegarde locale, champs obligatoires et blocage blessés confirmés |
| Langues publiées | EN/DE/NL/FR sur le questionnaire, rubrique et fuseau Europe/Brussels conservés ; retour à la sécurité sans perte du choix Non. Aucun champ d’identité personnelle renseigné |
| Invitation publiée | URL d’une origine externe refusée avant navigation, message explicite ; caméra non déclenchée |
| Responsive | Réutilisation explicite de la recette prépublication de cette même v88 : 4 langues × 375/768/1280/1440, menu/FAQ et titres sombres vérifiés ; pas une nouvelle recette mobile complète dans cet audit |

Les 53 avertissements se répartissent en 29 variables inutilisées, 14 dépendances de hooks, 7 usages img et 3 navigations internes via location.assign. Leur existence n’est pas une preuve de défaut fonctionnel ; les dépendances de hooks demandent une revue au cas par cas.

Preuves structurées : [validation-summary.json](audits/v88/validation-summary.json). Logs bruts d’exécution conservés dans `/tmp/accordia-master-*` pendant la session ; le résumé versionné contient les résultats utiles sans données réelles ni jetons.

## Écarts confirmés et actions

Priorités : P1 = avant industrialisation/ouverture générale ; P2 = correction recommandée du produit ; P3 = finition. La priorité de livraison ne constitue pas une sévérité CVSS.

| ID | Priorité | Constat et preuve | Correction attendue et critère de fermeture |
|---|---|---|---|
| M88-01 | P1, livraison | `scripts/verify-platform.mjs` lance ESLint sur `.` en n’excluant que dist/.next. `.sites-runtime` pèse environ 1,3 Go et est ignoré par Git, mais pas par ESLint. Deux échecs mémoire ; même lint réussi avec exclusions runtime/état Worker | Exclure globalement les répertoires générés dans eslint.config ; conserver tous les fichiers source et les règles. `npm run verify` doit terminer sur un checkout contenant ces caches. La CI distante n’a pas été exécutée ici |
| M88-02 | P2, cohérence | `features/constat/cloud-copy.ts:4–7` : quota = 1 210 Mio/MiB dans les quatre langues. `server/report-service.ts:9` : BUDGET = 128 × 1024 × 1024 octets. Le serveur n’accorde pas le volume annoncé | Source commune pour la limite et ses libellés FR/EN/DE/NL ; afficher 128 Mio/MiB. Vérifier l’erreur quota et l’aide, sans augmenter silencieusement la capacité serveur |
| M88-03 | P2, chaîne de développement | Minimatch 3.1.5 via ESLint ; pnpm signale GHSA-g3hv-75wg-m249, plage <11.0.1. Pas de dépendance de production affectée signalée | Mise à niveau compatible de la chaîne lint ; vérifier installation figée, API, lint/build/tests et audit complet. Ne pas imposer aveuglément une version majeure transitive. Le workflow actuel bloque aussi sur l’audit complet |
| M88-04 | P2, média | `features/marketing/story-video-actions.tsx:28` : preload=none, sans poster ni ratio réservé ; lecteur noir avant lecture, risque de changement de hauteur après métadonnées. Réserve M82-02 toujours présente dans le code | Poster issu de la vraie vidéo et ratio correspondant, dimensions réservées, vérification lecture/partage/téléchargement mobile/bureau |
| M88-05 | P2, média | `accident-story.tsx` pilote la narration ; `StoryVideoShare` ne lui transmet pas d’événement play/pause. Deux sources audio indépendantes, réserve M82-01 non résolue dans le code | Propriétaire sonore unique : lancer l’une suspend l’autre. Tester les deux sens, fin, changement de langue, arrière-plan, démontage. L’écoute simultanée n’a pas été réexercée dans cet audit |
| M88-06 | P1, exploitation | `server/retention-maintenance.ts` expose mode=on_activity ; `authorizedStores` déclenche le nettoyage sur requête. Sans activité, pas de déclenchement indépendant prouvé | Planification indépendante, suivi des échecs et alerte ; recette sur stockage isolé puis preuve du fonctionnement opérationnel. L’accès aux dossiers expirés est contrôlé par les services ; ce constat ne démontre pas une fuite |
| M88-07 | P2, cycle de vie | Pas de commande utilisateur de suppression manuelle de brouillon dans workspace/storage ; purge d’expiration existante. Une demande antérieure de suppression reste donc un lot à traiter | Suppression explicite et encadrée, périmètre local/compte/session clairement distingué, pièces et PDF associés, droits propriétaire/A/B et récupération définis. Ne supprimer aucune donnée durant l’audit |

Source primaire de M88-03 : https://github.com/advisories/GHSA-g3hv-75wg-m249 consultée le 4 novembre 2026. L’avis décrit notamment l’amplification de motifs en 10.2.6 ; le registre déclare la plage <11.0.1 et signale ici 3.1.5. L’exploitabilité précise de cette version et des chemins de lint n’a pas été démontrée : rapporter l’alerte sans l’assimiler à une attaque contre le site publié.

## Protections examinées

- `server/http.ts` : origine même site, refus cross-site, en-tête explicite, Content-Type JSON, limite d’octets et délai de lecture ; réponses JSON privées/no-store/nosniff. Aucun HTML dynamique dangereux ou eval trouvé dans le scan app/features/server ciblé.
- `server/stores.ts` : identité ChatGPT et compte actif requis ; DB/R2 disponibles. La confiance dans les en-têtes d’identité relève aussi de l’ingress d’hébergement ; aucun essai d’usurpation contre la production effectué.
- `session-service.ts` / `session-guard.ts` : appartenance A/B, compte actif, expiration du dossier et vérification au commit ; tests de concurrence et d’isolation exécutés avec vrais moteurs locaux D1/R2.
- `ai-settings.ts` / `mobile-settings.ts` : contrôle super-admin serveur, secret IA chiffré AES-GCM, métadonnées sans clé, révision attendue et refus des conflits ; activation à code fortement aléatoire et expirant. API mobile publiée limitée à la présentation, aucun droit métier accordé par son contenu.
- Stockage : quota réservé avant R2, protection des objets référencés et historique, nettoyage contrôlé après erreur de commit ; tests de courses, suspension et reprise inclus.
- PDF et crédits : tests d’accès A/B, révision, consentements, gel du document, signatures de test, cache, échecs fournisseur et idempotence inclus. Le test recovery-exercise restaure une sauvegarde chiffrée isolée avec historique, permissions et mêmes octets du PDF signé de test.
- Stripe : checkout test réservé au super-admin, clé test et prix contrôlés ; préférence d’offre distincte d’un droit payé. Achats publics toujours fermés, cohérents avec la vitrine. Aucun paiement réel ou appel IA facturable exécuté.

Ces contrôles fournissent des preuves pour les cas testés, pas une garantie générale d’absence de vulnérabilité. Aucun accès direct aux bases, exports, secrets ou identités réels demandé.

## Validations encore ouvertes

1. Deux vrais comptes déjà autorisés sur deux téléphones : création du QR depuis le panneau, scan, connexion B, mauvaise identité, lien expiré, renouvellement, réseau coupé/conflits, refus d’édition de l’autre côté et mêmes octets PDF final. Les tests automatisés ne ferment pas cette recette.
2. Caméra QR Android/iPhone en HTTPS, permissions accordées/refusées, faible éclairage, sortie/arrière-plan. Aucun accès caméra déclenché par cet audit.
3. Sauvegarde opérationnelle D1/R2, rétention des sauvegardes, accès et alertes, objectifs de reprise, exercice depuis une sauvegarde représentative de production dans un environnement isolé. L’exercice synthétique réussi ne prouve pas l’existence d’une sauvegarde productive.
4. Fournisseurs IA avec pièces fictives nettes/floues/contradictoires, correction avant insertion, consommation/erreur réelles. Aucun document personnel utilisé.
5. Paiement commercial, remboursement, renouvellement/annulation et expiration des droits avant ouverture des achats. Le mode test ne vaut pas activation de production.
6. Audit d’accessibilité assistive, revue juridique/assurance du PDF et des mentions, tests utilisateurs chronométrés. Aucun avis juridique formulé par ce rapport.
7. CSP, anti-encadrement et autres en-têtes de la vraie réponse applicative authentifiée à relever : les 401 du portail d’accès ne suffisent pas ; aucune vulnérabilité d’encadrement retenue sur ce seul signal.

## Ordre de travail recommandé

1. Corriger M88-01 et M88-02, puis relancer la commande complète dans son environnement normal.
2. Corriger les deux réserves vidéo et traiter la mise à niveau de lint/Minimatch dans un lot compatible et vérifié.
3. Effectuer la recette A/B physique et fermer les preuves de sauvegarde/purge/alertes.
4. Définir et livrer la suppression manuelle des brouillons ; préparer ensuite les validations commerciales et fournisseurs.

Le guide, le tutoriel et les aides FR/EN/DE/NL ont été revus : aucun changement de commande pour ce lot documentaire. Les aides de quota sont précisément l’écart M88-02 à synchroniser lors de son correctif. Les entrées anciennes des documents restent historiques ; les réserves explicites de ce rapport constituent l’état audité v88. Source applicative et production inchangées ; aucun nouveau déploiement.
