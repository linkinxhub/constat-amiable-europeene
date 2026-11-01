# Architecture
React 19 + TypeScript + Vinext/Vite, pnpm, primitives Shadcn disponibles. Lot 1 : interface client isolée sous features/constat ; dictionnaire typé ; schéma Zod ; IndexedDB pour brouillons sur action explicite ; photos locales ; impression navigateur. Aucun backend métier ni identité applicative activés dans ce lot. Le serveur sert uniquement l'application ; aucun accident n'est transmis. Limitation : stockage local non chiffré, à utiliser avec données de test pour cette version. API/stockage serveur sécurisés et app mobile suivent dans le lot 2+. Sources conservées dans le dépôt du projet, Site enregistré mais non déployé en production.

Lot 1.1 : ajout de readingLanguages au schéma Zod avec défaut FR/FR pour les anciens brouillons, sans migration destructive IndexedDB. completeness.ts fournit les diagnostics et contrôle la validité calendaire. dual-review.tsx réutilise le document intégral par lecteur ; marques de relecture en mémoire seulement. Sauvegarde d'un instantané avec fusion prudente des identifiants pour préserver les éditions arrivées pendant l'écriture. beforeunload est une protection opportuniste, pas une garantie en cas de fermeture forcée mobile.

## Lot 2A (0.3.0)
`app/page.tsx` lit l'identité dispatch avec `getChatGPTUser()` et passe seulement le nom d'affichage et l'URL SIWC au client. `app/account/page.tsx` propose la connexion/déconnexion via navigation de premier niveau. Pages dynamiques, API `Cache-Control: private, no-store`. Les en-têtes d'identité ne sont fiables que derrière le dispatcher Sites : ne pas exposer directement ce Worker sur un autre hébergeur sans auth appropriée.
Bindings : D1 `DB`, R2 `BUCKET`. Migration Drizzle `0000_hard_saracen.sql` crée accounts, reports, report_versions. Clé du dossier composée `(owner_id,id)` ; index propriétaire/date pour la liste. Prepared statements, aucune création de table en requête applicative.
`server/report-service.ts` : validation Zod, compte actif, quotas réservés atomiquement, objet R2 immuable avant commit D1, CAS sur révision et historique dans un batch transactionnel. Échec après écriture R2 : objet non référencé possible, budget déjà réservé ; pas de purge automatique destructrice. Reprise avec ancienne révision -> 409, aucune fusion aveugle. Les photos sont incluses dans le JSON privé, pas stockées en gros blobs D1.
`server/http.ts` : lecture de flux plafonnée, origine exacte + en-tête custom, JSON uniquement, réponses privées sans détails d'erreur interne. `server/stores.ts` impose l'identité sur chaque route avant stockage.
`cloud-panel.tsx` : sauvegarde/listage/lecture explicites, schémas de réponses, copie locale conservée. Une ouverture distante passe par la protection des modifications ; les saisies arrivées pendant l'upload sont conservées. Les repères A/B restent non probants.

## Lot 2B/3A
Migration additive 0001 : shared_sessions (identité A/B, invitation SHA-256, expiration, consentements par révision et quota IA), sketch_proposals (objet R2 privé, source et validations). Index unique propriétaire/dossier. Routes /api/sessions et /session/[id]. Autorisation dérivée de l’identité serveur ; merge serveur explicite des seuls champs autorisés. Le commit des écritures historiques refuse atomiquement de modifier un dossier partagé hors du service session. CAS sur chaque écriture.
Photos attribuées côté API, quotas 3 par côté et taille encodée limitée. Les pièces anciennes non attribuées restent conservées. Le token d’invitation est retiré de l’URL et conservé dans sessionStorage pendant la connexion, puis retiré après acceptation. La politique d’accès Sites reste privée propriétaire : elle doit être adaptée explicitement avant un essai hébergé avec B.
IA : API Responses OpenAI, store:false, modèle configuré côté serveur, sortie JSON stricte vérifiée Zod, SVG React de géométrie contrôlée ; jamais HTML/SVG brut fourni par le modèle. 3 tentatives/heure/session, délai 45 s, schéma borné et double consentement. Les propositions remplacées laissent leurs objets privés conservés ; aucune purge automatique.

