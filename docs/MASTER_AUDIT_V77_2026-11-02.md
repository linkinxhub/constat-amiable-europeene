# Accordia — Master audit de la version 77

Date : 2 novembre 2026, Europe/Amsterdam. Audit demandé par le propriétaire. Aucune correction fonctionnelle, aucune publication et aucune modification de dossier réel dans ce lot.

## Verdict

La plateforme dispose d’une base fonctionnelle avancée et de protections serveur testées. Elle convient à un pilote encadré ; cet audit ne permet pas de la déclarer prête pour une ouverture commerciale générale. Deux défauts de logique sont reproduits, un défaut de contraste est mesuré et un décalage de traçabilité GitHub est confirmé. Les réserves de téléchargement physique, d’OCR fournisseur et d’exploitation restent ouvertes.

Les 289 tests passent, mais ils ne couvraient pas les nouveaux cas M77-01/M77-02. Un résultat automatisé vert ne clôt pas ces constats.

## Référence et périmètre

- Production : version 77, source 1076d08cce2af08199b38e5f20580dc80ae5dce5, déploiement appgdep_6ae894d839b48191bc9585c138f9eb7e (succeeded au dernier contrôle de publication).
- URL : https://accordia-constat.adil-btp.chatgpt.site/ . Audience custom et deux visiteurs externes ; ces réglages restent inchangés. Ce n’est pas une ouverture publique universelle.
- Source locale au début : d7831aa2981958315a555b030825341c5cfc3add, propre. Différence avec la source publiée limitée à STATUS.md/CHANGELOG.md. Le code applicatif audité correspond à la v77.
- Documents examinés : AGENTS, PRODUCT_SPEC, ARCHITECTURE, ROADMAP, STATUS, DECISIONS, TEST_PLAN, rapports et ordre de travail d’exploitation.
- Contrôles : typage, lint, build puis suite complète, audits pnpm prod/complet, sondes de composants réels sur données fictives, revue des contrôles HTTP/identité/droits, source de rétention et CI, vitrine réellement publiée dans Chrome distant.
- Pas de pentest intrusif, achat, appel IA payant, envoi assureur, élargissement d’accès ou signature contractuelle. Aucun compte HeyGen consulté ou utilisé dans cet audit.

## Résultats mesurés

| Contrôle | Résultat | Limite |
|---|---|---|
| TypeScript et build | Réussis | Pas une preuve d’exactitude métier exhaustive |
| Tests complets | 289 réussis, 0 échec | Certains fournisseurs et identités sont contrôlés en fixture isolée |
| ESLint | 0 erreur, 54 avertissements | Dette historique conservée |
| Sondes M77 | Deux défauts de logique reproduits ; trois contrastes calculés | Pas des corrections ni des tests qui passent à tort pour une conformité |
| Audit dépendances production | 0 vulnérabilité signalée, 280 dépendances comptées | Base d’avis du jour, pas une preuve d’absence de faille applicative |
| Audit complet | 1 modérée, 0 élevée/critique, 799 dépendances comptées | Minimatch de développement, GHSA-g3hv-75wg-m249 |
| Secrets, scan ciblé | 538 fichiers suivis examinés, aucun motif détecté | Motifs limités : sk-proj, AKIA, clés privées ; fichiers >2 Mio et historique non inspectés |
| Journaux serveur | 0 événement en erreur retourné, fenêtre de 180 minutes, limite 25 | Échantillon uniquement ; ne couvre pas les erreurs client ou les pertes silencieuses |
| Vitrine publiée | Page non blanche, identité correcte, pas d’overlay framework | Recette bureau de cet audit ; mobile quatre langues documenté dans le lot précédent |
| Largeur bureau | 1348/1348, pas de débordement | Pas une validation de tous les écrans |
| Noms accessibles | 0 commande visible sans nom dans la vue inspectée | Heuristique DOM, pas une certification lecteur d’écran |
| Console client | Aucun message applicatif dans les 100 dernières entrées après exclusion chrome-extension | La voix peut échouer proprement sans exception console |

## Constats prioritaires

### M77-01 — P1 : deux modifications rapprochées d’une fiche peuvent se remplacer

**Confirmé sur le composant réel, avec données synthétiques.** Dans Questionnaire, le patch principal actualise sa référence avant onChange. Mais update(v) remplace encore toute la fiche par un objet construit depuis `vehicle`, capturé au dernier rendu.

Reproduction : ouvrir la première rubrique de la fiche A ; appeler le changement du conducteur, puis celui de l’e-mail avant le prochain rendu. La seconde fiche reconstruite contient l’ancien conducteur. La sonde observe `earlierValueLost:true`, sans modifier le rapport initial.

Source : features/constat/questionnaire.tsx, notamment update à la ligne 48 et les callbacks des champs de base. Preuve reproductible : `node --experimental-strip-types scripts/audit-v77-probes.mjs`.

