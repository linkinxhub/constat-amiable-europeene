# Accordia — audit complet de la version 71

Date : 2 novembre 2026, Europe/Berlin. Audit technique et fonctionnel du périmètre disponible ; ce rapport n’est ni un pentest indépendant, ni une certification de sécurité, ni une validation d’acceptation par un assureur.

## Conclusion

Les contrôles automatisés de la plateforme réussissent, mais la plateforme ne peut pas être déclarée prête à 100 % pour une ouverture commerciale générale. Un défaut de cohérence véhicule/remorque est reproductible. Une vulnérabilité modérée de développement maintient la CI en échec. La recette réelle à deux conducteurs/téléphones, la validation des fournisseurs IA en production et la preuve de restauration après incident restent à compléter.

Aucune correction fonctionnelle ni publication n’est réalisée dans cet audit. Les données réelles, accès, abonnements, clés, signatures et PDF historiques ne sont pas modifiés. Les priorités ci-dessous décrivent l’ordre de travail recommandé ; elles ne constituent pas toutes des vulnérabilités de sécurité.

## Références vérifiées

- Production : version 71, source `85631a151fe16171423c565dc82ed57de44e0b02`, déploiement `appgdep_6ae81a47311c81919c865e55f5b365df` publié avec succès. Archive native présente et source concordante.
- Dépôt inspecté : HEAD `9453c951cf41601dfa2aaadefc9e73b525efb2ab`, arbre initial propre. L’écart avec la source publiée concerne seulement STATUS.md et CHANGELOG.md, consignation de publication.
- Source GitHub applicative : `23d8b6667f0f0475d18d2cbc6570c0087019950f`. Workflow réel 41371459935, job 125042632917.
- Accès hébergé : custom, deux visiteurs externes, inchangé. Une invitation au constat ne donne pas automatiquement accès au site.
- Point de restauration : `before-audit-v71-20261102`.
- Instructions examinées : AGENTS, PRODUCT_SPEC, ARCHITECTURE, ROADMAP, STATUS, DECISIONS, TEST_PLAN et rapports d’audit antérieurs.

## Méthode et limites

Relance complète TypeScript → ESLint → compilation → tests après compilation. Audit pnpm complet et production séparés. Lecture des contrôles serveur, schémas, sauvegardes, choix véhicule/remorque, rétention, CI et droits A/B. Sondes locales sans écriture pour les contradictions. Consultation native de la production et des journaux. Vérification navigateur du site publié, du passage formulaire → Mon compte et du menu → Guide. Pas d’injection d’identité, de nouvel appel IA payant, d’achat, de modification de dossier en ligne ou de signature.

La recette mobile FR/EN/DE/NL et l’inspection des PDF de la v71 ont été effectuées dans le lot précédent sur cette même source applicative. Elles ne sont pas présentées comme une nouvelle recette mobile intégrale dans ce lot. La suite actuelle rejoue les tests quatre langues, PDF, restrictions de participant et API compilées. Deux téléphones physiques, deux connexions indépendantes et le téléchargement final depuis le navigateur de test ne sont toujours pas validés de bout en bout.

## Résultats mesurés

| Contrôle | Résultat actuel | Limite |
|---|---|---|
| TypeScript | Réussi | Typage, pas une preuve d’absence d’erreur métier |
| Compilation | Réussie | Worker et client compilés avant tests |
| Tests | 274 réussis, 0 échec | Fournisseurs contrôlés pour certaines intégrations |
| ESLint | 0 erreur, 55 avertissements | 14 dépendances de hooks, 30 symboles inutilisés, 7 images natives, 4 navigations complètes |
| Dépendances production | 0 vulnérabilité signalée, 280 dépendances comptées | Base d’avis du jour, pas un pentest |
| Dépendances complètes | 1 avis modéré ; 0 élevé/critique signalé | Minimatch transitif de développement |
| CI GitHub, source applicative | Échec confirmé | Installation, vérification et audit production réussissent ; audit complet échoue |
| Scan de secrets ciblé | Aucun motif de clé privée, clé fournisseur longue ou jeton GitHub trouvé dans les fichiers suivis inspectés | 520 fichiers suivis inventoriés ; pas de scan de tout l’historique, des secrets de plateforme ni d’identifiants génériques |
| Production, navigateur | Accueil, compte et guide accessibles ; choix d’offre chargé | Une session disponible, pas deux identités |
| Journaux production | Échantillon retourné : deux GET /api/document-extraction en 401, outcome ok | Fenêtre demandée 180 min, maximum 25 événements ; aucune conclusion globale sur la disponibilité |

Les 401 d’extraction correspondent à un refus d’authentification ; ils ne démontrent ni un crash ni une extraction réussie. Les erreurs navigateur observées sur le compte proviennent d’une extension Chrome, pas du code applicatif. Aucun incident serveur 500 n’a été constaté dans l’échantillon retourné.

## Constats priorisés

