# Audit Accordia — 1 novembre 2026

## Référence et portée

Source initiale Sites 54 / `1c6edf82e9b8d3b8ccd789db5017a9283f7f5565`, arbre `48697ea65d33615715e3ac2680f3ba742d6dad82`, identique à la branche GitHub `feat/safety-device-modes-20261101` / `cccca8e5b59a1192eee23bb7fe3a0bd0b748f3fb`. État initial propre ; point de restauration `before-complete-audit-20261101`. Revue du démarrage, des trois parcours, de la persistance, du modèle et des droits serveur, des documents/IA, signatures/PDF, traductions, dépendances et secrets détectables. Aucun accès aux sinistres de production, fournisseur réel, paiement ou envoi assureur.

## Défauts corrigés

| Repère | Constat vérifié | Correction et preuve |
|---|---|---|
| A01 — navigation | En mode solo, « Inviter l’autre conducteur » pointait vers un panneau qui ne proposait plus l’invitation. | Le lien rouvre le choix de participation ; le mode deux appareils rejoint le panneau réel avec connexion. Recette navigateur exécutée. |
| A02 — libellés | E-mail et adresse répétaient la mention facultatif dans le questionnaire, dans les quatre dictionnaires. | Réutilisation du libellé existant sans suffixe ajouté. Une seule entrée « E-mail (facultatif) » visible dans B. |
| A03 — dépendances | Scan initial production : 5 alertes (1 élevée, 2 modérées, 2 faibles) ; complet : 15 (5 élevées, 8 modérées, 2 faibles). | Zod 4.6.6, fast-uri 3.1.9, Undici 7.30.1, Satori 0.33.5 ; versions publiées depuis plus de sept jours, installation figée vérifiée. Scan final production : 0 ; complet : 1 modérée de développement. |
| A04 — validation bornée | Ancien Zod concerné par GHSA-mrhx-c7xc-m3w5 : accumulation de diagnostics sur des collections excessives. | Migration Zod et régression sur 20 000 photos ou tracés invalides : refus, un diagnostic `too_big`, sans parcourir la liste pour accumuler des erreurs. |
| A05 — analyse React | Deux diagnostics supplémentaires dans Workspace depuis le lot précédent : lecture de ref dans le callback transmis, fonction restore référencée avant sa déclaration. | Le callback utilise le Report contrôlé courant ; déclaration de restore avant l’effet consommateur. Aucun changement de droit ou stockage. |
| A06 — environnement | Profil local absent : le serveur de Preview utilisait le mode portable et échouait au contrôle de disponibilité. | Configuration locale par le helper officiel : managed-linux. Preview opérationnelle ; aucun fichier de configuration locale ni identité de test envoyé dans les sources. |

## Contrôles et résultats

| Domaine | Résultat et limite |
|---|---|
| Sécurité initiale | Écran seul visible avant confirmation ; 112 présent sans appel lancé ; retour aux consignes puis confirmation conserve le lieu fictif. L’acquittement n’invente aucune réponse blessés. |
| Trois modes | Radios, bouton initial désactivé, solo, appareil commun et deux appareils testés dans la vraie interface. Le mode solo ne force pas un véhicule. |
| A/B et sauvegardes | Lieu fictif saisi dans le principal conservé ; saisie fictive B depuis appareil commun puis bascule solo : A vide, B conservé. Statut de sauvegarde locale affiché. La reprise du dossier reste raccordée à son mode. Pas d’effacement de données ou de signature distante. |
| Traductions | FR/EN/DE/NL affichées dans les parcours ; données originales conservées. Guide/tutoriel et surfaces partagées actualisés via onboarding-copy / QuestionnaireInfo. |
| Mobile/clavier | Formulaire réel dans une iframe de viewport 375 px, non une reproduction : largeur défilante 360 px, pas de débordement horizontal des consignes/cartes ; trois cartes verticales de 290 px. Espace puis flèche bas sélectionnent two-devices ; Continuer ouvre le parcours. Ce contrôle ne remplace pas un téléphone physique. |
| Bureau | Preview sur terminal.local, viewport 1363 px, largeur du corps 1348 px ; parcours et langues vérifiés. Aucun écran d’erreur de framework observé. Console inspectée : erreurs d’extension Chrome sur métadonnées, séparées du code applicatif ; aucune erreur applicative observée dans les scénarios. |
| Serveur / accès | Revue identité SIWC derrière dispatcher, filtres propriétaire/appartenance, côté A/B, CAS, suspension/expiration, origine et JSON, corps bornés. Suites D1/R2 et Worker : refus anonymes, interdiction d’éditer l’autre côté, invitations, courses et signatures. Pas de contournement par le choix de mode UI. |
| Documents / IA | Contrôles serveur Premium/admin et côté, consentement explicite, quotas, délais, redirections refusées et réponses bornées conservés. Pas d’appel fournisseur réel ; qualité OCR/croquis non certifiée. |
| PDF / signatures | Tests réels du moteur et des services dans les quatre langues : déclarations, mots, signatures, gel, invalidation et conservation des anciennes versions. PDF fictif FR/DE généré avec le moteur courant ; première page FR rendue et inspectée, A/B dans les cases, mention non signé. Cet exemple FR complet compte 5 pages, annexes comprises : l’export applicatif n’est pas garanti sur une seule page. |
| Secrets | Scan à motifs de forte confiance du contenu suivi : aucune clé reconnue. Seul `.env.example` est suivi. Ce contrôle n’est pas une attestation de l’absence de tout secret dans tout l’historique. Aucun secret runtime consulté ou modifié. |

## Vérification automatisée

TypeScript et build Sites réussis ; installation avec lockfile figé acceptée ; suite complète après build : **192 tests réussis, zéro échec**, dont six scénarios onboarding. Scan production zéro alerte. Revue du diff sans erreur d’espacement. Les résultats exacts du dernier passage après corrections et de la comparaison lint sont consignés dans STATUS.md / CHANGELOG.md.

## Réserves et suite

- **P2 — dette lint** : le lint global échoue ; ce lot ne prétend pas corriger toute la dette React/Next/TypeScript historique. Comparaison avec la référence exécutée, sans désactiver de règle ni cacher les diagnostics. Détail final dans STATUS.md.
- **P2 — dépendance de développement** : GHSA-g3hv-75wg-m249, Minimatch, diagnostic modéré. Version corrigée 11.0.1 publiée le 27/10/2026 à 22:26 UTC ; inéligible au délai de sept jours jusqu’au 03/11/2026 à 23:26 heure belge. Politique inchangée, aucune exception silencieuse. Un changement majeur forcé global des versions 3/9 n’est pas introduit dans cet audit.
- Deux comptes hébergés indépendants, QR scanné sur second téléphone, caméra/GPS réels, extraction/croquis fournisseur, accessibilité avec lecteur d’écran et paiements réels restent à recetter. Les achats clients restent fermés.
- L’export standard conserve les annexes ; une exportation compacte dédiée d’une seule page reste un lot séparé pour éviter la perte de textes.
- Aucun pentest externe, audit juridique ou garantie exhaustive de sécurité n’est revendiqué.

Livraison : pousser la source auditée sur la branche GitHub et mettre à jour la PR nº 1 ; sauvegarder une version Sites sans déploiement. La production et l’audience restent inchangées. Une fusion de PR ou une publication nécessite une instruction explicite distincte.
