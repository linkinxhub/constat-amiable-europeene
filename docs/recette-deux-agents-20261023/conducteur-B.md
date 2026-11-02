# Recette conducteur B — 23 octobre 2026

Agent B autonome, langue néerlandaise. Services réels du dépôt v52 exécutés par le broker de tests local Miniflare D1/R2. Identités synthétiques : aucune validation de l’authentification de production. Aucun fournisseur, paiement, GPS, assureur ou personne réelle sollicité.

## Cas manuel

- Invitation invalide : refus `403 invite_invalid` à 08:54:18Z ; invitation correcte acceptée à 08:54:23Z. Réemploi après consommation refusé `403 invite_invalid` à 08:55:27Z.
- État A relu révision 2 : faits fictifs Bruxelles 22/10/2026 17:40 Europe/Brussels ; A Camille TEST A ; Renault Clio TEST-A-001 stationnée ; aucune blessure ni tiers.
- B saisi puis terminé à 08:55:12Z : Bram TEST B ; preneur VERZEKERING TEST B distinct ; Toyota Corolla TEST-B-002 ; ASSURANCE-FICTIVE-B / POLIS-TEST-B ; dégâts et observation NL préfixés TEST FICTIF ; circonstance index 13 (case imprimée 14 recul) explicitement confirmée.
- Le même appel contenait une tentative de changement du conducteur et de l’observation A, du lieu commun et de la langue A vers DE : ignorées par le service. Révision 3, progressions A et B terminées, langues FR/NL et textes originaux préservés.
- PDF relecture id `1366bfac-06ff-4439-b8ac-0dc49487dacd`, digest `201537367b6db8718073b37b92ebaf272d2c1a7213e1b82811e18657bab7701b` téléchargé par B (400119 octets, 4 pages). Texte intégral lu, annexes 2 et 3 rendues inspectées : informations et observations FR/NL intactes. Lieu long présent intégralement en annexe ; aucun texte coupé observé sur ces annexes.
- Signature B exclusivement fixture PNG « TEST ONLY » après relecture : acceptée à 08:57:04Z ; A non signé/B signé/ready faux. Après signature fixture A, téléchargement final par B : signé, 414219 octets à 08:57:59Z. Page 1 finale rendue inspectée : deux fixtures TEST ONLY, A case 1 et B case 14, plaques/preneurs corrects. Aucun envoi extérieur. Croquis vide intentionnel pour ce cas (`autoSketch:false`).

## Cas documents

- Compte B ordinaire : `document_access` disponible faux / `premium_closed`, puis tentative sur le PDF fictif B : `402 premium_closed` à 08:54:44Z. Aucun OCR ni appel fournisseur effectué ou revendiqué.
- Invitation invalide refusée puis invitation valide acceptée à 08:55:37Z.
- `review_fields` utilise réellement `applyDocumentFields` avec des valeurs attendues synthétiques provenant de `attendu-documents.json`. Le résultat est explicitement `testOnly:true, notAnExtraction:true`. Les valeurs véhicule, identité et assurance B sont exactes ; dommages, faits, observations et signatures ne proviennent pas du document. La valeur schema `uncertain` est un marqueur de fixture, pas une estimation IA.
- Édition manuelle concurrente de la plaque : rejet attendu `document_conflict`, sans écrasement. Le code 500 de l’enveloppe broker ne représente pas une réponse HTTP de production : cette fonction pure lève une Error sans status.
- Après sauvegarde et fin A, sauvegarde et fin B à révision 2 attendue acceptées à 08:58:53Z, résultat révision 3 et progression A/B terminées. Dates assurance 2026-01-01 / 2026-12-31 préservées. Falsifications A/faits/langue A ignorées. Pas de second PDF : finalisation PDF éprouvée par le cas manuel commun.

## Résultat et limites

Aucune anomalie fonctionnelle observée sur le périmètre exécuté. Le parcours manuel a abouti au même PDF final signé par fixtures pour les deux acteurs ; la post-saisie documentaire et ses protections ont été vérifiées. L’extraction IA réelle reste indisponible aux comptes ordinaires et n’a pas été validée. Cette recette locale ne prouve ni connexion réelle de deux comptes en production, ni OCR fournisseur, ni géolocalisation, ni paiement, ni transmission à un assureur, ni signature électronique qualifiée. Aucun changement applicatif ou déploiement effectué par B.
