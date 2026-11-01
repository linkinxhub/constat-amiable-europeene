# Listes de saisie — marques et dégâts

Référence : version Sites 48, commit e64d27ffa19b4d2f041c609eadad94c7482b6c9a. Point de restauration before-expanded-brands-20261023.

| Champ | Traitement |
|---|---|
| Marque / modèle | 142 suggestions de marques classées alphabétiquement, marques historiques et utilitaires conservés. Le champ reste un texte libre pour le modèle et les marques absentes |
| Assureur | 17 noms proposés comme aide non exhaustive ; vérifier la dénomination du document. Aucun partenariat, contrat, transmission ou vérification du contrat associé à la liste |
| Dégâts apparents | 20 suggestions FR/EN/DE/NL : éléments touchés et types de dommages. Plusieurs ajouts explicites au texte, sans remplacement du récit, sans sélection automatique, sans estimation |
| Pays conducteur / assuré / véhicule / remorque | Listes localisées existantes conservées ; saisie libre disponible |
| Permis, point de choc, couverture tous risques | Listes existantes conservées |
| Noms / adresses / téléphones / numéros de police et de permis | Saisie libre personnelle ; pas de fausses données de démonstration ni de liste de personnes |
| Récits / observations / témoins | Texte libre pour ne pas orienter les déclarations ; aucune présomption de responsabilité |
| Date / heure / langue / nombre de véhicules / blessés / autres dommages | Contrôles spécialisés déjà présents, conservés |

Les formulaires complets et les sessions utilisent VehicleForm. Le questionnaire utilise désormais la même source fieldPresets pour les marques et les assureurs ; mêmes suggestions de dégâts dans tous les parcours. Les valeurs inconnues ou importées restent modifiables en texte libre et sont conservées dans le schéma Report existant. Aucun changement de base de données, API, droit A/B, quota ou tarif.

Ajout d'une suggestion de dégât : conservation du texte existant, ajout sur une nouvelle ligne, doublon identique refusé, dépassement de 4000 caractères refusé. Retrait et précisions possibles dans le texte. Un changement de langue ne traduit pas les déclarations existantes.

Les explications sont centralisées dans QuestionnaireInfo, repris par vitrine, tarifs, compte, guide et tutoriel. Les options sont une aide de saisie, pas une liste exhaustive de tous les véhicules ou contrats du marché.

## Références consultées

- https://www.acea.auto/acea-members/
- https://www.franceassureurs.fr/qui-sommes-nous/nos-adherents/
- https://www.assuralia.be/fr/organes-dadministration
- https://www.gdv.de/gdv/der-gdv/unsere-mitglieder

## Limites

Pas de recette visuelle navigateur/mobile ni de lecture fournisseur réelle. Les tests ne prouvent pas l'exhaustivité des marques. Pas de publication de production dans ce lot. Synchronisation GitHub non rétablie.

Validation : TypeScript, build Sites, git diff --check et 177 tests réussis, zéro échec. Tests ajoutés : anciennes marques conservées, valeurs libres acceptées, mêmes listes dans quatre langues, texte de dégâts conservé, ajouts multiples, doublons et taille limite.