## PDF et signatures (0.5)
`final-model`/`final-copy` définissent les styles, 17 circonstances et traductions ; `form-details`, `signature-pad` et `final-panel` portent la saisie. `final-service` contrôle identité, révision, consentement, quotas et droits A/B. D1 référence les documents ; R2 conserve instantané, PDF de relecture, signatures et PDF final privés. `pdf-renderer` utilise pdf-lib/fontkit et des polices embarquées ; aucune API externe pour assembler le constat. La finalisation ajoute les signatures au PDF déjà présenté, sans régénérer les déclarations. Migrations 0002 et 0003 additives. Routes privées sous `/api/sessions/[id]/final`. Photos originales et données JSON jointes ; rendu WebP conditionné à un aperçu PNG. Les anciennes données restent compatibles.

## Corrections 0.6 (état actuel)
`session-guard.ts` fournit la condition atomique d’appartenance et de statuts pour les commits. Migration 0004 : verrou PDF éphémère et index participant B. `photo-validation.ts` contrôle formats/pixels, décompresse PNG de façon bornée puis décode PNG/JPEG ; le WebP utilise contrôle structurel serveur et aperçu navigateur. Aucun décodeur WebP serveur n’est revendiqué. Requêtes 10 Mio, budget cumulé inchangé. `event-time.ts` résout l’heure locale dans un fuseau IANA indépendamment du runtime. `confirmedLocation` conserve le point confirmé séparément de `location`, le relevé GPS. Liste des sessions filtrée sur acteur et propriétaire actif. Les descriptions des lots précédents ci-dessus sont historiques.

## Lot adresse GPS 0.6.1
geocoding.ts : parseAddress, lookupAddress et mergeAddress. Appel navigateur direct Photon, credentials omit, referrer no-referrer, timeout, un appel par clic. city reste dans JSON R2 ; pas de migration SQL. Fusion serveur A-only ; PDF combine lieu et ville.

## Correction 0.7
FormDetails accepte les modes details/circumstances/all. LocalPdf charge renderPdf à la demande dans le navigateur ; URL blob invalidée après modification et révoquée. Le PDF v3 marque son layout dans Keywords ; stampPdf conserve le placement historique pour les versions antérieures. Digest serveur versionné v3.

## Mise à jour modèle et invitation
reference-page.ts remplace la première page rendue par le fond JPEG original et les champs aux coordonnées de référence. Keywords accordia-reference-v1 pilote le placement des signatures ; autres layouts toujours pris en charge. cloud-panel expose une action de sauvegarde/création et conserve le lien en mémoire uniquement.

## Listes de saisie
presets.ts fournit les options localisées ; Field utilise NativeSelect pour renseigner le champ texte existant. FormDetails et VehicleForm partagent cette mécanique, sans migration.

## Avancement des participants
participant-progress.ts calcule readiness/empreinte ; done_a/done_b contiennent hash et date dans D1. Écritures gardées par rôle, compte actif et révision. GET session renvoie les statuts calculés sans divulguer les hashes. Client rafraîchit et fusionne sans perdre ses modifications locales.

## 0.10 — Parcours sur appareil commun
SameDevice conserve dans Workspace le Report existant et les langues A/B ; confirmations par empreinte locale de partie/faits communs, sans résurrection après édition. PDF figé avant signatures, SHA-256 via @noble/hashes (compatible Preview sans SubtleCrypto), stampPdf ajoute les images au PDF présenté avec mention explicite des identités déclarées et de l’horloge locale. URLs blob révoquées au démontage. Aucun changement aux identités, routes ni droits serveur. InviteQr utilise qrcode localement, secret jamais envoyé à un service QR. SignaturePad ignore les imports devenus obsolètes après changement de conducteur, effacement ou démontage.

