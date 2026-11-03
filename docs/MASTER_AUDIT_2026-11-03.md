# Accordia — Master audit du 3 novembre 2026

## Verdict et périmètre
Base cohérente pour un pilote encadré, pas une validation d’ouverture commerciale générale.
Audit du site, du serveur et de l’application Flutter ; intégration du splash n° 2 autorisée.
Les autres améliorations sont hiérarchisées ci-dessous, sans modification silencieuse de
l’identité, des abonnements, des droits, de la rétention ou de l’audience.
Ce contrôle de sources, tests et interface ne constitue pas un pentest indépendant.

Référence initiale : source 762620f, branche feat/azur-internal-20261103, dépôt propre.
Branche de travail : feat/splash-serenity-audit-20261103 ; checkpoint/before-splash-master-audit-20261103.
Source canonique principale 7a6586a récupérée et comparée, sans nouvelle divergence à fusionner.
Site v84 : publication vérifiée succeeded, source 7a6586a, déploiement
appgdep_6ae9b3e9fd888191a6d4449abca746b3. Audience custom conservée.
L’APK Azur précédent est 0.4.0+6 ; la nouvelle introduction est développée en 0.4.1+7.
Aucun déploiement productif, envoi assureur, paiement ou modification de données réelles.

## Contrôles exécutés

| Contrôle | Résultat et limite |
|---|---|
| Pipeline node scripts/verify-platform.mjs | TypeScript, ESLint, build puis 328 tests réussis ; 0 échec/ignoré |
| Lint | 0 erreur, 55 avertissements ; pas une absence de dette technique |
| Première exécution du lint global | Échec mémoire vers 2 Gio en parcourant les caches générés ; exclusions de caches natives/runtime ajoutées, pipeline complet relancé avec succès |
| Dépendances production : pnpm audit --prod | 0 alerte retournée à la date du contrôle ; ne garantit pas l’absence de vulnérabilité inconnue |
| Dépendances complètes : pnpm audit | 1 modérée de développement, aucune élevée/critique retournée |
| Scan ciblé de secrets | 674 fichiers texte suivis, 52 binaires/gros fichiers exclus, aucun motif de clé privée/OpenAI/GitHub/AWS retenu ; historique et infrastructure exclus |
| Logs production, 180 min / max 25 | 9 requêtes GET /products.json retournent 404, outcome ok ; aucune panne 5xx dans cet échantillon. Ne pas créer une route commerciale pour ces sondes ni assimiler ces 404 à la panne de connexion OpenAI |
| Preview locale | Délai de démarrage dépassé ; aucune modification réseau ni contournement. Recette de la version de travail en navigateur non validée |
| Navigateur publié | Vitrine française chargée, largeur 1363 px / document 1348 px, aucun bouton sans nom dans l’heuristique ; consignes et choix des trois parcours visibles, Continuer désactivé sans choix ; bascules FR/DE/NL/EN vérifiées sans dossier serveur ni données personnelles |
| Flutter | Analyse et tests détaillés dans docs/mobile/SPLASH_SERENITY.md ; compilation Android vérifiée séparément |

Les 328 tests couvrent notamment isolation de dossiers, A/B, invitations expirées et
réutilisées, CAS/conflits, consentements, PDF/version/signatures de test, OCR/IA, quotas,
permissions administratives, sauvegarde/restauration locale isolée et cohérence des offres.
Ils ne prouvent ni connexion téléphonique réelle, ni qualité OCR sur pièces réelles, ni
validité juridique universelle, ni sauvegarde restaurable en production.

## Constats prioritaires

