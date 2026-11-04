# ARCHITECTURE

Flutter 3.47.9/Dart 3.13.7. Démarrage main.dart, navigation native/app.dart, widgets natifs par page, ApiTransport HTTPS réel et injectable, JSON borné et origine fixe. Pas de moteur web, d’évaluation JavaScript ou de navigateur. Stockage AES-GCM via Keystore/Keychain, écritures atomiques/CAS du module existant. Corps et données API conservés dans leurs structures JSON sans inventer de contrat d’authentification. Sources Android/iOS incluses. Les pièces, signatures et IA restent serveur et nécessitent un portage dédié.

Fiches : reports/vehicle_fields.dart est commun au local et au participant. assets/copy/constat.json est exporté des schémas/listes web via scripts/export-native-form.mjs ; les contrats sont comparés côté Node. Aucun changement serveur/API/migration.
