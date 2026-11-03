# Matrice de migration — état réel de cette première livraison

« Page codée » ne signifie pas « parité de chaque fonction validée ».

| Fonction | État dans ce projet |
|---|---|
| UI native, neuf pages, navigation et erreurs | Codées, sans WebView, sans ouverture navigateur |
| Azur, logo et splash n° 2, audio optionnel et mouvement réduit | Repris depuis 0.4.1, tests de rendu et cycle de vie conservés |
| Langues FR/EN/DE/NL | Préférences, accueil, formulaire local, menus et libellés principaux repris ; validation linguistique terrain restante |
| Formulaire local, véhicule/attelage, circonstances, relecture | Fonctionnel depuis le module natif existant, champs avancés web à compléter |
| A+B même téléphone | Préparation native avec deux fiches ; ne remplace pas encore les confirmations/signatures du parcours web partagé |
| Brouillons chiffrés et suppression | Fonctionnels, CAS local, corruption conservée, jamais repli en clair |
| PDF natif | Préparation non signée existante ; pas encore le PDF final serveur ou une reproduction complète du modèle web |
| QR/collage | Scanner natif et validation réelle de l’invitation ; entrée de session bloquée sans identité mobile supportée |
| Client API | Requêtes HTTPS réelles, origine fixe, garde JSON/CSRF serveur, refus 401/403, conflits 409 et conservation de saisie ; pas de session inventée |
| Authentification ChatGPT native | Non implémentée : nécessite un contrat serveur/hébergeur supporté ; aucun bearer générique accepté par hypothèse |
| Compte/dossiers/historique | Pages de lecture API codées ; nécessitent authentification native et recette réelle |
| Session A/B | Lecture et édition native des champs principaux de son participant ; serveur autoritaire, CAS ; fiche avancée/commun/circonstances/photos/consentements à compléter |
| Invitations | POST de join et renouvellement réels ; QR d’affichage/partage système et liens OS vérifiés à compléter |
| Photos, GPS, croquis | À porter ; aucune permission ou acquisition fictive ; données originales inconnues conservées dans les Maps |
| OCR/Express, traduction, croquis IA | Inventoriés côté API, pas encore portés dans l’interface ; droits/quota/fournisseur restent serveur |
| Préparation finale, signatures et PDF final | Contrats serveur inventoriés ; écran natif de liste initial, workflow complet et lecteur binaire serveur à porter |
| Feedback | Texte/catégorie/envoi réel codés, idempotence conservée ; pièces images à porter |
| Administration mobile | Lecture, brouillon et publication réelle avec CAS et confirmation codés ; pas de rôle local ; rollback et ergonomie complète à porter |
| Administration IA/rétention/feedback | Lecture API initiale, données avancées dans vue de détail ; formulaires de gestion complets à porter |
| Abonnements/paiement | Offres prévues affichées ; achats fermés. Aucun droit accordé par le client |
| Synchronisation/réseau | Pas de migration automatique des anciens stockages, pas de fusion silencieuse. Autosync et reprise physique à qualifier |
| Android/iOS | Sources incluses ; tests Dart et contrôles consignés dans STATUS.md. Build iOS non réalisé |

La version WebView actuelle demeure dans mobile/accordia et conserve ses fonctionnalités.
Elle n’est pas écrasée ou remplacée par cette première variante native.
