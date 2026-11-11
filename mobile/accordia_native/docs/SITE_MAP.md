# Site map Accordia et équivalents Flutter

Inventaire extrait des sources : 9 pages, 25 routes API. Source de référence 6235113,
conservant les changements Azur 0.4.0 et Splash Sérénité 0.4.1. L’API n’est pas une page.

| Route web | Page native | Fichier |
|---|---|---|
| / | Accueil vitrine et présentation | lib/native/pages/landing_page.dart |
| /constat | Situation, fiches A/B, véhicules/attelage, circonstances, relecture locale et PDF | lib/reports/editor.dart |
| /join | QR caméra, collage, validation d’origine et invitation | lib/native/pages/join_page.dart |
| /session/[id] | Dossier partagé, rôle issu du serveur, édition de sa fiche, invitations, documents | lib/native/pages/session_page.dart ; participant_editor_page.dart |
| /account | Compte, dossiers, sessions et brouillons | lib/native/pages/account_page.dart ; reports_page.dart ; report_detail_page.dart ; lib/reports/list.dart |
| /guide | Guide natif et limites de la version | lib/native/pages/guide_page.dart |
| /pricing | Offres et achats fermés | lib/native/pages/pricing_page.dart |
| /feedback | Catégorie, texte et envoi réel | lib/native/pages/feedback_page.dart |
| /admin | Configuration mobile, informations IA/rétention/feedback | lib/native/pages/admin_page.dart ; mobile_settings_page.dart |

Sous-écrans supplémentaires natifs : splash, accueil Azur, réglages son/langue,
création A/B/A+B, liste et suppression des brouillons, aperçu PDF, erreur/accès refusé,
historique serveur, saisie participant et listes de documents.
Les fichiers pages/*.dart sont des parties de la bibliothèque pages.dart pour partager
les contrôles d’erreur et les widgets sans recopier les dépendances.

## API réelle par groupe

- Compte : GET/POST /api/account ; GET/PUT /api/account/offer.
- Dossiers : GET /api/reports ; GET/PUT /api/reports/[id] ; GET/POST /history.
- Sessions : GET/POST /api/sessions ; GET/PUT /api/sessions/[id] ; POST/PUT /invite.
- Documents : GET/POST /final ; POST/PUT /final/[document] ; GET /final/[document]/pdf.
- IA : GET/POST document-extraction ; sketch et translation de session.
- Présentation : GET /api/mobile/config.
- Administration : mobile-settings, ai-settings, retention, feedback et activate.
- Feedback : POST /api/feedback.
- Facturation : routes /api/billing/test/* conservées dans l’inventaire serveur,
  volontairement absentes des commandes de paiement du client natif.

Méthodes exactes et chemins complets : SITE_MAP.json, produit depuis app/api/**/route.ts.
/signin-with-chatgpt, /callback et /signout-with-chatgpt relèvent de l’infrastructure
SIWC ; ils ne constituent pas des pages Flutter de connexion déjà implémentées.
