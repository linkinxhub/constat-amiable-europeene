# Accordia — audit et correctifs de robustesse

## Référence, objectif et conservation
Référence propre : source Sites f838c8d440dd46ee3f564b4aafb4ff9c2eba83e7 et GitHub af9bc008907668bf762eb20948a943e51d490602, sources concordantes vérifiées avant modification. Point de restauration : before-robustness-audit-20261101. L’applicatif de référence inclut le lot photo de la version 57 sauvegardée ; la production reste en version 56.

Demande exécutée : auditer les erreurs reproductibles, corriger les défauts traitables et fournir une feuille de route de fiabilité. Préserver données, signatures/PDF historiques, intégrations réelles, droits A/B, abonnements et contrôles serveur. Pas d’achat Premium ouvert, pas de migration SQL, pas d’envoi à un assureur, pas de signature personnelle ni de publication nouvelle autorisés dans ce lot.

Plan exécuté : inspection Git/docs et source distante ; inventaire lint/scans ; correctifs React et API bornés ; tests de flux/asynchronisme, compilation puis suite complète ; recette Preview ; rapport et synchronisation. Aucune règle ESLint désactivée, aucun setter simplement déplacé dans un timer pour masquer un diagnostic.

## Corrections et preuves

| Repère | Défaut ou dette confirmée | Correction et vérification |
|---|---|---|
| R01 | 43 erreurs ESLint : 24 mises à jour synchrones dans des effets, 14 accès aux références pendant le rendu, 2 types any, 3 liens internes non conformes. | Remises à zéro conditionnées aux changements de source/partie, avant affichage ; références actualisées après commit ; réponses de session validées comme objet à valeurs unknown, résultat D1 typé ; Link pour les liens internes concernés. Nouveau lint : 0 erreur, 54 avertissements conservés. |
| S01 | readJson ne bornait pas la durée de lecture d’un flux et attendait sa promesse d’annulation lors du refus de taille. | Délai de 60 s, annulation sans attendre un callback de flux potentiellement bloqué ; 408 body_timeout ou 413 too_large. Tests de flux volontairement bloqué et d’annulation qui ne termine jamais. Les routes gardent leurs plafonds de taille spécifiques et leurs autorisations. |
| S02 | Des octets UTF-8 invalides étaient acceptés silencieusement : la sonde de référence retournait x = caractère de remplacement. | Décodage UTF-8 strict avant JSON.parse ; 400 invalid, avant toute écriture métier. Test de rejet et conservation des caractères accentués/arabes valides. |
| R02 | Remises à zéro de confirmations/PDF dans des effets, donc après un rendu avec d’anciennes valeurs ; références modifiées pendant un rendu pouvant ne pas être validé. | Invalidations synchronisées à la source affichée et références mises à jour en layout effect. Tests des composants réels : résultat PDF tardif écarté ; confirmation unilatérale annulée ; A/B terminés puis modification/retour à l’ancienne valeur ne ressuscitant pas la confirmation ; autre dossier/partie isolés. Tests contrôlés, sans signature réelle. |
| R03 | Initialisation des préférences et du questionnaire par mises à jour dans des effets ; risque de recopier la langue de repli avant restauration. | Signal d’hydratation useSyncExternalStore, restauration conditionnelle unique et sauvegarde de langue après initialisation ; reprise du brouillon attend l’initialisation. Entrée de lien de session capturée avant retrait du fragment ; sauvegardes et règles d’identité conservées. |
| U01 | L’accueil et Rejoindre recevaient toujours fr du serveur même sans paramètre lang, neutralisant la préférence mémorisée. | Absence de paramètre transmise comme absence, langue explicitement fournie toujours validée et prioritaire. Preview : anglais choisi, rechargement de /join sans langue → anglais ; /join?lang=fr → français. Test du vrai JoinPanel : préférence, priorité explicite, valeur inconnue ou stockage vide. |
| R04 | Erreurs PDF d’un ancien contexte pouvaient être affichées après changement de source. | Affichage d’erreur conditionné au contexte de génération courant ; résultats tardifs ignorés et liens invalidés. |
| R05 | Un changement d’identifiant ne doit pas réutiliser les états locaux (brouillon, dirty, jeton) de SessionClient. | Composant de session explicitement identifié par sa clé de session côté page, pour imposer un remontage isolé à la navigation entre dossiers. Durcissement préventif ; pas de fuite intercompte démontrée ni de recette réelle à deux comptes revendiquée. |
| Q01 | Les contrôles pouvaient être lancés indépendamment, avec un risque de tests exécutés pendant une reconstruction du dossier dist. | Nouvelle commande pnpm verify (scripts/verify-platform.mjs) : TypeScript → ESLint → build → tests, ordre strict et arrêt au premier échec. Commande réellement exécutée jusqu’au succès. Ce n’est pas encore un workflow GitHub Actions activé. |

