# Passerelle mobile Accordia — dossier de préparation

Le service Node écoute via start.mjs et relaie trois opérations vers l’origine Accordia fixée dans le code. Le secret de service est fourni uniquement par l’hébergeur de la passerelle. Ne placer aucune valeur dans Git ou dans l’APK.

| Route mobile | Route Accordia à réaliser |
| --- | --- |
| POST /v1/session | POST /api/mobile-gateway/session |
| GET /v1/reports | GET /api/mobile-gateway/reports |
| GET /v1/reports/:id | GET /api/mobile-gateway/reports/:id |

Le compte reste celui reconnu par Sites. Dans le navigateur système, le site authentifie le conducteur puis crée un code aléatoire de 32 octets (base64url), de courte durée, associé à son identifiant vérifié et au condensat SHA-256 du vérificateur généré dans Flutter. L’écran de liaison demande une confirmation. Le retour doit utiliser un lien d’application vérifié sur un domaine contrôlé avec corrélation locale du flux. Le mobile échange code et vérificateur par HTTPS. Accordia valide et consomme le code atomiquement, puis délivre un jeton opaque à durée bornée (32 octets base64url), dont seul le condensat est stocké. Le propriétaire est dérivé exclusivement de cette session. Aucun identifiant de compte fourni par le client n’est accepté. Vérifier compte actif et propriété à chaque accès. Prévoir limitation de débit, révocation et purge des codes/sessions. L’API de lecture et l’échange doivent authentifier aussi la passerelle via un secret serveur distinct, à ajouter au relais et au serveur avant l’activation.

Vérification du 11 novembre 2026 : appel anonyme de /api/reports → 401 HTML ; appel serveur autorisé via la clé de service Sites → 401 JSON. La passerelle peut atteindre le routeur privé, et le jeton de service ne fournit pas l’identité d’un conducteur. Trois tests locaux réussis pour refus anonyme, routes autorisées et traitement des réponses non JSON. Les routes Accordia, le stockage/révocation des sessions, le lien vérifié et Flutter restent à raccorder. /health indique uniquement que le processus du relais répond.

Avant toute mise en service, éprouver le flux en Preview avec deux identités, y compris refus d’un dossier appartenant à l’autre compte, code expiré/réutilisé, mauvais vérificateur, compte suspendu, révocation et refus sans clé de passerelle. Tester sur un téléphone réel et confirmer que le site conserve son audience actuelle. Aucun écran ou guide conducteur ne présente ce lot préparatoire comme disponible.
