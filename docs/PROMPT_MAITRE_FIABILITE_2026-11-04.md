# Prompt maître Accordia — audit v92 et programme de consolidation

Tu interviens comme ingénieur responsable du produit sur Accordia, un site vitrine et une plateforme de préparation de constat. Référence : source 63888719c1a3802fad4f1f5ffc16bb6b88ad647c, version 92 sauvegardée, production version 90. Le propriétaire autorise l’audit, le présent prompt et son application ; il n’autorise pas une nouvelle publication en production.

## Résultat attendu

Améliorer la sûreté des données, la fiabilité des opérations et la rapidité perçue à partir de défauts démontrés. Ne jamais promettre une absence universelle d’erreurs : fournir des preuves reproductibles, une matrice de couverture et des limites exactes. Chaque constat doit être classé : corrigé et testé, non confirmé, dépendance externe ou chantier restant. Une liste de fonctions n’est pas une preuve qu’elles fonctionnent.

## Préserver et examiner avant toute modification

1. Lire AGENTS.md, PRODUCT_SPEC.md, ARCHITECTURE.md, ROADMAP.md, STATUS.md, DECISIONS.md, TEST_PLAN.md et les rapports existants. Vérifier Git local/distant et sauvegarder un checkpoint. Ne jamais écraser une divergence ou une modification inconnue.
2. Conserver les trois parcours, les rôles A/B et leurs validations serveur, FR/EN/DE/NL, conducteur distinct du preneur, photos et originaux, croquis manuel, tous les styles et PDF historiques. Ne supprimer aucune fonction, offre, donnée ou droit acquis.
3. Préserver SIWC, l’audience custom, les secrets, abonnements, quotas et intégrations réelles. Ne pas introduire de faux compte, faux paiement, faux envoi ou fournisseur simulé dans le produit. Les fixtures restent uniquement dans les tests.
4. Exclure tout verdict automatique de responsabilité, copie automatique de signature ou transmission à un tiers sans validation explicite. Les états « enregistré », « terminé », « signé » et « reçu par l’assureur » restent distincts.

## Audit initial obligatoire

- Exécuter verify : TypeScript, lint, build puis suite métier. Examiner erreurs, avertissements et migrations.
- Auditer dépendances de production et de développement séparément, puis vérifier les alertes auprès du mainteneur. Ne pas masquer une alerte ni forcer une incompatibilité majeure pour blanchir un scanner.
- Vérifier identité absente, suspension, propriétaire et participant étranger, révisions concurrentes, consentements, originaux et signatures, quotas, tailles/formats, expirations et reprises après échec.
- Inspecter stockage local, R2/D1, export/import, suppression et nettoyage. Aucun test destructif sur données réelles.
- Relever taille des ressources et distinguer téléchargement initial et modules chargés à la demande. Examiner la vitrine, les formulaires, menus, FAQ, tutoriel, vidéo, langues et lisibilité étroite.
- Scanner les fichiers texte suivis pour rechercher des secrets, sans en publier les valeurs ; vérifier les faux positifs de test. Documenter ce qui n’a pas été scanné.

## Lot correctif immédiat, issu des constats

### A01 — Récupération JSON et images

Le schéma seul accepte une image dont les dimensions binaires sont hors limites malgré des métadonnées déclarées modestes. Avant d’afficher une copie récupérable et avant toute écriture IndexedDB, réutiliser la validation binaire bornée existante des photos, JPEG/PNG et aperçu WebP. Préserver les originaux ; ne pas déduire la validité des champs width/height fournis. Refuser formats corrompus, pixels excessifs et budgets de pixels dépassés. Éviter les validations parallèles de plusieurs fichiers. Conserver consentement de récupération, nouvel ID, absence de session ressuscitée et date de rétention initiale. Tester photos valides, malformées, métadonnées mensongères et absence de sauvegarde lors d’un échec.

### A02 — Suppression serveur après réponse perdue

Rendre la reprise d’une demande déjà acceptée sûre et compréhensible. Un deuxième appel du même propriétaire pour la même révision doit retrouver la demande, y compris après le passage de la maintenance. Maintenir les contrôles d’identité active, de confirmation explicite, de propriété et de révision ; ne jamais supprimer un dossier partagé. Ne pas annoncer une purge physique achevée sans preuve. Tester doubles clics/appels, réponse perdue, tombstone après purge, propriétaire étranger, suspension et révision incompatible. Toute migration doit être additive et réversible par conservation des données.

### A03 — Requêtes privées du compte et des profils

Borner l’attente réseau des nouveaux panneaux privés, y compris la lecture du corps JSON. Annuler les opérations lors du démontage. Les erreurs doivent libérer les boutons, préserver les données et expliquer qu’un résultat d’écriture peut être incertain ; ne pas rejouer automatiquement un POST ou DELETE. Préserver credentials same-origin/no-store et gardes serveur. Tester délai dépassé, corps bloqué, annulation, erreur JSON, conflit et succès ; aucun message de réussite après échec.

### A04 — Tutoriel facultatif de la vitrine

