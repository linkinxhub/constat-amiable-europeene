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
| PDF natif | Première page sur le modèle original du site, clavier/bleu/noir, croquis et annexes intégrales ; PDF final serveur signé et pagination exacte des annexes web à qualifier |
| QR/collage | Scanner natif et validation réelle de l’invitation ; entrée de session bloquée sans identité mobile supportée |
| Client API | Requêtes HTTPS réelles, origine fixe, garde JSON/CSRF serveur, refus 401/403, conflits 409 et conservation de saisie ; pas de session inventée |
| Authentification ChatGPT native | Non implémentée : nécessite un contrat serveur/hébergeur supporté ; aucun bearer générique accepté par hypothèse |
| Compte/dossiers/historique | Pages de lecture API codées ; nécessitent authentification native et recette réelle |
| Session A/B | Lecture et édition native des champs principaux de son participant ; serveur autoritaire, CAS ; fiche avancée/commun/circonstances/photos/consentements à compléter |
| Invitations | POST de join et renouvellement réels ; QR d’affichage/partage système et liens OS vérifiés à compléter |
| Photos, GPS, croquis | Croquis manuel local/PDF disponible en 0.6 ; photos/GPS à porter ; aucune permission ou acquisition fictive ; données originales inconnues conservées dans les Maps |
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

## Mise à jour 4 novembre 2026
Fiches A/B : les 34 champs texte du schéma véhicule et leurs listes sont maintenant partagés entre formulaire local et édition du participant, avec quatre sélecteurs de date et la ville locale. Voir FORM_PARITY_2026-11-04.md. La parité des validations, médias, langues personnelles, parcours et fonctions connectées reste ouverte.

## Mise à jour design et croquis — 4 novembre
Cinq étapes natives, cartes relief et rubriques A/B ; croquis manuel au format 800×320, 500 traits/5000 points par trait, annulation et effacement confirmé, sauvegarde chiffrée et export vectoriel en annexe du PDF préparatoire. Photos et croquis IA non portés. Authentification traitée en dernier à la demande du propriétaire ; accès privés et recette connectée toujours nécessaires.

PDF 0.6 : modèle original fourni identique au site sur la première page, styles clavier/bleu/noir et langue des annexes repris ; ressources et placements comparés au web. Le PDF final authentifié/signatures, les photos et la pagination exacte des annexes web restent distincts/non qualifiés. Voir INPUT_DESIGN_2026-11-04.md.


## Mise à jour du 9 novembre 2026

Dans les sessions auxquelles l’identité a accès, Documents présente la liste serveur et ouvre le PDF de relecture ou signé via le lecteur Flutter. Le fichier provient de l’API existante, sans génération côté client. Création, signatures et recette réelle restent ouvertes. Le site hébergé refuse actuellement les appels natifs sans session, y compris à la configuration. La connexion mobile et la reprise du même dossier entre le web et Android/iOS restent à qualifier.