## Configuration IA administrable (0.12)
`ai_settings` est un singleton D1 ; migration additive 0007. `admin_id` contient le SIWC userId, pas l’account_user_id de la politique Sites (espaces d’identifiants différents). Amorçage via code aléatoire 256 bits : seul son SHA-256 et son expiration sont placés dans les secrets Sites. INSERT conditionnel unique empêche toute seconde activation. Code remis uniquement au propriétaire dans la conversation ; ne pas le partager.
Clé fournisseur chiffrée AES-256-GCM avec nonce aléatoire et AAD versionné ; clé de chiffrement indépendante dans `AI_SETTINGS_ENCRYPTION_KEY`, jamais dans D1/Git/client. Routes privées sans cache, autorisation serveur à chaque opération, origine JSON contrôlée, limite de corps 4 Kio, modifications CAS et contrôle suspension au commit. L’API ne renvoie que la présence d’une clé, le modèle et l’état.
Le service lit D1 à chaque génération ; l’état désactivé n’utilise jamais le repli env. Le repli OPENAI_API_KEY/OPENAI_SKETCH_MODEL existe uniquement avant toute activation admin pour préserver les anciennes installations. Tests de connexion : GET fournisseur fixe /v1/models/:id, sans données de constat, timeout 10 s, intervalle minimal 10 s, aucune erreur amont brute retournée. Un modèle accessible n’est pas une preuve de compatibilité vision/Structured Outputs.

## Traduction assistée (0.13)
Migration additive 0008 : consentements traduction A/B par révision, compteur horaire séparé, marqueur translated sur final_documents (défaut 0 pour l’historique). Routes /api/sessions/:id/translation GET/POST : identité/appartenance, révision, contrôles de compte et origine, corps borné.
translation-service utilise la configuration OpenAI chiffrée existante ; endpoint Responses fixe, store:false, texte seul (six champs), schéma strict, sortie bornée 256 ko et 6000 caractères/champ, timeout 45 s. Les photos, coordonnées et champs d’identité ne sont pas ajoutés. Consentements revérifiés après réponse et au commit. Maximum six essais/heure/session ; verrou PDF sérialise préparation/traduction, token revérifié au commit. Aucun PDF traduit en cas d’échec ou de sortie invalide. Une préparation identique existante est réutilisée sans appel fournisseur.
Empreinte PDF comprend la traduction et la langue. Le contenu traduit reste dans les octets de l’aperçu R2 et sa pièce jointe ; pas de réécriture du rapport original. La finalisation tamponne exactement ces octets. referencePage conserve la page localisée supplémentaire seulement pour les nouveaux PDF traduits ; les rendus historiques restent compatibles.

## 0.14 — Gardes de préparation et régénération
finalConfig accepte regenerate (false par défaut), seulement avec translate=true. Le service ignore la réutilisation du PDF traduit lors de cette demande et ajoute un identifiant de génération à l’empreinte. Il vérifie les progress A/B avant l’appel et compare done_a/done_b au commit avec la révision et le verrou. Aucun schéma DB modifié. FinalPanel reçoit participantsDone, distingue les erreurs de fin et expose la régénération sous les mêmes conditions de consentement.

## 0.15 — Synchronisation et récupération bornée
GET session accepte since (SHA-256 du tuple session/révision/participant B/confirmations). readSessionChanges authentifie, vérifie la révision D1 et renvoie unchanged sans R2 si le jeton correspond ; readSession ajoute syncToken aux réponses complètes. Le client conserve les gardes de révision et fusionne seulement une réponse complète acceptée. Cache WeakMap de la taille JSON des tableaux photos immuables.
recoverStorage utilise un CTE des références propriétaire avec json_each pour les colonnes PDF, compatible avec les limites de compound SELECT de D1. Anti-jointure au registre, limite 25 ; nettoyage limite 10 ; réponse more et processed. Pas de recalcul du budget avant fin de l’indexation. Pas de migration SQL ni suppression de versions référencées.

## 0.17 — Réservations IA globales
ai_daily_usage : clé day UTC, compteurs calls/sketches/translations. UPSERT conditionnel calls<100, garde sessionCommitGuard dans INSERT SELECT. Pas de transaction ouverte pendant l’appel externe ni de remise à zéro en place : chaque jour possède sa ligne. Réservation immédiatement avant fetch dans les deux services de génération. Pas de remboursement d’un échec réseau dont la facturation peut être inconnue. Migration Drizzle 0009 additive.

