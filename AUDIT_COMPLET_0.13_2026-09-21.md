# Audit complet Accordia 0.13 — 21 septembre 2026

## Conclusion
La version 0.13 est publiée. Les contrôles automatisés passent, mais la recette réelle à deux comptes et la qualité du fournisseur IA restent à valider. Deux priorités fortes subsistent : permettre de corriger/refaire une traduction et traiter les alertes de dépendance. Aucun correctif applicatif n’a été réalisé pendant cet audit.

## Version et périmètre
- Source applicative : `d1225bc468d05f35b110604256ddaabfd444b980` ; version Sites 17.
- Déploiement `appgdep_6ab10caab0848191987a89bd440874b1`, réussi le 21 septembre 2026 à 10:53:54 UTC.
- Site : https://accordia-constat.adil-btp.chatgpt.site ; audience existante propriétaire et conducteur B conservée, sans ouverture publique.
- Revue du formulaire, sessions A/B, invitations, permissions, stockage, administration IA, consentements, traduction, préparation PDF, signatures, guide et dépendances.
- Les constats ci-dessous distinguent reproduction locale, revue de code et limite opérationnelle. Il ne s’agit pas d’un test d’intrusion exhaustif ni d’une certification.

## Vérifications et preuves
- TypeScript : `pnpm exec tsc --noEmit` réussi.
- Suite complète relancée : `node --experimental-strip-types --test tests/*.test.mjs` : **72 tests, 0 échec**, dont 26 contrôles de routes Worker anonymes/no-store.
- Construction finale de cette source réussie avant publication ; non répétée pendant cet audit, sans modification applicative.
- Trois sondes locales reproductibles : `node --experimental-strip-types tests/audit-013-probes.mjs`. SQLite en mémoire, stockage simulé et réponses IA synthétiques ; aucune déclaration réelle transmise.
- Scanner : 2 alertes élevées, aucune critique, modérée ou faible.
- Recherche de motifs de secrets usuels dans 246 fichiers suivis : aucun fichier correspondant. Ne couvre pas tout l’historique Git ni l’infrastructure.
- Journaux de production demandés sur 60 minutes, erreurs uniquement : aucun événement retourné. Cela ne prouve pas que tous les parcours ont été utilisés.
- Preview : présence du formulaire, commandes de partage et guide/traduction vérifiée. Validation précédente de la même version : PDF allemand synthétique inspecté, langue DE→NL, conteneur de 390 px sans débordement. Aucun téléphone physique testé.

## Constats priorisés

### A13-01 — P1 — Traduction erronée sans reprise indépendante
**Reproduit.** `server/translation-service.ts` accepte une sortie structurée non vide ; cette validation ne garantit pas le sens. La sonde remplace « Je ne roulais pas. » par une phrase allemande affirmant une conduite à 120 km/h et une responsabilité. La sortie simulée est acceptée dans un PDF non signé. Le rapport original est préservé.

`server/final-service.ts` réutilise ensuite le PDF traduit pour la même révision/langue/style/croquis. Une seconde demande avec un fournisseur simulé corrigé renvoie le même document, sans nouvel appel. `features/constat/final-panel.tsx` ne propose pas de correction/rejet/régénération du texte traduit.

**Impact :** une mauvaise traduction n’a pas de parcours de réparation indépendant du constat original. La relecture et les signatures obligatoires atténuent le risque, sans résoudre cette impasse. Cette sonde ne prétend pas qu’OpenAI a réellement produit cette erreur.

**Correction :** brouillon de traduction révisable, comparaison avec les originaux, rejet/refaire explicite et versionnement séparé ; nouvelle empreinte et nouvelles signatures après toute correction. Tester négations, nombres, directions et conservation des originaux.

### A13-02 — P1 — Deux alertes élevées dans image-size
**Scanner et revue de dépendance.** Version transitive 2.0.2 via Vinext. Les avis [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr) et [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq) décrivent des boucles infinies sur certains fichiers ICNS/JXL/HEIF.

L’usage trouvé dans Vinext concerne les dimensions des fichiers de métadonnées du dépôt (`dist/server/metadata-route-build-data.js`). Aucun chemin vers les photos téléversées n’a été trouvé ; une exploitation distante du site n’est pas démontrée.

**Correction :** vérifier puis installer une version corrigée compatible et reconstruire. Le scanner indique `>=2.0.3`, tandis que les pages d’avis consultées affichent encore aucune version corrigée : vérifier cette divergence. Le délai minimal de sept jours du projet exclut encore la version récente au moment du contrôle ; il n’a pas été contourné.

### A13-03 — P2 — Préparation avant les deux confirmations de fin
**Reproduit.** `server/final-service.ts` vérifie la présence de B et les champs requis, sans exiger les statuts de fin A/B. La sonde retourne `doneA:false`, `doneB:false`, `pdfPrepared:true`. Le panneau partagé ne bloque pas cette situation.

**Impact :** préparation prématurée et traduction potentiellement consommée alors que les participants travaillent encore. Aucun contournement des deux signatures démontré.

**Correction :** exiger les deux confirmations pour la préparation finale, ou distinguer explicitement un aperçu provisoire. Tester l’invalidation après correction.

### A13-04 — P2 — Rafraîchissement des sessions trop volumineux
**Revue de code.** `features/constat/session-client.tsx` recharge toutes les dix secondes ; `server/session-service.ts` relit le rapport complet, photos base64 incluses. Pas de requête légère de révision ni de transfert limité aux changements. La mesure JSON du brouillon s’exécute également lors des rendus.

