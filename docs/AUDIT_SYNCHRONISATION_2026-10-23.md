# Audit transversal — saisie, documents IA et cohérence produit

Référence : Sites 42, commit 3ab68b1 ; restauration before-sync-audit-20261023.
Périmètre : code source, architecture et documentation, routes et autorisations, saisie locale/partagée/appareil commun, PDF, offres, vitrines et aides. Les contrôles automatisés ne constituent ni pentest indépendant ni recette réelle multi-appareil.

## Constats et corrections

| Constat | Correction |
|---|---|
| Offres et prix dupliqués sur la vitrine | Cartes issues de pricingCopy, montants principaux issus du même catalogue public que la validation serveur |
| Commande « Choisir » en français dans les autres langues et pouvant évoquer un achat | Commande localisée de préférence du compte ; statut d'achat indisponible |
| Aide générale laissant croire que toute IA exige deux consentements | Distinction croquis/traduction A/B et import personnel explicitement consenti |
| Pas de choix remorque ou identité du preneur distinct | Deux catégories explicites, listes de champs serveur séparées ; immatriculation remorque ne remplace pas celle du véhicule |
| Couverture documentaire absente du compte et incomplète sur la vitrine | Composant DocumentCoverage partagé dans six surfaces : import, tarifs, compte/offres, vitrine, guide, tutoriel |
| Erreur réseau assimilée à achats fermés | État erreur et commande Réessayer, état de chargement distinct |
| Annulation et expiration du délai sans message | Messages dédiés en quatre langues, aucune relance automatique |
| Guide public contenant des consignes administrateur | Mention d'essai administrateur retirée du guide conducteur ; panneau d'essai réservé inchangé |
| Libellés accessibles vitrine partiellement français | Langue du sélecteur et alternative image localisées, état du menu exposé |

## Pièces et données

| Pièce | Données proposées | Limites |
|---|---|---|
| Immatriculation véhicule | plaque, marque/modèle, pays d'immatriculation | Propriétaire non présumé conducteur ou assuré |
| Carte d'identité / passeport conducteur | nom, prénom, naissance, adresse si présente | Pas de numéro national/passeport, nationalité ou reconnaissance faciale |
| Permis | identité, numéro, catégories, échéance | Aucune catégorie inventée |
| Assurance / carte internationale | assureur, police, assuré, dates, agence, plaque | Seulement mentions lisibles et présentes |
| Immatriculation remorque | plaque et pays remorque | Pas de modification du véhicule tracteur |
| Identité preneur d'assurance | nom, prénom, adresse | N'affecte pas l'identité du conducteur |

Fichiers PDF/JPEG/PNG/WebP : une pièce ou face par appel, 3 Mio, images 4 Mpx. Valeurs à relire avant insertion. Champs existants non cochés automatiquement ; corrections intervenues entre-temps protégées. Aucune archive de pièce créée par cette fonction. Les données appliquées suivent la sauvegarde habituelle ; en session partagée, enregistrement explicite.

Non couvert : contrôle technique, factures et devis, faits d'accident, circonstances, dégâts, témoins, signatures, coordonnées absentes, HEIC et lots de fichiers. Ce périmètre est indiqué dans l'aide. Ce n'est pas une garantie de lecture de tous les modèles nationaux ; test réel restant.

## Cohérence et simplicité

Le catalogue ne contient aucun secret et n'accorde aucun droit. Le serveur conserve la validation des prix et les protections d'identité/rôle. Les prix sont des offres prévues, les achats restent fermés. Le quota commercial de lecture de pièces n'est pas encore défini : il n'est pas promis comme inclus dans les dix générations de croquis/traduction. Les limites techniques de cinq tentatives par heure et de cent appels IA globaux/jour restent actives.

Conservés : sections progressives, saisie libre, sauvegarde locale, rôle/langue A/B, invitations, révisions, consentements, PDF et signatures. Pas de fusion silencieuse entre comptes. La centralisation concerne les informations produit, jamais les données d'accident sur la vitrine.

La synchronisation est intégrée aux imports et à AGENTS.md, avec tests de cohérence. Elle n'est pas une tâche en arrière-plan : les futures fonctionnalités doivent toujours être raccordées à ces sources et vérifiées. Les textes commerciaux explicatifs restent à relire quand changent les règles (montants annuels, suppléments, quotas).

## Exploitation et limites

Lecture des erreurs sur les trois dernières heures : cinq événements retournés, tous 404 ; quatre /products.json sans appel correspondant dans le code applicatif, un /signin-with-chatgpt provenant du robot de rendu sur une route réservée à l'hébergement. Aucun 5xx dans cet échantillon ; cela ne prouve pas l'absence générale d'incident. Pas de fausse route ajoutée pour masquer ces événements. Connexion réelle à vérifier avec deux comptes autorisés.

Restent : recette visuelle mobile et navigateur (Preview précédemment bloqué par politique), vraie lecture OpenAI sur pièces autorisées, qualité par pays, parcours A/B réel, tests marchands de bout en bout, activation commerciale, analyse indépendante des dépendances et sécurité. Aucun document réel ou appel fournisseur facturable utilisé pour cet audit. Pas de migration destructive.

## Validation

TypeScript, build Sites et diff réussis. Suite complète : 160 tests réussis, zéro échec. Test additionnel du Worker compilé : sept rendus HTTP (accueil, constat, compte, tarifs quatre langues) réussis ; 161 tests réussis au total. Ce contrôle de rendu HTML ne valide pas les interactions ou la disposition dans un navigateur. Les tests ciblés couvrent les nouvelles catégories, l'isolation des champs, la présence des libellés dans quatre langues et les montants catalogue/UI.

## 2026-10-23 — Questionnaire chronologique gratuit
Option disponible dans les trois parcours, sur les données Report existantes : sécurité, date/heure, lieu GPS, dommages communs, fiches conducteur/preneur/véhicule/assurance, compléments par groupes de trois champs maximum, circonstances et témoins. Photos/croquis/relecture/signatures conservent leurs écrans. Choix 1/2 véhicules sans suppression des données du second ; conducteur partagé limité à sa fiche, faits communs réservés à A. Passage questionnaire/formulaire complet sans effacement ; compteur de position, pas de complétude. Validation finale et sauvegarde réseau explicite inchangées. Import documentaire Premium disponible dans la fiche ; aucune nouvelle requête fournisseur ni paiement.
Vitrine : carte avec illustration SVG animée existante, pause et réduction des mouvements héritées. Description centrale QuestionnaireInfo/questionnaire-copy en FR/EN/DE/NL réutilisée dans vitrine, tarifs, compte, guide et tutoriel. Consigne permanente étendue dans AGENTS.md pour les futurs champs.
Validation : TypeScript, compilation Sites, diff et 166 tests de la suite complète réussis, aucun échec. Tests dédiés : couverture des champs de base/compléments, ordre et identifiants stables, périmètre A/B, absence de mutation, parité des traductions. Ajustement final de présentation : panneaux de réglages repliés en mode guidé ; nouvelle compilation. Aucun test navigateur/mobile ni essai multi-compte réel ; blocage Preview antérieur non contourné. Synchronisation GitHub non effectuée, authentification Git locale indisponible. Version préparée sans publication, autorisation de production non demandée dans ce lot.