| ID / priorité | Constat et preuve | Action et critère d’acceptation |
|---|---|---|
| MA-01 / P1 | Connexion mobile non qualifiée ; erreur fournisseur signalée auparavant ; navigation externe volontairement désactivée dans lib/platform/page.dart et lib/main.dart | Obtenir une connexion mobile officiellement supportée par l’hébergement. Deux vrais comptes autorisés, reprise après fermeture, invitation et retour à la fiche. Aucun faux cookie, jeton de contournement ou rôle client |
| MA-02 / P1 | tel:112 est bloqué par _external : seuls les HTTPS sûrs sont acceptés. Conséquence directe du choix « ne jamais sortir » | Prévoir une exception explicite aux appels d’urgence, ou une fiche secours immédiatement lisible avec numéro à composer. Ne pas lancer le téléphone ni changer ce choix sans décision produit. La saisie doit rester récupérable |
| MA-03 / P1 avant ouverture | retention-maintenance.ts annonce mode on_activity ; sans trafic, pas d’exécution. Pas de preuve de restauration productive collectée | Ordonnancement indépendant, supervision, sauvegardes chiffrées et exercice de restauration isolé avec preuve. Ne pas purger ou restaurer la production dans cet audit |
| MA-04 / P1 avant distribution | APK de test debug, signature de CI et packages séparés, pas de recette iOS ; stockages des anciennes installations distincts | Signature stable et sécurisée, stratégie d’évolution/migration avec consentement, tests Android/iPhone, canaux de distribution et déclaration de confidentialité avant stores |
| MA-05 / P2 | Les champs admin titre/couleur/introduction/durée/son sont consommés ; les médias restent embarqués et designId n’active pas plusieurs interfaces natives distinctes | Ajouter une vraie bibliothèque de médias publiée/versionnée avec aperçu, cache valide et retour arrière ; raccorder chaque design proposé ou signaler sa disponibilité exacte. Vérifier l’application sur un téléphone après publication de configuration |
| MA-06 / P2 | Présélection A+B par entry=same-device développée sur la branche Azur mais absente de la source productive 7a6586a | Recette Preview, puis publication autorisée ; mode confirmé par l’utilisateur et dossier existant jamais remplacé silencieusement |
| MA-07 / P2 | Couleur admin arbitraire autorisée ; l’en-tête natif conserve des commandes blanches sur un dégradé qui finit dans la couleur choisie | Borner le contraste des couleurs claires, tester les couleurs autorisées et le texte agrandi dans les quatre langues. Cobalt par défaut ne dispense pas du cas #ffffff |
| MA-08 / P2 | Lecteur vidéo HTML et contrôleur de narration restent indépendants dans accident-story.tsx/story-video-actions.tsx | Un seul propriétaire sonore ; démarrer l’un suspend l’autre, dans les deux sens. Constat source ; reproduction perceptuelle et audibilité non validées ici |
| MA-09 / P2 | Minimatch de développement signalé par GHSA-g3hv-75wg-m249 ; production auditée sans alerte | Mise à jour compatible et lockfile testé, sans désactiver le contrôle d’ancienneté. Avis amont : https://github.com/advisories/GHSA-g3hv-75wg-m249 ; correctif annoncé 11.0.1 |
| MA-13 / P2 | En production, le formulaire bascule DE/NL/EN, ses liens latéraux changent de langue, mais le bouton flottant « Donner mon avis ↗ » reste français avec lang=fr | Synchroniser sa langue avec la langue active du formulaire, pas seulement la query initiale ; recette des quatre langues et navigation retour |
| MA-10 / corrigé | Ancien splash supprimé dès la fin du cache ; son déclenché après l’introduction | Nouvelle séquence locale, fin explicite, Passer, mouvement réduit, pause arrière-plan et son au début si activé. Tests dédiés et rendu Flutter |
| MA-11 / corrigé | Lint global absorbait les caches de développement et dépassait la mémoire | Ignorer seulement caches/output générés, conserver tous les contrôles des sources ; pipeline complet réussi |
| MA-12 / P2 | Brouillons natifs, web et navigateur séparés ; les liens SMS/universal links ne sont pas enregistrés | Afficher clairement « sur ce téléphone » / « sur mon compte », reprise avec état de synchronisation réel, export chiffré et liens OS vérifiés après signature stable. Aucun transfert automatique de secret |

P1 signifie une priorité de qualification ou un risque produit confirmé, pas nécessairement
une faille exploitable démontrée. Aucun test de connexion ne doit confondre accès au site,
identité du conducteur, rôle administrateur et abonnement commercial.

## Améliorations recommandées pour toute la plateforme

1. **Parcours de confiance** : accueil A/B/A+B, reprise du dernier dossier, origine de sauvegarde
   visible, statut « enregistré » seulement après accusé réel, aide courte à chaque blocage.
2. **Mode accident** : consignes visibles, commande secours accessible, saisie courte à une main,
   grosses zones tactiles, pièces proposées au bon moment et jamais exigées pour expliquer les faits.
3. **Collaboration A/B** : présence et dernière synchronisation réelles, connexion invitée expliquée,
   progression de chaque fiche sans lecture abusive, conflit explicite et conservation des originaux.
4. **Documents et IA** : qualité de photo avant OCR, mise en évidence des valeurs incertaines,
   validation champ par champ, statut du traitement/reprise, aucun abonnement ou résultat simulé.
5. **PDF** : bibliothèque de versions, distinction préparation/document final, langue des annexes et
   du modèle expliquée, mêmes octets aux participants, lecture et partage internes après contrôle.
6. **Administration** : aperçu téléphone fidèle à la version Flutter, médias et séquences de splash
   publiables avec historique, comparaison avant/après, déploiement progressif et retour arrière.
7. **Design et accessibilité** : palette Azur partagée, relief discret et lisible, contraste automatique,
   clavier/lecteur d’écran, texte 200 %, paysage et petits écrans, mouvement réduit sur tout média.
8. **Exploitation** : supervision sans données d’accident, alertes d’échecs, suivi des sauvegardes et
   restaurations, purge planifiée, audit des accès, limites et facturation contrôlées côté serveur.
9. **Commercialisation** : conserver les achats fermés tant que paiement, attribution, remboursement,
   quotas et pièces réelles ne sont pas qualifiés ; une préférence commerciale n’active aucun droit.

## Ordre conseillé et critères de sortie

| Lot | Périmètre | Preuve attendue |
|---|---|---|
| 1 | Connexion mobile et secours | Deux comptes et deux appareils, reprise de saisie et décision explicite pour 112 |
| 2 | Sauvegarde et collaboration | Coupure réseau, conflit, accusé réel, zéro perte et PDF final identique |
| 3 | Administration et qualité visuelle | Configuration publiée visible sur appareil, média invalide refusé, rollback, contraste et quatre langues |
| 4 | Exploitation et distribution | Restauration isolée, ordonnanceur supervisé, signature stable, build iOS et recette terrain |
| 5 | IA/Express et commercial | Pièces réelles ambiguës, validation humaine, fournisseur/quota/facturation prouvés |

Pas de refonte globale ni d’activation commerciale suggérée avant les lots 1–4.
Le splash est un embellissement livré séparément ; il ne résout pas l’authentification.