## 0.18 — Politique produit et rétention
Migration additive 0010 : reports.retention_until, offer_preferences, retention_jobs et retention_objects ; backfill borné depuis la première version sans effacer les objets existants. Calcul des nouveaux délais en UTC via retentionDeadline ; valeur serveur jamais reçue du navigateur. readReport/sessionAccess et gardes de commit rejettent l’expiration. listReports/listSessions masquent les dossiers expirés. Préférences : routes GET/PUT /api/account/offer, schéma strict, SIWC et comptes actifs, origine contrôlée ; aucune table d’autorisations modifiée.
Purge : jusqu’à cinq dossiers et 25 objets par appel. Capture des références dans une file durable et retrait des références en transaction D1 ; suppression R2 puis mise à jour atomique budget/registre/file. Une erreur garde la file pour reprise. Tombstones owner/report sans contenu conservées pour empêcher une réintroduction avec le même identifiant. POST /api/admin/retention applique le rôle super administrateur stable. Aucun ordonnanceur déployé ; gestion des sauvegardes hébergeur et des orphelins historiques non indexés restent hors garantie.
IndexedDB : nettoyage des brouillons et PDF expirés à l’ouverture du stockage ; aucun effacement possible tant que le navigateur reste fermé. Horloge de l’appareil, comme les autres métadonnées locales. localCreatedAt optionnel préserve compatibilité ; mêmes magasins, pas de destruction de base.
PdfMaterial.unilateral porte acteur/motif séparément du rapport. Les PDF générés portent une marque, une annexe et une pièce jointe avec métadonnées ; stampPdf refuse d’y apposer les signatures communes. Aucun appel IA requis.

## 0.19 — Maintenance sur activité et suivi
Migration additive 0011 : singleton retention_maintenance (bail 5 min, prochain essai, dernier début/fin/succès, code d’erreur fixe, compteurs du dernier lot et indicateur more). Migration 0012 : index de reports.retention_until pour sélectionner les prochaines expirations.
authorizedStores authentifie et vérifie active avant un tryRetentionMaintenance ; les endpoints de suivi désactivent cet appel automatique pour rester purement consultatifs en GET. L’acquisition du bail est un UPDATE conditionnel atomique D1. Le résultat ne remplace le suivi que si le jeton est encore celui du propriétaire du bail. Un échec laisse la file R2 reprenable et ne remonte pas au conducteur. Aucun timer client, service tiers, clé nouvelle ou appel à un planificateur. Une reprise dépend d’une nouvelle requête authentifiée.
GET/POST /api/admin/retention revalident isSuperAdmin. Le panneau n’est rendu qu’après vérification serveur ; le POST contrôle origine et intention. Le GET ne révèle ni jeton ni identifiant de dossier, uniquement dates/compteurs agrégés. L’API ordinaire ne renvoie pas les résultats de la maintenance globale.

## 0.20 — Présentation des tarifs
Route /pricing avec choix de langue validé par liste fermée et repli FR. Composant Pricing et dictionnaire typé pricing-copy.ts partagés avec les aides ; FAQ HTML details/summary. Liens depuis le compte (connecté ou non), le panneau de préférence, le guide et la dernière étape du tutoriel. Aucun secret, appel fournisseur, paiement, schéma DB ni garde serveur modifié. Les données tarifaires servent à l’affichage seulement, jamais à autoriser un achat ou accorder des droits.

## 0.22A — Préparation du paiement
Module préparatoire server/billing-catalog.ts : catalogue figé en centimes, sélection stricte et validation de prix Stripe test reçus côté serveur. Aucune route ne l’appelle encore. Aucun droit, secret, table ou accès modifié.