**Portée :** risque d’intégrité côté client lorsque plusieurs mises à jour arrivent avant commit. Ce n’est pas une perte systématique à chaque frappe ni un contournement de droits serveur. Le défaut avait été corrigé pour deux réponses générales, pas pour tous les champs imbriqués.

**Correction attendue :** appliquer les différences de champ à la dernière fiche courante ; conserver les remplacements complets explicitement validés par les composants qui le nécessitent. Tester au minimum conducteur/e-mail, compléments extra, A/B, édition pendant retour documentaire et reprise. Ne pas changer le schéma ou supprimer de données pour résoudre la concurrence.

### M77-02 — P2 : le seuil de visibilité de la scène n’est pas respecté

**Confirmé sur le composant réel.** L’IntersectionObserver est créé avec threshold:0.6, mais le callback ne vérifie que isIntersecting. Une première entrée `isIntersecting:true, intersectionRatio:0.01` démarre la scène : `actuallyRunning:true`.

Source : features/marketing/accident-story.tsx, ligne 17. Les tests existants utilisaient des entrées sans ratio, et ne pouvaient pas détecter cette erreur.

**Correction attendue :** vérifier réellement le ratio pour le démarrage, définir séparément la règle de pause quand l’utilisateur quitte le contenu, et tester 0/1/59/60/100 %, scroll, pause globale, narration et mouvement réduit. Le simple ajout de threshold dans les options ne suffit pas.

### M77-03 — P2 : petits textes trop peu contrastés

**Mesuré dans la v77 publiée**, depuis les styles calculés sur fond blanc. Ces textes HTML transmettent une information ; ce ne sont ni des logos ni du décor.

| Zone | Couleur | Taille/graisse | Contraste sur blanc |
|---|---|---|---|
| Mention de la scène | rgb(111,133,140) | 9 px / 400 | 3,882:1 |
| Sous-texte de l’étape | rgb(102,128,135) | 12 px / 400 | 4,1979:1 |
| Introduction | rgb(99,123,131) | 13 px / 400 | 4,4762:1 |

Référence primaire : [W3C, WCAG 2.2, critère 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), seuil de 4,5:1 pour le texte normal, sans arrondir un résultat inférieur pour le faire passer. Les couleurs issues du navigateur sont utilisées, pas les pixels anticrénelés d’une capture.

**Correction attendue :** foncer ces textes avec marge de sécurité, augmenter la petite mention, puis vérifier les quatre langues, mobile, zoom et focus. Cet échantillon établit des non-conformités localisées, pas une certification globale du site.

### M77-04 — P1 exploitation : GitHub/CI ne représentent plus la production actuelle

**Confirmé par les outils GitHub.** La PR en brouillon https://github.com/linkinxhub/constat-amiable-europeene/pull/1 reste sur `feat/safety-device-modes-20261101`, HEAD 10c609e395b824d8591b536b0a665135a17dc11f. La lecture de features/marketing/accident-story.tsx à ce ref retourne NOT_FOUND, alors que ce fichier existe dans le code publié. Ce HEAD était le miroir du lot vitrine v72 ; il n’intègre pas les lots suivants.

Dernier run associé : 41428674493, completed/failure. Typage/lint/build/tests et audit production : success ; audit complet de développement : failure. Ce n’est pas une CI de la v77. La description de PR conserve aussi des références historiques v59/v62 et n’est pas un état de livraison fiable.

**Correction attendue :** resynchroniser le miroir avec l’état canonique Sites, vérifier l’égalité des arbres/fichiers et refaire une CI sur le nouvel état ; réécrire ensuite la description finale de PR. Ne pas masquer l’avis Minimatch, forcer une fusion ou réutiliser une ancienne CI verte. Aucun push GitHub ni commentaire n’a été envoyé pendant cet audit.

### M77-05 — P2 : narration non fiable sur le navigateur de test

**Échec client reconfirmé dans la production.** Le clic Écouter la narration affiche brièvement l’état actif, puis le message de secours « La voix n’a pas pu démarrer ». Le texte et les liens restent utilisables. Pas de son spontané ni de blocage complet de la page.

Le site utilise Web Speech, pas un fichier vocal enregistré. Le contrôleur gère pause/arrêt, événements tardifs et délai maximal ; les tests de contrôleur passent, mais une voix audible n’a pas été validée. On ne peut pas généraliser cet échec à tous les appareils.

**Correction attendue :** recette audible Android/iOS et, pour une qualité stable, piste enregistrée dont la durée et l’écoute sont validées. Le compte fournisseur indiqué par le propriétaire reste à vérifier ; la tentative précédente de lecture du profil HeyGen a été interrompue, sans appel de synthèse. Ne pas annoncer une voix enregistrée existante.

## Sécurité, données et exploitation

### Protections constatées dans le code et rejouées dans les tests

