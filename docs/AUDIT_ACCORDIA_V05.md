# Audit Accordia — version 0.5

Date : 20 septembre 2026. Source examinée : `9b3103f17eb05a1d903ffbde9139b26279c0c98c` (version Sites 5 enregistrée, non publiée).

## Conclusion

La base technique dispose de protections utiles et les tests existants passent. Elle n’est pas prête à être utilisée pour des constats réels sans une phase de correction et une recette à deux comptes/appareils. Les problèmes les plus importants concernent la fidélité entre saisie, relecture, IA et PDF, les limites des pièces jointes et quelques garanties serveur encore incomplètes.

Cet audit porte sur le code, la documentation, les tests locaux et des sondes ciblées. Il ne constitue ni un pentest externe ni une validation juridique. Aucun code applicatif corrigé, aucune donnée réelle utilisée, aucun appel IA et aucune publication. Les constats de lecture sont distingués des reproductions exécutées.

## Stack et vérifications

React 19, TypeScript, Vinext/Vite, pnpm, composants Shadcn/Base UI, Zod, Drizzle, Cloudflare D1/R2 ; pdf-lib/fontkit pour les PDF. Identité ChatGPT fournie par le dispatcher Sites.

- Dépôt propre au début ; documentation AGENTS/PRODUCT_SPEC/ARCHITECTURE/ROADMAP/STATUS/DECISIONS/TEST_PLAN lue.
- 31 tests Node relancés et réussis : modèle, services, stockage local réel D1/R2, collaboration, documents et signatures.
- TypeScript `pnpm exec tsc --noEmit` : réussi.
- Build Sites : réussi.
- 18 contrôles d’accès anonyme et non-cache du Worker compilé : réussis.
- Recherche de motifs de clés OpenAI/AWS/GitHub et clés privées dans les fichiers suivis : aucun résultat. Ce contrôle ne prouve pas l’absence universelle de secrets et ne couvre pas tout l’historique Git.
- Sondes nouvelles : image invalide admise par le schéma puis erreur de rendu ; doublons de circonstances admis ; divergence complétude/diagnostic ; différence de date selon fuseau ; calcul du dépassement de taille pour six photos de 1 Mio.
- Tentative de reproduction d’une suspension concurrente via une sonde Miniflare supplémentaire : blocage de l’environnement, processus arrêté ; ce point reste un constat de code, pas une reproduction réussie.
- Pas de nouvelle recette visuelle navigateur dans cet audit. Les validations mobiles/PDF de la livraison précédente restent des preuves limitées à leurs scénarios, pas une validation des écrans partagés connectés.
- Pas d’audit CVE des dépendances, de charge, de sauvegarde/restauration distante, de parcours SIWC hébergé ou de téléphones réels. Aucun contournement d’authentification.

## Sécurité et robustesse serveur

P1 : à traiter avant une recette avec données réelles. P2 : correction importante de fiabilité ou d’expérience.

| ID / priorité | Constat et preuve | Où | Correction et acceptation |
| --- | --- | --- | --- |
| S1 — P1 | La suspension de B est vérifiée à l’entrée de la session, mais le commit des modifications contrôle seulement le propriétaire A. Une suspension survenant pendant l’écriture R2 peut donc ne pas bloquer le commit. Les commits de signatures ne revérifient pas non plus les deux statuts. Constat statique ; course non reproduite dans cet audit. | `server/session-service.ts:11,14`, `server/report-service.ts:34-37`, `server/final-service.ts:20-23` | Propager l’acteur et vérifier atomiquement acteur actif, propriétaire actif et appartenance à la session au commit. Test suspendant B entre réservation et commit : aucune modification/signature référencée. |
| S2 — P1 | Les photos ne sont validées côté serveur que comme chaînes data URL. `data:image/png;base64,AAAA` passe Zod et fait échouer le PDF. Une pièce reçue par API peut bloquer tout le dossier. Absence de limite de pixels avant décodage PDF. Reproduit pour l’image invalide ; impact mémoire maximal non mesuré. | `features/constat/model.ts:7`, `server/session-service.ts:11`, `server/pdf-renderer.ts:58` | Vérifier format réel, décodabilité, dimensions et budget de pixels avant conservation/rendu. Refuser clairement la pièce invalide sans bloquer les autres données. Les originaux valides restent conservés. |
| S3 — P2 | Le PDF est calculé avant la réservation de quota. Un rendu échoué ne consomme pas le quota d’écriture ; des répétitions peuvent donc engager du calcul sans cette limite. La finalisation peut aussi être calculée plusieurs fois simultanément avant CAS. Constat statique. | `server/final-service.ts:17,23` | Réserver un quota de calcul avant rendu, verrou temporaire/idempotence pour une génération donnée, libération définie en cas d’échec. Vérifier deux demandes simultanées. |