### V71-01 — Priorité 1 : audit de développement et CI non verts

**Confirmé.** Le scan complet signale Minimatch, GHSA-g3hv-75wg-m249 / CVE-2026-118764, sévérité modérée. Le scan production reste vide. Les chemins signalés concernent l’outillage ESLint. L’avis indique une amplification de ressources via certains motifs glob et une correction à partir de 11.0.1 ; cela ne démontre pas une exploitation du site par un conducteur. La CI réelle échoue à l’étape « Audit all dependencies », après réussite des autres contrôles.

Preuves : `.github/workflows/quality.yml:45`, `pnpm-lock.yaml`, audits pnpm du jour et job GitHub cité. Source primaire vérifiée : https://github.com/advisories/GHSA-g3hv-75wg-m249 . La politique du dépôt impose sept jours de délai minimum. Ne pas masquer l’avis, réduire le seuil ou imposer sans tests une version majeure à tous les consommateurs.

**Action et acceptation :** préparer une mise à niveau compatible des consommateurs, respecter la politique de dépendances, relancer installation figée, tests, audit complet et CI ; la livraison de cette correction exige tous les contrôles verts. La sévérité de sécurité de l’avis reste modérée même si cette action est prioritaire pour la qualité de livraison.

### V71-02 — Priorité 2 : type « sans remorque » accepté avec une plaque de remorque

**Défaut métier confirmé.** `vehicleKindValid` exige une plaque pour un attelage, mais ne détecte pas la situation inverse. Changer un camion avec remorque en camion sans remorque conserve correctement la plaque et affiche un avertissement dans la saisie. Le rapport peut néanmoins rester complet et finalisable avec cette contradiction, et le PDF reprend les deux informations.

Preuves : `features/constat/vehicle-kind.ts:6`, `vehicle-kind-fields.tsx:10`, `completeness.ts`, `server/reference-page.ts`. Reproduction indépendante et sans stockage :

```sh
node --experimental-strip-types scripts/audit-v71-probes.mjs
```

Résultat : type truck, trailerRecorded=true, typeAccepted=true, complete=true, finalMissing=[]. La sonde vérifie la présence du défaut ; elle n’est pas une régression verte prouvant sa réparation.

**Action et acceptation :** conserver les valeurs, mais demander une résolution explicite avant finalisation : corriger le type ou retirer/corriger les informations de remorque par action volontaire. Faire appliquer la même règle au questionnaire, formulaire complet, appareil commun, session partagée et serveur. Ajouter des tests pour les deux sens du changement, A/B, dossiers anciens et champs de pays seuls. Aucune suppression automatique.

### V71-03 — Priorité 2 : purge physique dépendante de l’activité

**Limite opérationnelle confirmée, déjà documentée.** `server/retention-maintenance.ts:10-13` retourne mode on_activity : sans requêtes, aucun nettoyage n’est exécuté. Les contrôles d’expiration bloquent l’accès, mais ne garantissent pas une suppression physique à l’échéance sans trafic. La copie locale exige aussi de rouvrir le navigateur pour être nettoyée.

**Action et acceptation :** déclencheur serveur périodique indépendant des visites, reprise après échec, métrique du retard et preuve de purge D1/R2 ; garder les verrous, quotas et garde-fous existants. Ce point ne démontre pas un accès à un dossier expiré.

### V71-04 — Priorité 2 : validations réelles manquantes avant ouverture générale

**Écart de recette, pas une panne démontrée.** Pas de preuve actuelle d’un cycle complet A/B avec deux connexions/téléphones physiques, autorisations caméra refusées/acceptées, perte et reprise réseau, lien expiré, modification concurrente, deux relectures/signatures et téléchargement final. Les tests contrôlés ne remplacent pas cette recette. OCR Express public et achats restent fermés volontairement ; aucun achat ni fournisseur n’a été activé pour l’audit.

**Action et acceptation :** dossier fictif sur deux comptes autorisés, matrice Android/Chrome et iPhone/Safari, appareils communs et séparés ; pièces A/B distinctes ; vérifier contenu des champs et PDF final téléchargé, stockage et reprise après connexion. Pour IA, valider avec le fournisseur réel et les consentements applicables dans un lot autorisé, sans convertir un succès de mock en succès de production.

### V71-05 — Priorité 3 : le type reste facultatif, même sur une fiche neuve

**Comportement confirmé, partiellement intentionnel pour les anciens dossiers.** `model.ts:7` rend kind optionnel et le sélecteur conserve une option vide. Le questionnaire peut continuer sans choisir de type si les autres contraintes sont satisfaites. Cela préserve les anciens dossiers mais permet aussi à un nouveau dossier d’éviter l’orientation camion/remorque.

**Action proposée :** exiger le choix pour les nouvelles fiches via une distinction explicite de version/migration, sans bloquer arbitrairement les anciens constats ni inventer leur type. Critère : nouveau dossier orienté, ancien dossier ouvrable et valeurs intactes ; contrôles finaux cohérents côté serveur. À traiter comme une décision produit avant modification.

