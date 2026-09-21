# Accordia — Résolution de l’audit du 21 septembre 2026

Lot 0.11, demandé par « Corriger ». Aucun dossier réel modifié, aucune invitation ou déclaration envoyée.

| Référence | Résultat | Vérification / limite |
|---|---|---|
| A01 | React/RSC et dépendances compatibles mis à jour ; 36 → 2 alertes | TypeScript, build, routes Worker. Deux alertes image-size restent bloquées par l’âge minimal de sept jours. |
| A02 | Rejet des réponses obsolètes, epochs de sauvegarde et révisions monotones | Régression des réponses livrées dans le désordre et du changement de session. |
| A03 | Identité stable du constat ; historique courant séparé des autres documents ouverts | Recette locale avec deux constats fictifs ; aucune suppression implicite. |
| A04 | Une seule sauvegarde de brouillon pilotée par le Workspace ; état enregistré invalidé après saisie | Reproduction navigateur réussie : modification → « Modifications à enregistrer ». |
| A05 | Conservation explicite des PDF, signés ou non, dans le navigateur et reprise depuis Mes brouillons | Deux tracés géométriques fictifs, conservation, rechargement, réouverture. Effacement des données navigateur supprime ces copies ; téléchargement recommandé. |
| A06 | Validation PNG bornée commune aux signatures et photos ; APNG refusé | PNG réel accepté, conteneurs animés/invalides rejetés ; signature D1/R2 nominale réussie. |
| A07 | Aperçu WebP client non utilisé dans le PDF ; original toujours joint | PDF de test avec aperçu volontairement différent : aucun aperçu affiché sur la page photo. |
| A08 | Registre des octets, états pending/committed/cleanup, remboursement et récupération propriétaire | Échecs et upload tardif testés ; récupération conserve rapports historiques et PDF signés. Les orphelins anciens non attribuables ne sont pas purgés automatiquement. |
| A09 | Verrou IA par session et gardes SQL de révision, appartenance, statut et consentements | Tests avec fournisseur factice strictement local : concurrence, révision changée, suspension pendant upload, approbation/consentement au commit. |
| A10 | Choix manuel/IA explicite ; véhicules et angles représentés ; manuel en annexe si IA | PDF bleu inspecté. Le fournisseur reste non configuré : aucune génération IA réelle promise. |
| A11 | Montage local différé, empreintes photos mémorisées, calculs liés aux changements, copies bornées | 20 copies / 64 Mio en mémoire au maximum ; fermeture volontaire des copies conservées. Pas de mesure sur téléphone physique. |
| A12 | Diagnostic de finalisation commun au serveur et aux interfaces ; tiers, 17 cases et conducteur ciblé | Tests et clic réel « Compléter Circonstances B » ouvrant B. |
| A13 | Tutoriel adapté au parcours, libellés des commandes, durée selon la longueur du texte et guides actualisés | Revue visuelle sur 390 px ; navigation manuelle/pause existantes conservées. Pas de validation lecteur d’écran ou téléphone physique. |

## Sécurité des dépendances : reliquat explicite
`pnpm audit` : 2 alertes élevées, 0 modérée, 0 faible, 0 critique. Elles concernent `vinext > image-size@2.0.2` :
- https://github.com/advisories/GHSA-w3rx-r6r6-pgpr
- https://github.com/advisories/GHSA-5p2g-fcmc-qvqq

Le registre npm annonce une correction à partir de 2.0.3. Son horodatage de publication est le 14 septembre 2026 à 15:57:47 UTC ; l’installation du matin du 21 septembre est refusée par `minimumReleaseAge: 10080`. Cette règle n’a pas été modifiée. La 2.0.4 est également trop récente au moment de cette intervention.

Dans la version Vinext inspectée, image-size est utilisé par `metadata-route-build-data.js` pour lire des images statiques du dépôt pendant la construction. Aucun appel depuis les photos ou signatures utilisateur n’a été trouvé ; les marqueurs correspondants ne sont pas retrouvés dans le Worker construit. Ce constat limite le périmètre observé, sans annuler les alertes ni constituer un pentest. La mise à jour corrigée reste à appliquer une fois admissible par la politique du projet.

## Validation et publication
60 tests réussis, dont intégrations D1/R2 et 20 vérifications d’accès anonyme/no-store. TypeScript et construction Sites réussis. Migration additive 0006 générée et inspectée, sans suppression ni données de seed. Pages de recette retirées. Publication sur le site existant en conservant son audience ; aucune modification des accès.

Les identités de test et propositions IA simulées n’existent que dans les tests locaux. Aucun appel IA réel, connexion sous deux comptes, signature réelle, transmission assureur ou certification juridique n’est revendiqué.