Ne pas monter ni importer le tutoriel complet avant une ouverture explicite. Garder les liens et le panneau, ses quatre langues et ses contrôles. Afficher un chargement local, une erreur récupérable et une action de nouvelle tentative si le chargement du module échoue. La vitrine doit rester utilisable après cet échec. Tester ouverture, fermeture pendant chargement, refus réseau et nouvelle tentative ; comparer les ressources avant/après sans inventer de score Lighthouse ou de métrique terrain.

## Fiabilité générale et cohérence à maintenir

- Dériver identité/permissions/abonnements uniquement du serveur, vérifier l’appartenance à chaque lecture et commit sensible. Garder erreurs opaques pour les liens ou dossiers étrangers.
- Préserver les écritures conditionnelles, réservations de capacité, journaux, nettoyage reprenable et anciennes versions. La suppression locale, le retrait d’accès serveur et l’effacement physique sont des opérations distinctes.
- Ne pas confondre profil véhicule/assurance et personne. Une application remplit les cases vides par défaut, suit une relecture et ne modifie que la fiche courante.
- Préserver saisies en cours, protections de navigation, signatures liées à une version, annulation du partage et sélection manuelle des liens.
- Synchroniser toute modification visible dans guide, aide rapide et tutoriel FR/EN/DE/NL. Les informations communes doivent rester identiques dans vitrine, tarifs, compte et formulaires. Aucune promesse de fonction à venir comme disponible.
- Conserver contraste, focus clavier, marges, boutons utilisables et absence de débordement mesurée aux largeurs contrôlées. Ne pas modifier un design sain pour satisfaire une préférence non demandée.

## Chantiers manquants : conditions avant réalisation et activation

1. Invité sans compte : point d’entrée distinct du site protégé, canal serveur authentifié et session invitée limitée au dossier/participant, secret haché, expiration/révocation, quotas, journal et cookie HttpOnly/Secure/SameSite. Ne pas ouvrir l’audience de l’application pour contourner la frontière SIWC. Définir les conditions d’identité/signature avant usage invité. Préparer et tester avant toute demande d’ouverture publique.
2. Hors réseau complet : écran local dédié sans identité sérialisée, installation volontaire, cache statique uniquement, aucune réponse privée/API mise en cache, politique de protection locale. Tester fermeture/redémarrage, perte de stockage, mise à jour des caches et conflits après retour réseau. Une alerte réseau ou un import JSON ne suffit pas.
3. Données : export intégral borné des versions/PDF et exercice des droits tenant compte des deux participants ; purge planifiée indépendante des visites, supervision et preuves de sauvegarde/restauration productive. Aucun engagement RPO/RTO ou d’effacement des sauvegardes sans accès et preuve hébergeur.
4. Commercialisation : conserver paiements fermés tant que droits, facturation, consentements et reçus réels ne sont pas validés. Reporter offres supplémentaires et langues nouvelles. Vérifier formulaire/licences/acceptation par assureurs et pays avec leurs sources compétentes, sans revendication de statut officiel.
5. Exploitation : recette SIWC réelle à deux appareils, caméra et téléchargements, fournisseurs réels et paiements de test, accessibilité et performance mesurées dans les conditions représentatives, puis pentest indépendant avant lancement public. Ne pas prétendre effectuer ces validations avec une fixture.

Ces chantiers restent explicitement ouverts tant que leurs dépendances d’identité, d’hébergement ou de validation terrain ne sont pas réunies. Ne créer ni configuration de sécurité, connexion fournisseur, compte, secret, opération de facturation ou publication externe par supposition.

## Livraison et acceptation

Appliquer les corrections démontrées, vérifier le diff puis exécuter les tests ciblés et verify complet sur la source finale. Toute nouvelle défaillance doit être corrigée dans le périmètre ou signalée sans être masquée. Vérifier les routes privées compilées et les cas de concurrence concernés. Faire une recette Preview des commandes et messages pertinents, documenter la nature exacte des mesures responsive. Retirer routes/outils temporaires avant le build livré.

Produire le master audit final avec avant/après, preuves, gravité, fichiers modifiés et réserves. Mettre à jour STATUS.md, CHANGELOG.md, TEST_PLAN.md, architecture/décisions si nécessaire. Pousser la source exacte vers Sites et GitHub, sauvegarder une version testée sans déploiement. La publication et toute modification d’audience nécessitent l’autorisation explicite du propriétaire. Terminer par un bilan factuel des corrections, tests, limites restantes et prochaine décision utile.

## Application de ce prompt dans le présent lot

A01–A04 appliqués et validés : verify final, 353 tests réussis, TypeScript/build, lint 0 erreur/53 avertissements. Migration 0022 testée en local ; 40 combinaisons d’affichage sans débordement horizontal mesuré. Rapport avant/après : MASTER_AUDIT_V92_2026-11-04.md. Les cinq chantiers manquants ci-dessus ne sont pas déclarés réalisés. Sauvegarde sans publication productive ; réserve de dépendance de développement maintenue.