## 0.22C — Adaptateur Stripe test
Adaptateur server/stripe-test.ts utilisant stripe 22.6.2 avec Fetch et WebCrypto, timeout de 15 secondes et une reprise réseau. Aucune route ne l’appelle encore ; la commande reçue devra être persistée et autorisée côté serveur. Confirmation signée = donnée à rapprocher, jamais attribution directe de droits.

## 0.22D — Commandes de test
Migration 0013 et server/billing-orders.ts. INSERT conditionnel et contraintes uniques pour la concurrence D1 ; reçu unique par commande/session et identifiant événement. Aucune transaction multirequête nécessaire pour ce reçu unique. Pas de crédit accordé. Aucun lien FK vers reports afin de ne pas bloquer sa purge ; politique de conservation des références à compléter avant activation.

## 0.22E — Flux de paiement test
server/billing-flow.ts orchestre les services existants. Migration 0014 : clé primaire de commande pour attribution idempotente. Reçu et attribution sont deux écritures atomiques successives, avec reprise, et non une transaction unique. Le traitement ne doit être acquitté par une future route webhook qu’après attribution ou enregistrement explicite du cas à examiner. Lecture des droits refuse les comptes suspendus et filtre propriétaire/expiration.

## 0.22F — Routes de test
Routes test Checkout et webhook raccordées aux services D/E. Checkout requiert SIWC + super-admin + garde CSRF ; webhook requiert signature SDK sur corps brut. billing-http.ts centralise activation/configuration stricte et lecture bornée. Secrets passés depuis env, jamais au client. Mode désactivé par défaut et aucune configuration hébergée modifiée.

## 0.22G — Crédits de test
server/billing-credits.ts et migration 0015 : registre par opération (reserved/succeeded/released). INSERT SELECT compare atomiquement le nombre de réservations/succès au grant ; pas de lecture puis décrément. Solde calculé, règlement CAS sur reserved, idempotent pour résultat identique et conflictuel pour résultat différent. Les services IA ne sont pas encore raccordés.

## 0.22H — Commit croquis/crédit de test
La route dédiée /api/billing/test/sketch applique les gardes administrateur et billingTestConfiguration. generateTestSketch résout la session et son propriétaire, réserve via withTestCredit et appelle sketchAction avec un contexte interne non reçu du navigateur. sketchCommit ajoute à la garde d'écriture une réservation correspondante (opération/propriétaire/dossier/type), puis le passage succeeded conditionné à la référence exacte du nouveau croquis. Les deux requêtes sont dans le batch de storeObject. Une réponse perdue après commit laisse donc succeeded, même si withTestCredit tente ensuite une libération : le CAS refuse de rembourser un succès. Sans contexte, le chemin de génération ordinaire reste identique. Aucun changes() dépendant d'une connexion ni migration additionnelle.

## 0.22I — Crédit de traduction après cache
prepareTestTranslation valide le corps strict puis utilise withPdfLock/prepareUnlocked. La réservation withTestCredit est placée après la recherche du PDF compatible. Le contexte interne donne une identité de génération au digest ; translationCommit ajoute la garde de réservation et le règlement succeeded au batch de référence PDF. Le crédit et la sortie partagent donc un commit atomique. La route de test hérite des gardes administrateur/configuration ; aucune route ordinaire ne reçoit le contexte test.

## 2026-10-23 — Correctifs avant publication
`save-queue.ts` sérialise les écritures IndexedDB ; Workspace sauvegarde les instantanés modifiés, confirme uniquement l’instantané encore actif et reprend le pointeur de brouillon sessionStorage. `cloudDirty` ne dépend pas du succès local. Réponses de croquis bornées en streaming ; redirections fournisseur non suivies pour croquis/traduction. Création et renouvellement de session conditionnés atomiquement. Tests de traduction sur le Worker compilé.