## Résultats finaux
- pnpm verify : réussi. TypeScript et build passent, 223 tests réussissent après fin du build, zéro échec.
- ESLint : 0 erreur / 54 avertissements, contre 43 / 61 sur la référence initiale de ce lot. Aucun diagnostic supprimé par configuration. Les avertissements restants ne sont pas présentés comme corrigés.
- Huit tests ajoutés : quatre durcissements du corps JSON et quatre scénarios de cycle de vie/préférences. Le harnais de régression Evidence exécute désormais aussi les layout effects ; cinq scénarios d’import différé continuent de passer.
- Nouveau scan des dépendances de production : 0 vulnérabilité (toutes sévérités).
- Nouveau scan complet : 1 vulnérabilité modérée de développement, Minimatch GHSA-g3hv-75wg-m249 ; versions transitives signalées 3.1.5 et 10.2.5. Aucune dépendance ni règle de délai modifiée pour masquer cette réserve.
- git diff --check réussi avant synchronisation. Aucun fichier QA temporaire destiné à la livraison.

Les 223 tests incluent les suites existantes d’accès/authentification, sessions A/B, révisions et conflits, quotas, consentements, signatures et PDF, 24 variantes PDF, traduction/croquis avec fournisseurs contrôlés, pièces documentaires, facturation de test et routes compilées. Ils ne constituent pas un pentest ni une recette de prestataires et de deux comptes physiques.

## Dépendance de développement non réparée aujourd’hui
Avis primaire : https://github.com/advisories/GHSA-g3hv-75wg-m249. Correction annoncée à partir de 11.0.1. La politique réelle pnpm-workspace.yaml impose minimumReleaseAge: 10080, soit sept jours, sans exception introduite. Publication établie du correctif : 27/10/2026 à 22:26 UTC ; éligible le 03/11/2026 à 23:26 Europe/Brussels.

Ne pas forcer une version majeure 11 sur tous les consommateurs historiques 3/10 sans recette de compatibilité. Le risque signalé porte sur des motifs glob contrôlés par un attaquant dans l’outillage concerné ; le scan production ne signale pas cette dépendance dans le périmètre production. Cela ne justifie ni de déclarer l’alerte corrigée ni de promettre un risque nul. Prochaine action : à éligibilité, choisir une mise à jour compatible ou une migration ciblée, réinstaller avec lockfile figé et refaire lint/build/tests/scans. Aucune automatisation créée implicitement.

## Avertissements de qualité restants
54 avertissements : 31 variables/imports non utilisés, 14 dépendances d’effets ou références de nettoyage à revoir, 6 conseils d’optimisation des images et 3 navigations par rechargement complet. Certaines navigations participent à des changements de contexte d’authentification ; ne pas les convertir mécaniquement. Les images de documents/signatures et QR locaux ne doivent pas être transmises à un optimiseur externe pour satisfaire un conseil de performance.