Points positifs : identité serveur ; filtres propriétaires/participants ; requêtes SQL préparées ; secret d’invitation haché, éphémère et à usage unique ; contrôle d’origine ; flux JSON borné ; R2 privé ; refus des révisions obsolètes ; signatures attachées au PDF relu ; absence d’HTML/SVG brut de l’IA. La confiance dans les en-têtes d’identité reste liée au dispatcher Sites : ne pas exposer le Worker directement sur un autre hébergeur sans authentification adaptée.

## Parcours métier et cohérence des données

| ID / priorité | Constat et preuve | Où | Correction et acceptation |
| --- | --- | --- | --- |
| F1 — P1 | La relecture HTML affiche seulement les anciennes circonstances et champs. Les 17 cases, rubriques complémentaires et dégâts aux tiers n’y figurent pas. Le PDF les contient, donc deux vues de relecture divergent. Confirmé par lecture. | `features/constat/review.tsx:2`, `features/constat/final-model.ts`, `server/pdf-renderer.ts:31-54` | Un récapitulatif exhaustif et commun à A/B, avec les 17 cases, données complémentaires et faits communs. Vérifier champ par champ la parité avec le PDF. |
| F2 — P1 | Après partage, A n’a pas de contrôle pour modifier le pays, les témoins ou le dessin manuel dans la page session. Le pays n’est même pas repris dans les champs communs du merge serveur. L’ancienne API globale refuse volontairement les dossiers partagés. Ces corrections deviennent donc impossibles par le parcours normal. | `features/constat/session-client.tsx:16`, `server/session-service.ts:13`, `server/report-service.ts:34-37` | Ajouter ces contrôles autorisés pour A et le pays au merge, avec relecture B et nouvelle révision. Ne pas rouvrir l’édition globale de B. |
| F3 — P1 | Le payload de croquis IA utilise uniquement les huit anciennes circonstances ; il ignore les 17 nouvelles et le point de choc `extra.impact`. L’IA peut donc recevoir des indications absentes ou contradictoires avec celles du PDF. Confirmé par lecture ; fournisseur non appelé. | `server/sketch-service.ts:9`, `features/constat/form-details.tsx:4` | Utiliser les 17 circonstances validées et les points de choc, garder l’origine des anciennes données ; signaler les contradictions sans inventer. Test du payload, puis recette réelle autorisée. |
| F4 — P1 | La date locale est interprétée dans le fuseau de l’environnement, absent du modèle. Exemple : accident à Bruxelles le 20/09 à 12:30, contrôle à 11:00 UTC ; accepté en Europe/Berlin, refusé en UTC comme futur. Différence reproduite ; comportement du déploiement réel non testé. | `features/constat/completeness.ts:4-7`, `features/constat/model.ts:7` | Enregistrer le fuseau/offset de l’événement, convertir de façon explicite et garder l’heure locale déclarée. Tests front/serveur UTC et changements d’heure. |
| F5 — P2 | Un dossier avec les 17 cases confirmées et sans anciennes cases peut être complet alors que `missingFields` exige encore une explication. Reproduit : `complete=true`, deux erreurs `explain`. | `features/constat/model.ts:13`, `features/constat/completeness.ts:19` | Partager une seule règle de validation entre progression, diagnostics et PDF ; étendre le test de parité au nouveau schéma. |
| F6 — P2 | L’API accepte `[0,0]` pour les circonstances normalisées. Le PDF coche une case mais indique deux cases, car il utilise la longueur du tableau. Reproduit pour l’acceptation du schéma ; décompte confirmé dans le code. | `features/constat/model.ts:5`, `server/pdf-renderer.ts:40-41` | Refuser les doublons ou normaliser explicitement côté serveur ; calculer le nombre de cases uniques. |
| F7 — P2 | Six photos de 1 Mio représentent déjà 8 388 624 octets de base64, soit plus que la limite totale de 8 388 608, avant le JSON. L’écran local accepte aussi six photos de 4 Mio. Des photos anciennes non attribuées occupent les six places et ne peuvent être retirées/attribuées dans la session. | `features/constat/evidence.tsx:5-6`, `features/constat/session-client.tsx:15-16`, `server/report-service.ts:3`, `server/session-service.ts:11` | Harmoniser limites locales/distantes, indicateur de taille totale avant envoi ; stocker les pièces séparément si retenu. Prévoir remplacement/attribution explicites avec conservation de l’historique, sans suppression automatique. |
| F8 — P2 | L’import local des photos conserve l’ancien objet `r` pendant les lectures asynchrones, puis `change({...r,photos})`. Des traits ou modifications effectués entre-temps peuvent être écrasés. Risque confirmé dans le flux de code, non reproduit en navigateur ici. | `features/constat/evidence.tsx:5`, `features/constat/workspace.tsx` | Fusionner uniquement les photos dans la dernière version courante ; protéger le changement de dossier pendant l’import. Test import retardé + dessin/saisie concurrente. |
| F9 — P2 | Après sélection d’un ancien document, la liste contient seulement `docs.slice(1)`. Le plus récent n’est plus sélectionnable par B dans le panneau sans rechargement. | `features/constat/final-panel.tsx:4,8` | Liste de toutes les versions, document actif clair et bouton de retour au plus récent. Test B choisissant ancien puis dernier PDF. |

