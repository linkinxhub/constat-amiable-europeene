# Accordia natif 0.6 — saisie et croquis

Demande : poursuivre le portage et soigner les pages de saisie, authentification en dernier.

## Résultat
- Cartes blanches en relief, en-têtes bleu profond, accents turquoise, médaille A/B et rubriques informations / véhicule-assurance / constatations.
- Champs homogènes arrondis, saisie libre et suggestions conservées, largeur bornée à 760 px, barre Retour/Continuer/Enregistrer fixe et cinq étapes. Le repère d’étape ne prétend pas valider le dossier.
- Croquis manuel local natif au format web 800×320, points bornés, 500 traits et 5000 points par trait. Annulation du dernier trait, effacement après confirmation et conservation dans le brouillon chiffré.
- PDF préparatoire non signé sur le même fond original que le site, coordonnées des cases reprises de reference-page.ts et croquis vectoriel dans la case prévue. Clavier/stylo bleu/stylo noir, police manuscrite identique décompressée en TTF, choix de langue des annexes, valeurs longues intégrales et QR local sans données de constat. Photos toujours refusées explicitement plutôt qu’omises.
- Guide des commandes FR/EN/DE/NL actualisé. L’accueil, le logo, le splash et les champs du schéma web sont conservés.

## Preuves et limites
Tests contractuels web/natif, analyse et suite Flutter : résultats dans STATUS.md. Contrôles visuels réels Flutter à 390 px et 320 px/texte 1,6× dans les quatre langues ; captures de situation et véhicule avec données fictives. PDF de contrôle inspecté via Poppler et comparé au rendu web du même dossier fictif : fond, cases et placement de la page 1 concordants. Le rendu n’est pas déclaré identique octet/pixel par pixel : moteurs PDF distincts et mise en page d’annexes native. Tests d’identité des ressources, glyphes/métriques et 33 coordonnées statiques ; contrôle d’exclusion des données B inactives.
Les premiers tests ont révélé une couche Material nécessaire sous les listes des cartes et une perte possible du premier mouvement du dessin entre deux événements. Corrigés : surface Material et état local de trait synchronisé avant le rendu suivant. Les tests portent sur le geste réel, l’annulation, les confirmations et la reprise chiffrée. Données historiques de croquis invalides conservées et signalées.
Photos/GPS/annotations, questionnaire, OCR/IA, signatures authentifiées et administration complète restent à porter. L’authentification est différée, sans désactiver les protections serveur ; la recette connectée devra suivre son implémentation. Android CI à consigner, iOS et téléphones physiques non qualifiés. Pas de production publiée.

## Ajustement demandé pendant ce lot
Boutons et options rapprochés du style web : arrondi 10 px, contours/couleurs des choix sélectionnés, minimum tactile 44 px et champs arrondis 10 px. Couleur des commandes par défaut #1557c0 ; une couleur administrateur publiée reste prioritaire. Oui/non et nombre de véhicules deviennent des boutons comme sur le web, sans réponse implicite. Les styles PDF exposent leur état sélectionné aux lecteurs d’écran. Le fond français du document ne change pas avec la langue des annexes.