Les effets restants doivent être repris par sous-lots avec leurs abonnements, fermeture et requêtes réseau : ajouter aveuglément chaque fonction aux dépendances peut provoquer des rechargements répétés ; utiliser un événement d’effet uniquement pour une véritable réaction non réactive, pas pour cacher une dépendance métier. Référence : https://react.dev/reference/react/useEffectEvent. Les avertissements ne sont pas tous des pannes reproduites, mais restent une dette ouverte.

## Sécurité et exploitation examinées
Revue des 21 fichiers de routes API et des services associés : identité depuis le serveur, compte actif et côté A/B ; garde d’origine/type/en-tête sur écritures navigateur ; comparaison de révision ; quotas et verrous ; listes de champs IA et traitement d’images bornés ; stockage privé, accès PDF et gel avant signatures ; chiffrement de la clé IA administrée ; facturation explicitement de test. Le webhook de test authentifie la signature fournisseur et conserve les octets bruts, sans exiger un faux CSRF de navigateur. Les tests de ces contrats passent ; aucune route privée rendue publique.

Recherche ciblée de dangerouslySetInnerHTML/eval/innerHTML dans app/features/server : pas d’usage trouvé. Recherche de préfixes de clés secrètes longues dans les sources applicatives et docs : pas de correspondance ; ce contrôle limité ne remplace pas un scan de l’historique Git ni une revue des secrets de production. Les secrets et documents de production n’ont pas été exportés.

Logs de production demandés sur 180 minutes, erreurs uniquement, limite 25 : un événement renvoyé GET /api/document-extraction, HTTP 401, outcome ok, niveau info. Refus anonyme cohérent, pas d’exception applicative identifiée dans cet événement. Aucun en-tête ni jeton de log copié dans ce rapport. Ce résultat borné n’exclut pas d’autres erreurs et ne constitue pas une supervision continue.

## Recette Preview et limites
- Brouillon fictif A/B repris après hydratation, consignes de sécurité affichées puis confirmations A et B ; bouton de préparation activé et PDF de relecture effectivement généré.
- Changement de langue personnelle A vers DE : préparation courante invalidée, ancien PDF conservé dans l’historique. Retour FR : confirmation périmée non rétablie, préparation bloquée jusqu’à nouvelle confirmation.
- Rejoindre : préférence EN reprise après rechargement complet ; lien explicitement FR prioritaire. Il faut attendre l’hydratation, pas lire seulement le HTML de repli initial.
- Les tests UI asynchrones utilisent les vrais gestionnaires de composants avec hooks et dépendances externes contrôlés ; ils ne sont pas présentés comme des sessions authentifiées réelles.

Toujours non validés : deux téléphones physiques/deux comptes hébergés, signatures personnelles, caméra/GPS, documents réels et fournisseur IA, paiements clients réels, lecteur d’écran, performance sur téléphone peu puissant. Le téléchargement du PDF final reste non confirmé dans le navigateur de test : limites documentées dans VERIFICATION_RESERVES_2026-11-01.md, aucun contournement de la politique chrome://downloads. Aucun nouvel essai prétendu réussi ici. Aucune nouvelle mesure mobile dédiée revendiquée pour ce lot ; styles et structure du formulaire inchangés.

Guide et tutoriel FR/EN/DE/NL vérifiés contre les commandes : ils décrivent toujours le changement de langue, la conservation des brouillons et l’invalidation après modification. Aucun bouton, droit, quota IA ou parcours commercial ajouté. Pas de nouvelle explication administrative dans le guide conducteur.

## Ce qui manque pour une plateforme plus efficace et robuste