## PDF, signatures et langues

| ID / priorité | Constat et preuve | Où | Correction et acceptation |
| --- | --- | --- | --- |
| P1 — P2 | Le lieu long est tronqué sur la première page et n’est pas repris dans les annexes lisibles, seulement dans le JSON joint. La ligne code postal/pays/téléphone de l’assuré est dessinée sans limite de largeur. Le cas des longs contenus n’est donc pas entièrement couvert par la promesse d’annexes intégrales. | `server/pdf-renderer.ts:29,34,53-60` | Ajouter tous les faits communs complets aux annexes ; borner chaque champ du formulaire. Tests avec adresse et téléphone longs, sauts de ligne et caractères variés ; inspection visuelle des quatre langues. |
| P2 — P2 | Les photos WebP sont acceptées mais, sans `preview`, elles ne sont pas visibles dans la page PDF ; seul l’original est joint. Les importeurs ne génèrent pas cet aperçu. | `server/pdf-renderer.ts:58`, `features/constat/evidence.tsx:5`, `features/constat/session-client.tsx:15` | Créer un aperçu validé PNG/JPEG sans perdre l’original et vérifier la correspondance avec celui-ci. Test de tous les formats acceptés. |

Les signatures sont des images et ce fait est annoncé. Le consentement est associé à une empreinte de données ; le clic d’ouverture autorise la case de relecture, mais ne prouve pas que le fichier a effectivement été chargé ou lu. Ne pas présenter cela comme une preuve forte de lecture. La certification électronique via prestataire constitue un lot distinct.

Les libellés existent en FR/EN/DE/NL ; les récits restent dans leur langue originale. La traduction assistée et approuvée des déclarations n’est pas implémentée. C’est une limite importante pour deux conducteurs ne partageant aucune langue. Prévoir original + traduction séparée, validation humaine et gel des deux textes avant signature. Aucune traduction silencieuse d’un document déjà signé.

## Utilisabilité, accessibilité et exploitation