**Impact estimé :** six photos de 1 Mio représentent environ 8 Mio en base64, donc jusqu’à 48 Mio/minute/client avant compression si le rapport complet est retourné à chaque passage. Ce chiffre est un calcul de borne, pas une mesure réseau réelle.

**Correction :** statut/révision légers, rapport seulement sur changement, médias séparés, suspension du polling en arrière-plan et mesure de taille mise en cache. Vérifier deux appareils avec photos sur réseau lent.

### A13-05 — P2 — Récupération du stockage non bornée par lot
**Reproduit.** `server/object-storage.ts` parcourt les références historiques et fait une recherche par objet. Avec 1 500 objets historiques supplémentaires, la sonde compte 1 510 instructions préparées.

**Impact :** coût et risque de dépassement de durée/quotas augmentant avec l’historique. Aucun dépassement réel Cloudflare démontré.

**Correction :** recherches en ensemble, lots bornés et curseur de reprise ; tester plusieurs milliers de références en conservant tous les PDF signés.

### A13-06 — P2 — Plafond de 20 PDF sans parcours de reprise
**Revue de code / limite produit.** `server/final-service.ts` compte toutes les versions, y compris non signées et linguistiques. À 20 documents, une nouvelle version distincte est refusée. Aucun compteur ni parcours d’archivage/suppression contrôlé n’est proposé.

**Impact :** les essais de langues/styles et corrections peuvent bloquer la poursuite d’un dossier.

**Correction :** afficher le compteur, distinguer brouillons et versions signées, définir une gestion explicite de capacité qui préserve les pièces signées. Ne pas supprimer automatiquement les preuves.

### A13-07 — P2 — Noms de téléchargement ambigus
**Revue de code.** `app/api/sessions/[id]/final/[document]/pdf/route.ts` utilise des noms génériques de relecture/signatures, sans langue, identifiant ni révision.

**Impact :** confusion entre plusieurs versions téléchargées.

**Correction :** nom incluant référence courte du constat, langue, révision et statut ; tester plusieurs langues dans un même dossier de téléchargement.

### A13-08 — P2 — Absence de budget IA global
**Revue de code / exploitation.** Les plafonds par session existent : trois appels croquis et six essais traduction par heure. Aucun budget global du propriétaire ni tableau de consommation n’a été trouvé. L’audience restreinte réduit l’exposition.

**Correction :** plafond global, suivi d’usage sans contenu sensible, alertes et arrêt contrôlé. Tester plusieurs sessions concurrentes avec fournisseur simulé. Les limites locales ne constituent pas un plafond financier global.

### A13-09 — P3 — Traçabilité d’administration limitée
**Revue de code / exploitation.** La configuration IA conserve l’état courant et sa révision, sans historique dédié des activations, désactivations et rotations. La reprise du rôle reste une opération technique.

**Correction :** journal d’actions minimal sans clé ni récits, et procédure de récupération du rôle vérifiée. Le super administrateur ne doit pas recevoir de droit supplémentaire sur les dossiers.

### A13-10 — P3 — Portée de la traduction à préciser dans le guide
**Preview et code.** La présentation générale de la traduction apparaît aussi dans le guide local, sans indiquer immédiatement qu’elle exige une session partagée authentifiée. Le mode sur appareil commun ne propose pas cette traduction.

**Correction :** indiquer les modes compatibles, les deux consentements et l’emplacement exact de la commande. Conserver l’explication : modèle original français, copie de lecture localisée et signatures propres à chaque version.

## Protections confirmées et continuité du précédent audit
Les tests couvrent les refus anonymes/tiers, permissions par participant, révisions, suspension au commit, consentements distincts/révocables, conservation des originaux et signatures propres à chaque PDF. La clé IA est chiffrée côté serveur et non renvoyée au navigateur. L’administration ne donne pas accès aux constats d’autrui.

Les correctifs 0.11 restent présents : réponses réseau désordonnées, statut local de sauvegarde, séparation des historiques, conservation locale explicite, validation PNG/signatures, refus APNG, exclusion de l’aperçu WebP non vérifié, gardes IA et remboursement des opérations échouées. Le risque de volume de récupération identifié ici est distinct de leur fonctionnement transactionnel déjà corrigé. Les alertes RSC du précédent audit ont disparu ; les deux alertes image-size demeurent.

## Recette encore nécessaire
1. Deux comptes autorisés sur deux appareils : invitation, entrée B, saisie simultanée, fin A/B, corrections, PDF et signatures dans deux langues.
2. Clé/modèle réels : connexion puis génération croquis/traduction avec les consentements requis ; contrôle humain de la fidélité. Le test de connexion seul ne valide pas la génération.
3. GPS et QR sur téléphone physique, réseau instable, lecteurs PDF, zoom et lecteur d’écran.
4. Sauvegarde/restauration d’infrastructure, politique de rétention et supervision. Les tests locaux de récupération ne remplacent pas une restauration réelle.
5. WebP : original joint ; aucun décodage serveur complet ni garantie d’aperçu original identique revendiqués.

## Ordre recommandé
Traiter A13-01 et A13-02 ; clarifier la préparation finale et alléger les échanges (A13-03/04) ; borner la récupération et gérer les versions (A13-05/06) ; compléter noms, budget et guide. Faire ensuite la recette réelle A/B avant d’élargir l’usage.

Le script `tests/audit-013-probes.mjs` documente les comportements observés : ses assertions ne spécifient pas le comportement souhaité après correction. Les convertir en tests de non-régression lors des correctifs.
