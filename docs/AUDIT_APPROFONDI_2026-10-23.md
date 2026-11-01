# Audit approfondi — version 45 et correctifs

Référence : version Sites 45, commit 9149e471632a9bb6d363f7daebeb34930545494a. Point de restauration before-audit-questionnaire-20261023. Audit de code, dépendances de production et tests locaux ; aucune certification exhaustive ni recette réelle hébergée.

## Défauts confirmés et réparations

| Priorité | Constat | Réparation |
|---|---|---|
| Haute | Le questionnaire avance avec sécurité/nombre de véhicules non renseignés, date future, lieu vide ou identité/assurance manquante | Contrôles ciblés par rubrique, réutilisation des règles de date et courriel ; message explicite. Compléments facultatifs conservés comme facultatifs |
| Moyenne | Revenir du formulaire complet au questionnaire réinitialise la rubrique | Curseur mémorisé dans sessionStorage par dossier, conducteur et périmètre ; seuls les identifiants de rubrique sont mémorisés, pas de nouvelle copie des données |
| Moyenne | Ancienne instruction du tutoriel contredit l’autosauvegarde | Correction FR/EN/DE/NL, distinction sauvegarde locale et enregistrement réseau explicite conservée |
| Haute | Scanner des dépendances de production : 14 alertes, dont trois critiques, principalement Next.js 16.3.4 | Mise à jour ciblée vers Next.js 16.4.1, compatible avec les versions React/Node du projet ; pas d'exception au délai minimum de publication des paquets |

Les validations n’inventent aucune réponse. Les anciennes réponses B restent conservées lorsque le nombre de véhicules passe à un. La fin du questionnaire ne signe ni ne finalise un constat. Les composants QuestionnaireInfo partagent les explications entre compte, tarifs, vitrine et guides.

## Contrôles de code et de régression

Revue du stockage local, du rapprochement des réponses de session, des appels fournisseur et de l’extraction documentaire : les documents restent soumis au consentement, à l’accès administratif Premium actuellement fermé, au rôle de session et aux quotas. Les appels fournisseur utilisent redirect:manual ; la suite existante couvre refus des redirections, limites de flux et permissions. Aucune autorisation serveur supprimée, aucune migration ni ouverture commerciale.

Les brouillons locaux restent liés au navigateur/appareil, pas à un coffre chiffré par compte. Un appareil partagé nécessite donc de conserver cette limite visible ; aucune suppression ou migration des anciens brouillons n'a été effectuée. La synchronisation GitHub est toujours à rétablir : authentification Git locale indisponible lors du précédent essai. La synchronisation du dépôt Sites ne signifie pas une synchronisation GitHub/Vercel.

## Vérifications restant nécessaires

- Recette navigateur/mobile, clavier et reprise réelle après rechargement ; précédent accès Preview bloqué par politique, aucun contournement.
- Parcours à deux comptes, invitation et GPS réels.
- Extraction de documents, traduction et croquis avec le fournisseur réel : aucun appel facturable ni donnée personnelle utilisé dans cet audit.
- Activation commerciale et recette Stripe en mode réel, non incluses ; achats fermés.
- Analyse indépendante de sécurité, des dépendances de développement et de l’exploitabilité des avis.

Les résultats du scanner sont une photographie du registre au moment de l’audit ; zéro alerte éventuelle ne signifie pas absence de vulnérabilité.

## Dépendances corrigées

Next.js 16.3.4 → 16.4.1. Versions indirectes fixées via les overrides pnpm : fast-uri@3 → 3.1.8, source-map-js → 1.2.2. Lockfile régénéré par pnpm, règles de provenance/ancienneté maintenues. Le scanner `pnpm audit --prod --json` final indique **0 alerte**, contre 14 avant correction (3 critiques, 4 élevées, 6 modérées, 1 faible). Il exclut les dépendances de développement ; ce résultat n'est pas une certification.

Validation finale après toutes les mises à jour : TypeScript, build Sites, git diff --check et 168 tests réussis, zéro échec. Audit pnpm de production : zéro alerte. Le premier contrôle de typage a détecté une erreur JSX pendant l’implémentation ; corrigée avant ces validations finales.