| ID / priorité | Constat et preuve | Où | Amélioration et acceptation |
| --- | --- | --- | --- |
| U1 — P2 | La page partagée juxtapose ancien et nouveau formulaire et affiche les erreurs en bas. Les actions de sauvegarde ne restent pas fixes sur petit écran. Un échec de préparation affiche surtout un message général sans liens vers les champs. | `features/constat/session-client.tsx:16`, `features/constat/final-panel.tsx:7-8`, `app/globals.css` règles session | Parcours en sections, progression A/B, résumé des manques et liens de correction, actions mobiles accessibles, notifications proches de l’action. Conserver toutes les anciennes données. Recette visuelle 360/390/768 px et navigation clavier à faire. |
| U2 — P2 | Le compte liste les dossiers dont l’utilisateur est propriétaire ; aucun inventaire des sessions où il est B. B doit conserver son URL pour retrouver le constat. | `server/report-service.ts:13`, `features/constat/cloud-panel.tsx` | Section « Dossiers partagés avec moi » filtrée côté serveur, avec rôle et statut ; test refus d’un tiers. |
| U3 — P2 | Le GPS enregistre la position actuelle et sa précision, sans carte, déplacement du repère ou confirmation explicite du lieu de l’accident. L’adresse reste saisie séparément. | `features/constat/location.tsx:5`, `server/pdf-renderer.ts:53` | Afficher le point sur carte, distinguer position relevée/lieu confirmé, proposer une correction et conserver l’origine. Ne pas promettre une position exacte au-delà de la précision mesurée. |
| O1 — P1 avant usage réel | L’accès Sites documenté reste privé propriétaire : le parcours réel A/B n’est pas utilisable/validé dans cette configuration. Le croquis IA est non configuré. | `STATUS.md`, `ARCHITECTURE.md`, `server/sketch-service.ts:7` | Preview avec deux identités explicitement autorisées, test invitation/connexion/reprise ; configuration sûre du fournisseur puis contrôle des croquis. Aucun élargissement d’accès ou déploiement effectué par l’audit. |
| O2 — P2 avant lancement | Pas de politique effective de rétention/purge, restauration opérationnelle prouvée ou supervision exploitable. Les réservations/versions consomment le budget cumulatif même après certains échecs. La documentation initiale présente encore comme « à faire » des éléments déjà implémentés plus bas. | `STATUS.md`, `ROADMAP.md`, `server/report-service.ts:25-31`, `server/http.ts:17` | Sauvegarde/restauration testée, métriques et identifiants de requête sans contenu sensible, politique de conservation validée, récupération contrôlée des objets orphelins, roadmap consolidée. Aucune suppression sans autorisation. |

Accessibilité : dessin seul non utilisable au clavier, mais import de signature disponible ; croquis manuel sans alternative textuelle dédiée ; rendu et contraste en thème système sombre à vérifier, car les variables sombres coexistent avec des fonds clairs forcés. Ces points nécessitent une recette visuelle/clavier et ne sont pas déclarés conformes.

## Plan de correction proposé

1. **Cohérence et intégrité** : S1, S2, F1 à F6. Acceptation : chaque information saisie se retrouve en relecture/PDF/payload IA approprié ; corrections des champs communs possibles ; suspension concurrente bloque le commit ; dates indépendantes du serveur.
2. **Pièces et stabilité** : S3, F7 à F9, P1/P2. Acceptation : limites annoncées réellement utilisables, import sans perte de saisie, PDF sans débordement ni pièces invisibles, retour à toute version.
3. **Parcours mobile et compréhension** : U1 à U3, traduction assistée séparée. Acceptation : un conducteur identifie ce qu’il reste à faire et retrouve son dossier ; tests clavier et affichage multilingue ; originaux préservés.
4. **Recette et exploitation** : O1/O2. Acceptation : deux appareils/comptes autorisés, GPS réel, croquis IA réellement évalué, sauvegarde restaurée, publication uniquement après autorisation.

Aucun pourcentage global de « prêt pour production » n’est attribué : les parcours hébergés et les garanties opérationnelles non testés empêchent un chiffre fiable. Prochaine action recommandée : corriger le premier lot, puis refaire les tests ciblés et la Preview.

## Suivi des corrections — 0.6, 21 septembre 2026
Le rapport ci-dessus décrit la version 0.5 et reste conservé comme état initial.
- Corrigés : S1, S3, F1–F9, P1, U2 (tests/limites dans STATUS.md).
- S2/P2 : PNG/JPEG et limites serveur corrigés ; aperçus WebP issus du navigateur ajoutés, originaux préservés. Décodage WebP complet serveur et correspondance aperçu/original restent ouverts.
- U1 : amélioration des erreurs, résumé des manques, actions mobiles et anciennes circonstances repliées ; recette connectée/accessibilité exhaustive encore ouverte.
- U3 : coordonnées confirmées séparées, édition manuelle et lien carte ; carte intégrée interactive non implémentée.
- O1/O2 : documentation consolidée ; fournisseur IA, recette hébergée, politique de conservation/sauvegarde et supervision restent ouverts. Aucun déploiement ni élargissement d’accès.
