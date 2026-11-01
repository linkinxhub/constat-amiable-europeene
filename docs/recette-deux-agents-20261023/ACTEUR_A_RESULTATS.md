# Recette indépendante — conducteur A

Cas entièrement fictif, moteur local D1/R2 utilisant les services courants de la version 52. Les identifiants sont des fixtures locales ; aucune authentification de production, extraction fournisseur, position GPS, paiement ou transmission assureur testée.

## Manuel réellement exécuté

- Invitation A transmise à B ; B rejoint avant saisie A.
- État initial révision 1 ; saisie commune et conducteur A, avec preneur distinct, sauvegarde et confirmation `finish:true` : révision 2 à 08:54:55Z. Tentative d'écrire conducteur/langue B ignorée : B vide, langues fr/nl préservées.
- Préparation avant confirmation B refusée `400 incomplete` à 08:54:56Z.
- Après confirmation indépendante de B : révision 3, A/B terminés. Préparation du document `1366bfac-06ff-4439-b8ac-0dc49487dacd`, digest `201537367b6db8718073b37b92ebaf272d2c1a7213e1b82811e18657bab7701b`.
- PDF de relecture téléchargé : 400119 octets, 4 pages. Texte intégral lu et page 1 rendue et inspectée. Conducteurs et preneurs distincts, plaques, assureurs/polices et observations originales FR/NL corrects ; cases A 1 stationné et B 14 reculait correctes. Lieu long tronqué sur formulaire avec marque de suite et intégral conservé en annexe. Aucun croquis inventé.
- Après la lecture et la signature fixture B, signature A par image synthétique `tests/fixtures/signature-test.png` acceptée à 08:57:41Z : signedA/signedB/ready=true. Aucune signature personnelle réelle.
- PDF final téléchargé à 08:57:59Z : signed=true, 414219 octets. Le téléchargement remplace le PDF de relecture au même chemin ; texte de relecture conservé dans preuves-A.

## Documents réellement exécuté

- Accès documentaire ordinaire : available=false, mode=premium_closed.
- PDF fictif A soumis à extract : refus `402 premium_closed` à 08:58:13Z. Aucun appel fournisseur ; parcours OCR réel non validé.
- `review_fields` testé séparément sur valeurs synthétiques attendues : testOnly=true / notAnExtraction=true. Driver Camille TEST A et policyholder Assurance TEST A restent distincts ; champs extra sont conservés.
- Conflit avec saisie manuelle plus récente : rejet document_conflict, aucun écrasement. Le broker traduit cette exception pure en status 500 ; ce status ne prouve pas une réponse HTTP de production.
- Valeurs synthétiques relues puis complétées avec circonstances/observations manuelles : sauvegarde par vrai updateSession finish=true, révision2 à 08:58:34Z, A terminé/B en attente. Signal envoyé à B pour sa saisie indépendante.

## Preuves

Les requêtes/réponses A sont copiées dans `preuves-A/` : initial, manual-entry/manual-save, before-pdf, prepared, sign/signed, final-download, document-access, extract-input/result, review-input/result, conflict-input/result, documents-initial/entry/save. Le journal commun events.jsonl contient les horodatages des opérations dont la préparation prématurée.

Aucune anomalie bloquante du parcours manuel exercé. Limite confirmée : la saisie express par extraction n'est pas disponible pour ce compte standard ; seule la revue de champs synthétiques a été validée. Cette recette de services ne couvre pas le navigateur et l'authentification de production.