- Identité dérivée du serveur d’hébergement ; origine, sec-fetch-site, en-tête de requête et content-type contrôlés pour les écritures ; corps JSON borné, délai et UTF-8 strict.
- Appartenance, propriétaire, côté A/B, révision CAS, compte actif et expiration contrôlés côté serveur. Les routes compilées refusent les accès non authentifiés testés.
- Invitations à usage unique/expiration, refus du tiers et changements de rôle non accordés par l’interface. Les PDF et signatures historiques restent distincts.
- Secrets administratifs chiffrés côté serveur ; tarifs/droits/crédits ne sont pas accordés par un bouton. Achats publics fermés ; OCR réel réservé au test administrateur autorisé.
- La couche d’identité dépend de la protection des en-têtes par l’hébergement ; ce n’est pas une preuve autonome de sécurité d’un Worker exposé ailleurs sans cette passerelle.

### Réserves P1 avant exploitation élargie

1. **Rétention on_activity.** server/retention-maintenance.ts confirme qu’en l’absence d’activité aucun job n’est invoqué. L’expiration bloque l’accès, mais ne garantit pas la suppression physique à l’échéance. Une planification serveur réellement supportée reste nécessaire ; ne pas la remplacer par un endpoint public ou un agent de navigateur.
2. **Sauvegarde/restauration productive non établie.** Le test isolé chiffre et restaure 19 tables/7 objets et vérifie historique/droits/PDF. Il ne crée pas de sauvegarde de production, de clé de restauration durable, de RTO/RPO ou de preuve de reprise chez l’hébergeur.
3. **Deux téléphones/deux connexions indépendantes et téléchargement final non clôturés.** Les services isolés sont testés, mais l’expérience complète Android/iPhone et le fichier téléchargé depuis le navigateur de test restent non validés. La présence d’un lien blob n’est pas une preuve de fichier récupéré.
4. **Fournisseur OCR et paiements publics.** Aucun nouvel appel payant ou achat dans l’audit. Les achats et droits commerciaux ne doivent pas être ouverts avant configuration réelle et recette de leurs échecs/reprises. L’audience custom est une restriction pilote intentionnelle, pas un bug à supprimer silencieusement.

### Dépendances et performance

- Audit complet : Minimatch 3.1.5 transitif de développement, avis GHSA-g3hv-75wg-m249, version corrigée déclarée >=11.0.1. Pas de remplacement majeur forcé, exception d’audit ou dépendance modifiée dans ce lot.
- Build : 49 fichiers JS émis. Plus gros bloc client : pdf-renderer, 2 680 672 octets bruts / 1 355 059 octets gzip localement. Il est importé à la demande dans LocalPdf ; ce poids n’est pas le transfert initial de la vitrine. Opportunité : mesurer le premier export sur téléphone et clarifier son chargement avant d’optimiser les polices/bundles.
- Aucune mesure Lighthouse/Core Web Vitals, INP/LCP ou charge concurrente représentative n’a été exécutée. L’absence d’erreur dans les logs ne fournit ni SLA ni test de charge.
- Dette documentaire : les entrées historiques de ROADMAP/ARCHITECTURE/PR contiennent des états anciens. Les notes de publication récentes sont plus fiables ; ajouter un tableau d’état courant commun éviterait de prendre une étape historique pour la situation actuelle.

## Ordre de correction proposé

| Lot | Travail | Condition de sortie |
|---|---|---|
| 1 | M77-01, intégrité de la fiche | Plus de perte entre deux callbacks, tests A/B/extra/import et navigateur |
| 2 | M77-02/M77-03, visibilité et lisibilité | Seuil testé et contrastes au-dessus de 4,5:1, petits écrans et quatre langues |
| 3 | M77-04, traçabilité et CI | Miroir correspondant au code testé, CI récente comprise, dette de dépendance explicite |
| 4 | M77-05, audio réel | Piste ou voix réellement écoutée, pause/reprise et erreurs vérifiées sur mobiles |
| 5 | Exploitation et recette physique | Sauvegarde/restauration et ordonnanceur productifs, deux comptes, fichier final ouvert, accès pilote puis ouverture commerciale décidée |

Cet audit ne publie ni ne corrige les points ci-dessus. Aucun score « 100 % » ni certification n’est attribué.

## Reproduction et fichiers du lot

- `node scripts/verify-platform.mjs` : TypeScript → lint → build → 289 tests.
- `pnpm audit --prod --json` et `pnpm audit --json` : résultats distincts.
- `node --experimental-strip-types scripts/audit-v77-probes.mjs` : constats M77-01, M77-02 et calculs M77-03. Les assertions décrivent les défauts présents, pas le comportement souhaité ; elles devront être inversées après correction.
- Fichiers ajoutés : ce rapport et la sonde. STATUS.md et CHANGELOG.md actualisés. Aucun fichier applicatif modifié.
- Guide/tutoriel/aides vérifiés : aucun impact utilisateur pour ce lot d’audit documentaire. Les corrections visibles et leurs traductions seront à synchroniser dans leurs lots respectifs.
