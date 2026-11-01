# Audit transversal après publication de la version 49

Référence : 922a277a77f0b1c85f7729d61e623a20ef22159a. Version 49 publiée avec accès custom conservé, déploiement appgdep_6adb078806d48191a1a654180342859e. Restauration source : before-complete-audit-20261023.

## Périmètre et méthode

Relecture du code et des évolutions depuis les versions 45–49 ; contrôles de typage, build du Worker, tests unitaires/intégration sur D1/R2 locaux, rendus HTTP et refus d'accès anonyme. Scanner pnpm sur production puis sur l'ensemble des dépendances. Lecture des erreurs de production sur les trois dernières heures. Aucun document réel, appel fournisseur facturable, faux compte ou faux en-tête d'identité employé.

Ce rapport ne constitue ni une certification de conformité, ni un pentest indépendant, ni une validation de chaque écran sur téléphone.

## Constats confirmés et actions

| Priorité | Constat | Action |
|---|---|---|
| Moyenne | Compléments du questionnaire non raccordés aux listes déjà présentes dans le formulaire complet (pays, permis, point de choc, couverture) | Passage de lang et fieldPresets aux champs complémentaires ; saisie libre et valeurs historiques conservées |
| Moyenne | Page Rejoindre traduite visuellement mais langue du document non actualisée | Mise à jour de document.documentElement.lang en fonction de la langue sélectionnée |
| Haute | Scan global : 25 alertes, dont 11 élevées, dans des dépendances classées développement | Mises à jour ciblées de Vite, image-size, Undici, sharp et brace-expansion ; politique d'ancienneté conservée |
| Haute, ouverte | braces 3.0.3 : épuisement de pile sur motifs profondément imbriqués, aucune version corrigée indiquée | Pas de suppression forcée de dépendances ni de faux override. Risque consigné ; identifier une version amont corrigée ou une solution compatible dans un lot dédié |

## Dépendances

Production au début et à la fin : 0 alerte dans pnpm audit --prod.

Ensemble des dépendances : 25 → 1 alerte (élevée). Versions appliquées : Vite 8.1.6 ; Undici 7.29.1 ; image-size 2.0.3 ; sharp Miniflare 0.35.5 ; brace-expansion branches 1 et 5 vers 1.1.21 et 5.0.12. Versions et lockfile réconciliés par pnpm sans exception au délai minimum. Aucun changement de dépendance de production directe.

Alerte restante : https://github.com/advisories/GHSA-vfj7-8cjw-p6xm — consulté le 23 octobre 2026, version corrigée : None. Chemins du graphe : eslint-config-next → fast-glob → micromatch → braces et vinext → vite-plugin-commonjs → vite-plugin-dynamic-import → fast-glob → micromatch → braces. Le classement développement n'établit pas à lui seul l'inexploitabilité du code livré. Aucune route applicative exposant des motifs de glob à ces fonctions n'a été identifiée dans la revue ; absence universelle d'exposition non démontrée.

Les scans reflètent le registre lors de leur exécution, pas une garantie d'absence de vulnérabilité.

## Contrôles par domaine

| Domaine | Preuves examinées | Limites |
|---|---|---|
| Marques / assureurs / dégâts | Tests des 142 marques, anciennes valeurs et texte libre, suggestions de dégâts, doublons et limite de taille | Liste non exhaustive, pas de validation d'un contrat |
| Questionnaire | Validation sécurité/date/lieu/courriel, compléments conditionnels, reprise et conservation du véhicule masqué | Navigation réelle clavier/tactile non validée |
| Données et sauvegarde | File d'écriture sérialisée, récupération, fusion en présence de nouvelles saisies, CAS D1/R2 | Stockage navigateur local lié à l'appareil, non chiffré par compte ; fermeture avant confirmation non garantie |
| Sessions A/B | Droits serveur, invitation hachée/expirante/unique, isolation des fiches et langues, tests concurrence | Deux comptes et scan QR réels à essayer |
| Rejoindre | Origine locale, chemin strict, token uniquement dans fragment, rejet liens externes/doublons | Accès custom au site toujours nécessaire |
| API et identité | authorizedStores, compte actif, filtres propriétaire, origine, JSON/flux bornés, réponses privées no-store | Confiance dans les en-têtes d'identité du dispatcher Sites ; pas de validation d'un hébergement alternatif |
| Import documentaire IA | Contrôle admin/Premium, consentement, type/taille, quota, champs permis selon pièce et dates vérifiées, rôle réévalué après analyse | Qualité sur pièces réelles et modèle configuré non validés ; achats fermés |
| IA croquis et traduction | Refus des redirections, taille des réponses limitée, consentements par révision, tests quotas/réservations/reprises | Réponses synthétiques dans les tests, pas de mesure de qualité fournisseur réelle |
| PDF et signatures | Tests génération, styles, langues/annexes, conservation des versions et signatures invalidées sur modification | Modèle fourni reste français ; validation juridique et essai réel restent distincts |
| Paiements | Prix validés serveur, HMAC/idempotence, réservations de crédit, restrictions des routes de test | Commercialisation inactive, pas de paiement réel déclaré fonctionnel |
| Vitrine et langues | Descriptions communes, prix partagés, rendu accueil/compte/constat/Rejoindre et tarifs 4 langues | Pas de certification des traductions ni recette visuelle mobile |

## Exploitation et secrets

La consultation native des logs renvoie zéro événement d'erreur sur les trois dernières heures. Cela ne prouve pas l'absence générale d'incident ou de problème côté navigateur.

Recherche de motifs de clés OpenAI et de clés privées dans les fichiers Git suivis : deux correspondances, toutes deux des clés explicitement fictives de fixtures de tests. Aucune clé réelle identifiée par cette recherche limitée ; historique Git et coffre de secrets hors de ce scan. Les valeurs n'ont pas été reproduites dans le rapport.

## Points ouverts avant service commercial pleinement validé

1. Essais sur téléphones, navigation, focus, contrastes et messages de reprise.
2. Constat réel de bout en bout avec deux comptes autorisés, invitations, enregistrement, PDF et signatures.
3. Extraction, traduction et croquis avec documents autorisés et fournisseur réel.
4. Alerte braces sans correctif annoncé ; remplacement amont à étudier sans dégrader le build.
5. Activation commerciale/recette Stripe, hors de ce lot.
6. Synchronisation GitHub/Vercel non validée : le dépôt Sites synchronisé ne constitue pas une preuve de push dans linkinxhub/constat-amiable-europeene.

Aucune fonction ni donnée supprimée, aucune migration destructive, aucun élargissement d'audience. Les correctifs de ce lot sont destinés à être publiés après contrôles, conformément à « publier et audit complet ».

Validation finale de l’état publié : TypeScript, build Sites, git diff --check et 177 tests réussis, zéro échec. Tests incluent rendus des huit pages et refus anonymes des routes privées. Scans de dépendances séparés production/développement conservés dans les conclusions.