### V71-06 — Priorité 3 : dette de qualité et documentation historique

55 avertissements restent présents. Les avertissements de dépendances de hooks justifient une revue des fermetures asynchrones ; ils ne prouvent pas chacun une erreur. Les images natives ont aussi des raisons techniques documentées. Ne pas les remplacer globalement ni désactiver les règles pour faire disparaître le compteur.

Les spécifications et l’architecture juxtaposent des états anciens (« pas de backend », « non publié », sauvegarde uniquement manuelle) et les nouveaux lots. STATUS fournit l’état courant, mais la lecture historique demande encore une consolidation. Certaines anciennes chaînes de rétention subsistent ; leur existence seule ne prouve pas leur affichage.

**Action et acceptation :** lots limités de nettoyage, prioriser les hooks réellement sensibles, vérifier chaque changement avec tests ciblés ; établir un état courant des documents séparé de l’historique. Aucun tarif, droit ni disponibilité ne doit changer par simple nettoyage.

## Fonctions et protections vérifiées

- Origine, en-tête d’intention et Content-Type contrôlés pour les écritures ; lecture JSON bornée en taille et délai, UTF-8 strict.
- Identité côté hébergement/serveur ; propriétaire et suspension revérifiés pour les données ; schéma enum refusant un type arbitraire.
- Session A/B : propre fiche uniquement, CAS/révisions et conflits, suspension, invitations et consentements ; tests D1/R2 exécutés.
- Plaque de remorque absente pour un attelage : détectée dans les validations existantes. Matrice des 36 combinaisons A/B, ancienne fiche, B inactif et conservation après OCR couverts.
- Sauvegarde locale, reprise, absence de transfert automatique dans le compte, attente avant connexion et conflits serveur couverts par les tests.
- PDF : types et remorque, données originales et traductions séparées, portée A/B active, QR sans token d’invitation dans sa cible ; documents historiques et invalidation des signatures couverts.
- IA : droits, consentement, quotas, erreurs et budgets couverts avec fournisseurs contrôlés ; pas de revendication de qualité d’une sortie réelle dans cet audit.
- Paiement : parcours de test et prix serveur couverts ; achats publics fermés, aucune facturation effectuée ici.

## Hypothèse écartée : Mon compte sur une fiche neuve

Une sonde artificielle appelant prepareDraftSignIn avec un identifiant vide échoue si la sauvegarde en alloue un autre. Cette sonde ne représente pas l’état normal après montage de Workspace : `workspace.tsx:46` attribue un identifiant avant interaction. Le navigateur a bien ouvert Mon compte depuis le formulaire publié. Ce cas est retiré des anomalies ; ne pas le présenter comme un blocage utilisateur confirmé.

## Critères avant lancement commercial plus large

1. Corriger V71-02 et obtenir une CI verte sur les dépendances sans suppression d’avis.
2. Recette réelle documentée à deux comptes/téléphones avec le PDF final téléchargé.
3. Définir et tester l’accès grand public : l’accès custom actuel est volontairement conservé ; l’invitation seule ne suffit pas.
4. Établir une preuve de restauration après incident de la base et des objets, avec objectifs de perte/reprise ; aucune procédure de restauration opérationnelle vérifiée n’a été fournie dans cet audit.
5. Déclenchement régulier de la purge, supervision et alertes d’échec, support de reprise de dossier.
6. Validation des droits d’utilisation du modèle de constat, des mentions et du périmètre d’acceptation ; le modèle fourni porte une mention de copyright. Aucune licence ni acceptation assureur n’est présumée par ce rapport.
7. Les brouillons locaux restent non chiffrés par l’application et liés au navigateur ; décider une protection adaptée aux appareils partagés et expliquer les limites. Une sauvegarde de brouillon de compte ne sauvegarde pas les signatures/PDF en mémoire du mode appareil commun.
8. Maintenir les achats et Express public fermés tant que leurs conditions réelles de service et de validation ne sont pas réunies.

## Livrables et état final

Rapport présent, script de sondes locales, STATUS et CHANGELOG actualisés. Aucun endpoint, champ, droit, dépendance, comportement du guide ou donnée utilisateur modifié. Guide vérifié, aucun impact utilisateur : audit et consignation uniquement. Les modifications de documentation n’exigent pas de nouvelle publication du site. Production v71 conservée.

## Suivi du 2 novembre — correction en développement
V71-02 est corrigé dans le lot de confort post-v72 : conflit type/remorque refusé par la complétude, les parcours A/B et la finalisation serveur, valeurs conservées. Matrice de non-régression dans tests/comfort.test.mjs ; scripts/audit-v71-probes.mjs attend désormais le rejet. La photographie historique de l’audit ci-dessus reste valable à sa date. Correction non publiée dans ce lot.