| Priorité | Travail concret | Critère de réussite |
|---|---|---|
| P0 — recette terrain | Deux vrais comptes autorisés sur deux téléphones, QR, sauvegardes concurrentes, reprise, relecture et signatures du seul scénario fictif. | Chaque téléphone ouvre le PDF réellement enregistré dans son gestionnaire de fichiers ; données A/B exactes, anciennes versions conservées et nouvelle signature exigée après correction. |
| P1 — chaîne de contrôle | Activer une CI GitHub sur les PR avec installation figée, politique des versions, pnpm verify et audits séparés ; contrôler le résultat avant fusion/publication. | Une erreur de typage/lint/build/test ou vulnérabilité de production bloque effectivement la livraison. Le script local existe ; le workflow distant reste à raccorder et tester. |
| P1 — dette et dépendances | Traiter l’alerte éligible le 3 novembre et les 54 avertissements par groupes ; vérifier compatibilité des consommateurs. | Scans complets et lint sans diagnostic, sans exception silencieuse ni régression. |
| P1 — reprise et données | Tester une restauration D1/R2 indépendante, puis raccorder un ordonnanceur de rétention et surveiller ses échecs. | Restauration chronométrée d’un dossier/PDF en environnement isolé et purge bornée exécutée même sans visite du site, avec preuve et politique des sauvegardes. |
| P1 — supervision | Mesurer erreurs, latences, stockage et quotas ; alertes exploitables et journaux minimisés, sans papiers ni récits personnels. | Une panne simulée est détectée, signalée et diagnostiquée avec identifiant technique ; procédure de reprise documentée. |
| P1 — OCR utilisable par les clients | Recetter les vrais modèles vision/PDF sur un corpus autorisé FR/EN/DE/NL, rotations, reflet, recto/verso et contradiction ; gérer HEIC de manière explicite. | Mesure de qualité par champ, aucune valeur incertaine appliquée silencieusement, reprise claire après échec. L’essai administrateur existe, les achats restent fermés. |
| P1 — commercialisation réelle | Raccorder compte marchand et droits Premium serveur à des paiements vérifiés, puis recettes de remboursement/expiration/idempotence. | Aucun privilège accordé par le navigateur, preuve de paiement et droits cohérents ; la préférence d’offre actuelle ne doit pas être vendue comme un abonnement actif. |
| P2 — rapidité et lisibilité | Mesurer LCP/INP et mémoire sur Android/iPhone modestes, photos et PDF volumineux ; réduire les traitements synchrones coûteux et garder la page 1 lisible avec annexes intégrales. | Budget de performance mesuré et absence de perte/troncature des informations ; téléchargement compréhensible même sur connexion instable. |
| P2 — assurance de sécurité | Pentest indépendant IDOR/partage/rôles, scan d’historique Git et revue des dépendances ; validation des traductions et du périmètre pays/assureurs/confidentialité. | Rapport externe traité, contrôles de non-régression, promesses produit conformes au fonctionnement réel. |

Aucun indicateur global « plateforme 100 % sécurisée » n’est annoncé. Le lot corrige des défauts précis et vérifiés ; les jalons ouverts ci-dessus restent des travaux réels.

## Fichiers concernés et retour arrière
Serveur : server/http.ts, server/report-service.ts. Interface : composants de cycle de vie sous features/constat (cloud-panel, entry-mode, evidence, final-panel, invite-qr, join-panel, local-documents, local-pdf, offer-panel, questionnaire, refusal-panel, retention-admin-panel, same-device, session-client, translation-options, tutorial, workspace), browser-ready.ts, features/marketing/landing.tsx et routes app/page.tsx/app/join/page.tsx/app/session/[id]/page.tsx. Vérification : package.json, scripts/verify-platform.mjs, tests/http-body-hardening.test.mjs, lifecycle-harness.mjs, robust-lifecycle.test.mjs et harnais Evidence existant. Documentation : état/changelog/architecture/décisions/plan de tests/roadmap.

Retour arrière par tag de référence, sans migration ni restauration destructive de dossiers. Les données et PDF historiques restent compatibles. Sources destinées à sauvegarde et synchronisation après validation, sans nouvelle publication de production dans ce lot.
