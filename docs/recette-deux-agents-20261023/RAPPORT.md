# Recette à deux agents et compte administrateur de test — 23 octobre 2026

Référence applicative : version publiée 52, commit `5c4ac52be1b1aa0a48f83b9a85921804f9d204da`. Aucun changement applicatif ni déploiement dans cette recette.

## Périmètre et méthode

Deux agents distincts jouent A (lecture française) et B (lecture néerlandaise). Un coordinateur appelle les vrais services du projet dans des moteurs Miniflare D1/R2 isolés, avec les migrations réelles. Les acteurs synthétiques ne sont pas des identités ChatGPT : aucune authentification de production, aucun en-tête d'identité fabriqué, aucun compte réel usurpé. Le client est une file locale, sans endpoint HTTP ajouté à la plateforme.

Scénario entièrement fictif : parking de démonstration à Bruxelles, 22 octobre 2026 à 17 h 40. A, Renault Clio TEST-A-001, est stationné ; B, Toyota Corolla TEST-B-002, recule et le touche. Aucun blessé ni autre dégât. Les conducteurs, preneurs et assureurs sont fictifs ; les déclarations commencent par TEST FICTIF. Aucun envoi à un assureur, aucune signature personnelle ou contractuelle, aucun paiement. Croquis IA et traduction fournisseur non sollicités.

## Résultats vérifiés

| Contrôle | Résultat |
| --- | --- |
| Invitation incorrecte puis valide | Incorrecte refusée 403 ; valide acceptée |
| Réutilisation de l'invitation consommée | Refusée 403 |
| Fin A seule, préparation du PDF | Refusée 400 incomplete |
| Fins A et B par les commandes réelles | Révision 3, les deux progressions terminées |
| B tente de modifier A, les faits communs et la langue A | Modifications ignorées ; valeurs originales conservées |
| Lecture FR de A et NL de B | Déclarations originales conservées dans le document français et ses annexes |
| Préparation, relecture puis marques de signature de test | PDF disponible après les deux marques TEST ONLY |
| Exemplaires finaux de A et B | 414 219 octets chacun, 4 pages, empreintes SHA-256 identiques |
| Compte ordinaire, accès documentaire | available:false, premium_closed |
| Compte ordinaire, soumission du PDF fictif | 402 premium_closed, sans appel fournisseur |
| Propositions documentaires synthétiques relues | Champs autorisés et conflit d'édition contrôlés séparément de l'extraction |
| Sauvegarde après application manuelle de ces propositions | Révision 3, fins A/B réelles ; aucun second PDF produit |

Empreinte du PDF final téléchargé par les deux agents : `b27a13c39942cc294567d12c7b06dbb8b4128e11b0ec4d8ea4dfc57c8fd8a7f4`.

Le PDF a été extrait en texte et rendu pour inspection : plaques, preneurs distincts des conducteurs, circonstances A1/B14, observations et signatures de test contrôlés. Le lieu long est abrégé sur la première page avec renvoi à sa valeur intégrale dans l'annexe. Le croquis reste vide dans ce scénario sans croquis. Ce constat de test n'est pas prêt à être envoyé pour un sinistre réel.

## Compte administrateur demandé

`TEST_QA_ADMIN_20261023` a été créé comme compte actif dans une D1 locale isolée, puis activé avec le véritable service `activateAdmin`. Le code d'activation et la clé de chiffrement sont aléatoires, conservés seulement en mémoire. La base de test est persistée sous /tmp ; elle ne constitue pas un compte de connexion au site.

- `isSuperAdmin=true` et accès documentaire `admin_preview` vérifiés.
- L'autre acteur reste ordinaire ; lecture des réglages refusée 403.
- Une deuxième activation est refusée 409 activation_used, conformément au modèle actuel à un seul superadministrateur.
- Soumission du PDF fictif avec configuration fournisseur vide : administrateur 503 ai_unconfigured, ordinaire 402 premium_closed. Zéro appel extérieur. Le contrôle du contenu du fichier et l'OCR ne sont pas atteints dans le cas administrateur, car la configuration est vérifiée d'abord.

Preuve : `admin-test-account-result.json`. Aucun compte ChatGPT, mot de passe ou accès administrateur de production n'a été créé. Un compte utilisable sur le site publié exige une identité ChatGPT de test authentifiée et un mécanisme d'attribution de rôle compatible ; le modèle actuel n'offre pas un second administrateur.

## Parcours avec documents : distinction essentielle

Les PDF `TEST-FICTIF-documents-A.pdf` et `TEST-FICTIF-documents-B.pdf` sont des fiches pédagogiques d'une page, sans imitation de pièce officielle. Le fichier `attendu-documents.json` contient les valeurs littérales attendues. Les propositions transmises à `applyDocumentFields` ont été préparées manuellement : elles vérifient la sélection, la conservation et les conflits, pas la reconnaissance du document.

Le rejet `document_conflict` remonte comme erreur JavaScript dans cette fonction pure. Le coordinateur local lui attribue par défaut un statut 500 : ce nombre n'est pas une réponse de la route HTTP ni un défaut serveur démontré.

Contrôles complémentaires : 10 tests documentaires ciblés réussis et 8 tests des réglages administrateur réussis. Certains tests fournisseur utilisent une réponse synthétique explicitement bornée au test ; aucun ne prouve une extraction IA réelle.

## Limites et suite nécessaire

Cette recette valide les services locaux pour le scénario décrit, pas une plateforme opérationnelle à 100 %. Restent à réaliser : deux connexions ChatGPT réelles sur le site publié, parcours navigateur complet entre appareils, extraction avec fournisseur réel configuré et relecture des champs reconnus, photos et GPS physiques, traductions/croquis IA réels. L'accès documentaire ordinaire reste fermé. Aucun nouveau défaut applicatif n'est confirmé dans ce scénario ; ces limites ne sont pas des réussites de test.

Guide utilisateur, tutoriel et aides vérifiés : aucun impact utilisateur, car seuls des scripts et preuves de recette ont été ajoutés. Aucun droit de production, offre commerciale, parcours visible ou traduction produit n'a changé.

## Reproduction locale

Depuis la racine du projet : lancer `node --experimental-strip-types tests/qa/two-driver-broker.mjs <dossier-temporaire-neuf> <dossier-preuves>`, puis les clients `node tests/qa/two-driver-client.mjs <dossier-temporaire> A|B <operation> manual|documents [input.json]`. Le broker ne doit être utilisé qu'avec des données fictives. Les fichiers d'invitation restent dans le dossier temporaire ; ne pas les publier.

Le script `node --experimental-strip-types tests/qa/admin-test-account.mjs` recrée un administrateur dans une nouvelle base locale isolée et exporte sa preuve sans secret. Il n'ajoute aucun accès au site publié.