## Saisie express par documents — 2026-10-23
Import JPEG/PNG/WebP/PDF par conducteur, extraction IA et sélection des champs avant application. Les modifications intervenues pendant la relecture sont protégées contre l'écrasement. Consentement explicite, documents non archivés par Accordia, aucune reconnaissance faciale. Limites : 3 Mio, images 4 Mpx, 5 tentatives/heure/compte et plafond IA global partagé de 100 appels/jour. Les échecs peuvent consommer une tentative.
Positionnement Premium affiché sur accueil, tarifs et formulaire en FR/EN/DE/NL. Achats toujours fermés : serveur refuse les comptes ordinaires (402), essai réel réservé au superadministrateur existant. Aucun droit payant ni paiement simulé. Avant ouverture commerciale : paiements réels, droits Premium vérifiés et tarif final.
Tests synthétiques uniquement ; extraction avec documents réels et compatibilité du modèle configuré restent à vérifier. Aperçu navigateur indisponible dans cette session.

## Audit transversal et synchronisation — 23 octobre 2026
Rapport : docs/AUDIT_SYNCHRONISATION_2026-10-23.md. Référence Sites 42 ; restauration before-sync-audit-20261023.
Offres vitrine dérivées de pricingCopy ; montants principaux partagés avec validation serveur via features/product/catalog.ts. Couverture documentaire commune dans formulaire, tarifs, compte/offres, vitrine, guide et tutoriel. Ajout des types remorque et identité du preneur avec champs distincts. États réseau/chargement/annulation/délai IA corrigés, libellés vitrine localisés, consentements clarifiés, règle permanente de synchronisation dans AGENTS.md.
Aucun droit commercial accordé, aucun achat ouvert, aucune donnée privée publiée. Validation : TypeScript, build Sites, 160 tests de la suite complète et un contrôle supplémentaire des pages compilées réussis (161 au total), zéro échec. Sept pages/rendus HTTP contrôlés : accueil, constat, compte, tarifs FR/EN/DE/NL. Recette visuelle et vraie lecture fournisseur non réalisées. L'audit n'est pas une certification exhaustive.

## Questionnaire guidé
questionnaire-model.ts construit des pages stables selon count/side/common ; groupes de compléments partagés avec detail-groups.ts. Questionnaire est un éditeur contrôlé du Report existant, utilise les mêmes callbacks et composants (GPS, circonstances, import documentaire). Aucun stockage parallèle, schéma ni migration. Composant commun QuestionnaireInfo pour les surfaces publiques et d’aide. Les permissions serveur restent autoritaires.

## Présentation et navigation 2026-10-23
experience-copy.ts centralise la nouvelle présentation ; FlowSteps et SaveStatus séparent phase et enregistrement. join-model.ts valide une navigation locale et ne donne aucun droit. /join rejoint l'API d'invitation existante via /session/id#invite ; token gardé dans le fragment. questionnairePages conserve son comportement exhaustif lorsqu'aucune sélection n'est fournie, et accepte des sélections conditionnelles d'affichage côté client sans changement de schéma Report. Aucune donnée personnelle copiée dans ces préférences.

## Présentation commune des offres — 23 octobre 2026

features/product/presentation-copy, site-header, plan-cards et offer-options centralisent textes FR/EN/DE/NL, navigation et cartes d’offres. pricing-copy continue de dériver les montants de product/catalog, également consommé par la validation serveur ; aucune attribution de droit depuis ces composants. offer-options respecte les quatre identifiants historiques et regroupe les flottes en une préférence. Le CSS product-ui est limité à l’écran. Home/Join acceptent une langue explicite validée ; les liens la conservent. Une reprise de dossier conserve ses propres langues enregistrées.

## 2026-11-01 — Démarrage sécurité/appareils
SafetyGate enveloppe Workspace et SessionClient ; acquittement en mémoire par identifiant, jamais écrit au dossier ou envoyé comme preuve. Les enfants restent montés et masqués pendant la relecture des consignes pour préserver l’état des formulaires et PDF. ParticipationModePicker route vers SameDevice, CloudPanel ou le formulaire ; participation-model conserve les valeurs et distingue personnes/véhicules. start.participationMode est facultatif dans le schéma Zod, sans migration SQL. QuestionnaireInfo et le premier tableau animé du tutoriel partagent onboarding-copy FR/EN/DE/NL. Les API continuent de vérifier identités, appartenances, côtés, révisions et consentements ; aucun contournement par le choix UI.
