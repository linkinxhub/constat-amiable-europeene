# Parcours photo et préremplissage IA — spécification exécutable

## Demande reformulée
Ajouter une option permettant à chaque conducteur de photographier ses papiers afin que l’IA lise les informations utiles et préremplisse automatiquement sa fiche du constat, sans devoir les recopier. Présenter une vérification simple et groupée avant insertion. Demander une saisie uniquement pour les informations absentes, illisibles ou propres à l’accident, et une confirmation personnelle des déclarations et signatures.

## Prompt d’exécution
Agis comme ingénieur produit senior sur Accordia. Pars de la version 56 publiée, commit source a5808c8, arbre a0c9c9c35d143015d517c9ed20f451e14c749195, synchronisé avec GitHub e3f351f. Respecte AGENTS.md, les spécifications, l’architecture, les décisions et les tests existants. Ne supprime aucune donnée, ne remplace aucune intégration réelle, n’active aucun paiement ni privilège client artificiel.

Construis sur DocumentImport et l’API /api/document-extraction existants un parcours « Photographier mes papiers ». Préserve la saisie manuelle et les droits serveur. Photographie ou importe permis, immatriculation véhicule, assurance, identité conducteur, remorque et identité du preneur distinct. L’utilisateur choisit le type de chaque pièce ; recto et verso sont deux fichiers. Pas de classement automatique ambigu entre conducteur, preneur et titulaire du véhicule.

Constitue une file de cinq pièces maximum. Les images JPEG/PNG/WebP locales jusqu’à 20 Mio sont réencodées dans le navigateur, au plus 2 000 pixels sur le grand côté, 4 Mpx et 3 Mio envoyés ; refuser au-delà de 40 Mpx à la lecture. Les PDF restent bornés à 3 Mio, sans conversion. Ne modifie pas les originaux. Retire les métadonnées EXIF par réencodage, sans promettre l’effacement des informations visibles. N’ajoute pas ces pièces sensibles aux photos de dégâts ni au PDF.

Exige un consentement explicite pour transmettre les pièces sélectionnées à OpenAI. Lis successivement les pièces via le véritable serveur : mêmes autorisations, limites de corps, contrôle des fichiers, modèle et clé serveur, store:false, liste fermée de champs, 5 tentatives/heure/compte et plafond IA global de 100/jour. Une pièce consomme une tentative ; un échec peut être facturé. Le lot ne constitue pas un crédit unique. Arrête au premier échec pour éviter d’envoyer silencieusement les pièces suivantes ; conserve les résultats réussis et permets une reprise explicite sans les relire. L’annulation interrompt la suite mais ne promet pas l’annulation d’un appel déjà reçu par le fournisseur.

Présente une seule relecture : valeur actuelle, propositions, pièce source et incertitude. Présélectionne uniquement les champs vides dont la valeur est unique et la lecture haute confiance. En cas de valeurs contradictoires, de lecture incertaine ou de champ existant, impose un choix explicite. Une sélection n’est pas une validation de l’exactitude. Une confirmation humaine est obligatoire avant toute insertion. Si un champ choisi a changé pendant la lecture, refuse toute l’application : ne remplace pas une correction concurrente. Préserve les champs sans rapport, l’autre conducteur et les faits communs.

Ne déduis jamais les faits de l’accident à partir des papiers. À confirmer ou saisir : date/heure/lieu, blessés, nombre de véhicules, dégâts aux tiers, circonstances et leurs cases, dégâts/point de choc, observations, témoins, coordonnées absentes et signatures personnelles. Le GPS peut proposer un lieu après accord existant ; il ne prouve pas le lieu de l’accident. Ne présume ni absence de blessés/témoins, ni responsabilité, ni identité du preneur à partir du conducteur ou titulaire. N’extrais aucun numéro national/passeport, visage, biométrie ou signature.

Applique les mêmes composants aux trois parcours : local, deux conducteurs sur un appareil, session partagée. En session, l’API autorise uniquement sa propre partie ; l’insertion ne remplace pas l’enregistrement réseau. Les documents et propositions non appliqués restent en mémoire et disparaissent à la fermeture ; les données appliquées suivent la sauvegarde existante. Ne signe ni ne finalise automatiquement le constat. Les achats Premium étant fermés, conserve l’essai administrateur existant et l’indisponibilité explicite aux comptes ordinaires. Cette livraison n’ouvre pas commercialement l’option.

Synchronise l’aide, le tutoriel et les informations publiques FR/EN/DE/NL depuis les textes communs. Soigne mobile, libellés, états de chargement/erreur, clavier et surfaces tactiles. Aucune nouvelle dépendance, migration, clé ou base de données n’est nécessaire.

## Plan, modules et contrôles
1. Vérifier Git/source distante/docs, conserver la référence avec le tag before-document-photo-batch-20261101 ; TypeScript de référence.
2. Ajouter document-batch.ts (consolidation non destructive), document-photo.ts (préparation locale), document-photo-copy.ts ; étendre document-import.tsx. Tester contradictions, choix par défaut, budgets et erreurs.
3. Actualiser document-copy.ts, styles et pédagogie partagée. Vérifier présence dans Guide/Tutoriel/vitrine/tarifs/compte et parité des quatre langues.
4. Tester vrais gestionnaires asynchrones avec fournisseurs contrôlés uniquement dans les tests ; suites serveur existantes pour quotas, rôle, type et isolement ; TypeScript, build, suite complète après build, lint comparé et diff.
5. Vérifier Preview ; documenter les limites (caméra physique, lecture fournisseur et documents réels non implicitement validés). Mettre à jour STATUS/CHANGELOG/TEST_PLAN. Synchroniser les sources testées ; aucune nouvelle publication production autorisée par la seule demande de commencer ce lot.

## Critères d’acceptation
- Plusieurs pièces choisies sans recopie des valeurs documentaires ; envoi borné et séquentiel après consentement.
- Doublons identiques regroupés ; valeurs contradictoires non présélectionnées ; uncertain et existant non présélectionnés.
- Échec/annulation : résultats déjà obtenus disponibles, aucune écriture du constat avant confirmation ; reprise sans relire les succès.
- Aucun résultat tardif appliqué après fermeture ; aucune modification A→B ou des faits communs ; contrôle des éditions concurrentes.
- Valeurs appliquées compatibles avec le Report et le PDF existants ; pièces non ajoutées au constat en annexe.
- Droits ordinaires refusés côté serveur, quotas inchangés, aucune clé côté client ; tests production sans données personnelles.
- Guide fidèle en quatre langues ; build/TS/tests réussis ou blocages précisément déclarés.

## Retour arrière et limites
Revenir au tag de référence pour les fichiers applicatifs, sans restauration destructive des dossiers ni migrations. Les champs déjà appliqués demeurent des valeurs ordinaires du constat. Le modèle configuré doit effectivement supporter les images/PDF et les sorties structurées ; ni un mock de test ni un GET de modèle ne prouvent la qualité de lecture. Validation humaine indispensable. Ouverture commerciale et publication constituent des étapes séparées.
