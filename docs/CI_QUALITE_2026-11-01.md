# Validation GitHub — qualité et sécurité

## Périmètre
Workflow .github/workflows/quality.yml sur pull_request (opened, synchronize, reopened, ready_for_review) et lancement manuel. Aucun déploiement, secret fournisseur, droit d’administration ou paiement. Permission GitHub contents:read uniquement ; identifiants de checkout non conservés. Pas de pull_request_target exécutant du code de PR avec des privilèges du dépôt.

Node 24.22.1 et pnpm 11.25.0 correspondent au runtime validé du projet. Actions officielles épinglées aux commits vérifiés par l’API GitHub : actions/checkout v6 d23441a48e516b6c34aea4fa41551a30e30af803 (16/07/2026) ; actions/setup-node v6 249970729cb0ef3589644e2896645e5dc5ba9c38 (14/07/2026). Références : https://github.com/actions/checkout et https://github.com/actions/setup-node .

Ordre : dépendances figées avec la politique du projet → pnpm verify (TypeScript/lint/build/tests) → audit production → audit complet. Délai maximal 20 minutes, anciennes exécutions du même contexte annulées. Pas de cache partagé de données métier ni de secrets d’exploitation dans la recette.

## Alerte connue et résultat attendu
L’audit complet est bloquant et aucune alerte n’est ignorée. La vulnérabilité Minimatch de développement déjà documentée fera échouer cette dernière étape tant qu’un correctif compatible et éligible à la politique de sept jours n’est pas appliqué. Ne pas annoncer une CI verte malgré cette alerte. Le scan de production et les étapes de qualité peuvent réussir indépendamment, mais le job global reste en échec si l’audit complet échoue.

Les 54 avertissements ESLint demeurent affichés ; ESLint échoue sur les erreurs. Une règle de protection de branche n’est pas créée par ce workflow : tant qu’elle n’est pas configurée dans GitHub, un statut rouge ne garantit pas techniquement l’interdiction de fusion. La PR reste en brouillon et n’est pas fusionnée par l’agent.

## Vérification et limites
Valider localement le YAML et pnpm verify, puis pousser avec contrôle de la tête distante. Examiner l’exécution GitHub, ses étapes et son résultat réel. Si GitHub exige une approbation ou refuse l’écriture de fichiers de workflow, le signaler ; ne pas contourner ses permissions. Une exécution absente ne vaut pas réussite. Le premier environnement GitHub propre n’est pas assimilé aux dépendances déjà installées localement.

Documentation GitHub : https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows et https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow . Certaines exécutions déclenchées par automatisation peuvent demander une approbation du propriétaire. Aucun changement d’accès au site, de comptes ChatGPT ou de protection de branche n’est réalisé implicitement.

## Première exécution distante constatée
Exécution GitHub nº 1, id 41321009732, commit b97d5fefd50208dd908be27cf38e564b2cc450de, job 124891026856 : installation propre figée réussie ; TypeScript/lint/build et 223 tests réussis (zéro échec) ; audit production réussi (« No known vulnerabilities found »). L’étape audit complet échoue avec exactement une alerte modérée GHSA-g3hv-75wg-m249 / Minimatch. Le job global est donc failure, sans exception ni continue-on-error. Journaux du job consultés et résultat des étapes vérifié par le connecteur GitHub. Ce n’est pas une erreur de compilation ou d’installation. Une nouvelle modification documentaire déclenche normalement une nouvelle exécution ; ne pas attribuer d’avance au nouveau commit le résultat d’un run précédent.
