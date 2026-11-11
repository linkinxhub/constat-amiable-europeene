# Échange de session mobile Accordia

## 2026-11-11 — Confirmation web et retour Flutter

Écran de confirmation web FR/EN/DE/NL et retour manuel dans Flutter par code copié. Le vérificateur et le jeton restent en mémoire dans l’application. La passerelle HTTPS se configure via ACCORDIA_MOBILE_GATEWAY_ORIGIN. Le périmètre mobile connecté couvre la liste et la lecture des dossiers ainsi que la révocation. Analyse Flutter sans diagnostic, 65 tests Flutter et six tests serveur/relais réussis. La migration et l’isolation de deux identités fictives ont été vérifiées sur D1 local avec Miniflare. La compilation web complète, le déploiement Preview hébergé, les deux connexions réelles et l’APK de cette révision restent à vérifier.


Le relais Node nécessite les secrets serveur `ACCORDIA_SITE_SERVICE_TOKEN` et `ACCORDIA_MOBILE_GATEWAY_SECRET`. Le deuxième secret, 32 octets aléatoires encodés en base64url, doit aussi être configuré sur Accordia. Le relais expose `POST /v1/session`, `DELETE /v1/session`, `GET /v1/reports` et `GET /v1/reports/:id`. Les lectures et la révocation exigent le jeton mobile.

Côté Accordia, `POST /api/mobile-pairing` exige une session web, les protections d’origine habituelles et le corps `{confirm:true, challenge}`. Le challenge est le condensat SHA-256 encodé en base64url du vérificateur mobile. Le code expire après 5 minutes, le jeton après 30 minutes. Le stockage ne conserve que leurs condensats. Le même UPDATE vérifie et consomme le code. Le relais appelle les routes dédiées `/api/mobile-gateway` avec une clé d’application distincte. Le compte est vérifié à chaque lecture.

Le SQL additif `server/mobile-pairing.sql` a été testé localement avec SQLite. Il est conservé hors de la séquence Drizzle pour éviter une collision avec les migrations des autres branches. Intégrer cette table à la chaîne canonique avant une activation. Les routes n’ont pas été construites ni testées sur Sites. Avant activation : ajouter le parcours de confirmation et le retour Flutter, borner les créations et tentatives, préparer l’environnement Preview et qualifier accès croisé, révocation et expiration sur appareils réels.

