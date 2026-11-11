# Recette hébergée de la liaison mobile

Dans GitHub Actions, lancer manuellement **Accordia native project checks** sur la branche de recette, avec `pairing_site_origin` et `pairing_gateway_origin`. Le workflow refuse l’origine de production. Récupérer ensuite l’artefact APK du run. Les deux adresses doivent être en service avant le test sur téléphone.

La version Sites 94 est une version enregistrée. Son aperçu hébergé n'est pas disponible. Ne pas pointer le relais de test sur l'origine active de production.

1. Préparer une instance Accordia de recette HTTPS autorisant les deux comptes de recette, avec D1 et R2 isolés. Construire la source de la branche et appliquer les migrations jusqu'à 0023 sur cette instance. Configurer un nouveau secret ACCORDIA_MOBILE_GATEWAY_SECRET de 32 octets encodés en base64url.
2. Héberger le relais Node avec les variables ACCORDIA_SITE_ORIGIN (origine HTTPS de recette), ACCORDIA_SITE_SERVICE_TOKEN (jeton de service de l'instance de recette) et ACCORDIA_MOBILE_GATEWAY_SECRET (même secret d'application). Les valeurs restent côté serveur. GET /health indique seulement que le processus répond.
3. Compiler l'APK avec les deux adresses publiques, sans secret. Le navigateur doit ouvrir l'instance utilisée par le relais.

```sh
flutter build apk --debug --target-platform android-arm64 \
  --dart-define=ACCORDIA_MOBILE_GATEWAY_ORIGIN=https://relai-recette.example \
  --dart-define=ACCORDIA_MOBILE_PAIRING_SITE_ORIGIN=https://accordia-recette.example
```

4. Avec deux comptes Accordia réels autorisés sur l'instance de recette, créer un dossier de test distinct par compte. Dans l'APK, ouvrir Dossiers sur mon compte, copier le lien, confirmer dans le navigateur, puis coller le code dans Flutter. Vérifier la liste, un détail propre, le refus d'un identifiant appartenant à l'autre compte et la déconnexion. Répéter avec le second compte. Vérifier également un code expiré, une tentative de réutilisation et un compte suspendu. Consigner les résultats sans joindre de code, de jeton ou de données personnelles.

Le test compilé local exécute les migrations sur D1 isolé et fait traverser le relais HTTP réel aux requêtes d'échange, liste, détail étranger et révocation. Le transport entre le relais et le Worker est adapté au processus Miniflare pour le test. Il ne valide pas l'authentification ChatGPT hébergée. Sans les deux origines configurées, le build Flutter ne lance aucun parcours de liaison.

## Instance de recette disponible

Accordia Recette est en ligne en privé à https://accordia-recette.adil-btp.chatgpt.site. La version 1 utilise une base D1 distincte avec la table mobile_pairings. La passerelle et le second compte restent à configurer. Cette branche contient les réglages d’hébergement propres à la recette.
