# Accordia Azur sculpté — 0.4.0+6

## Lot et référence
Choix propriétaire : concept 1, bleu lumineux, relief 3D, accident léger et constat.
Branche `feat/azur-internal-20261103`, restauration `checkpoint/before-azur-internal-20261103`.
Administration canonique 7a6586a récupérée et préservée aux côtés des correctifs natifs.
Aucune migration, aucune audience/identité/permission serveur changée.

## Résultat développé
- Accueil Flutter réel : surfaces en relief, badges A/B/A+B, illustration dédiée sans texte,
  logo existant, quatre langues, aide et réglages, brouillons et documents.
- A ouvre le parcours existant ; B ouvre scanner/collage/invitation ; A+B ouvre `/constat`
  avec `entry=same-device`. La route web valide cette seule valeur et présélectionne le
  choix existant. Confirmation exigée, dossier restauré prioritaire, aucun droit accordé.
- Les textes restent natifs/localisés et ne sont pas incrustés dans la maquette.
  Titre/couleur/introduction/son restent pilotés par la configuration administrable existante.
  L’illustration est embarquée dans cet APK, pas un média distant administrable ajouté.
- En-tête WebView : Accordia ou fournisseur connu, aucune barre d’adresse ni URL affichée.
  Retours/rechargements protégés, vraie fenêtre native pour conserver POST/opener/cookies.
- Connexion dans le moteur embarqué, sans usurpation d’identité, import de cookies ou
  extraction de jetons. Plus de mode qui redirige les services vers Custom Tabs/navigateur.
- Contenu HTTPS tiers confirmé et conservé dans une page interne privée de capacités natives.
  Schémas externes `intent:`, `tel:`, `mailto:`, HTTP et fichiers locaux bloqués.
  Aucun lancement d’application tierce par la navigation.
- Caméra/GPS uniquement sur origine Accordia exacte et page principale Accordia, après accord.
  PDF Accordia vérifié et affiché dans le lecteur interne ; extraction refusée en page tierce.
  Le partage et l’impression explicitement demandés peuvent afficher le panneau système.
- Préparation native hors ligne, stockage chiffré, brouillons, PDF et configuration conservés.
  Les données WebView/natives/anciennes installations restent distinctes, sans migration implicite.

## Acceptation et validation
Tests Flutter : actions A/B/A+B, quatre langues à 320 px et texte 150 %, configuration,
stockage, reprise, liens complets, aucune sortie navigateur, origines/schémas interdits,
conservation du preset à la reprise de connexion, instantané visuel 390×920.
Test visuel charge la police et les icônes, active les ombres et inspecte une vraie capture
Flutter (pas une image de maquette utilisée comme interface).
Tests web : vraie route de présélection, refus de valeur arbitraire, aucune identité inventée,
confirmation même téléphone dans quatre langues ; onboarding, rôles, lifecycle et admin conservés.
Validation locale : 44 tests Flutter réussis, analyse sans diagnostic ; 29 tests web ciblés
réussis, TypeScript et build web réussis. Capture réelle inspectée. Preuves Android ajoutées après compilation.

## Limites de livraison
La connexion OpenAI a déjà échoué dans Chrome et la WebView. Forcer un moteur interne
ne corrige pas une incompatibilité fournisseur : recette réelle toujours nécessaire ;
un refus ne déclenche plus de navigateur. Une identité mobile supportée côté hébergeur
peut être nécessaire. Aucun contournement ni promesse de connexion réussie.
Le choix A+B présélectionné nécessite la mise en ligne de la petite modification web ;
aucune production publiée dans ce lot. L’ancienne production affiche son choix de mode habituel.
L’APK pointe vers la plateforme réelle ; il ne remplace pas les services serveur par une démo.
Deux comptes/téléphones, GPS/caméra physiques, pièces réelles et iOS restent à qualifier.
Les liens OS depuis SMS ne sont pas enregistrés ; scanner/coller l’invitation dans Accordia.
Nouvel identifiant de package debug pour conserver les anciennes installations et leurs données.
Pas de signature de distribution stable, publication store ou affirmation d’intégration assureur.

## Fichiers et retour arrière
`mobile/accordia/lib/design/horizon/{home,copy,azur_copy}.dart`, nouvelle illustration,
`lib/app/{app,web_actions}.dart`, `lib/platform/{page,policy,copy}.dart`, `lib/main.dart`,
version/label/package Android ; `app/constat/page.tsx`, `features/constat/workspace.tsx`, tests.
Le module historique site_browser reste dans les sources comme référence testée mais n’est
plus raccordé au point d’entrée ou aux pages de l’application. Il ne reçoit aucune URL.
Retour arrière : revenir au checkpoint, conserver toutes les installations/données.
Guide natif FR/EN/DE/NL actualisé ; guide web et tutoriel vérifiés : même choix réel et
confirmation, aucune nouvelle étape métier ni modification du parcours serveur.
