# Prompt maître — Accordia

Agis comme une équipe produit senior réunissant architecture, développement full-stack/mobile, UX accessible, sécurité et assurance automobile. Crée Accordia, plateforme SaaS reliée à une application mobile de préparation et de gestion de constats amiables européens, en FR, EN, DE et NL. Développe une identité originale : ne copie ni code ni marque ni assets de DARVA/e-constat auto. Étudie uniquement les fonctionnalités publiquement présentées comme référence d'usage.

## Résultat attendu
Une expérience utilisable sous stress, sur téléphone, permettant de rassembler des faits fiables à deux, chacun dans sa langue, de les vérifier, puis, après validation juridique et intégrations réelles, de signer et transmettre un dossier versionné. Ne présente jamais un prototype, une signature dessinée ou un PDF interne comme un constat officiel accepté par tous les assureurs.

## Méthode obligatoire
Inspecte Git et les changements existants. Lis AGENTS.md, PRODUCT_SPEC.md, ARCHITECTURE.md, ROADMAP.md, STATUS.md, DECISIONS.md et TEST_PLAN.md. Travaille par lots explicites ; donne critères d'acceptation, fichiers et limites ; ne détruis aucune donnée ; n'affaiblis aucun contrôle ; ne remplace aucune intégration réelle par un mock. Tests adaptés, build, responsive, accessibilité et non-régression. Mets à jour STATUS.md et CHANGELOG.md. Preview d'abord ; production uniquement sur autorisation explicite. N'annonce aucun pourcentage sans dénominateur de critères mesurables.

## Identité et interface
Nom de travail Accordia, disponibilité juridique à vérifier. Blanc et gris froid, bleu cobalt, typographie marine lisible, véhicules A bleu et B orange identifiés aussi par lettres. Pas de dépendance à la couleur. Interface compacte, une action principale par étape, boutons tactiles de 44px, labels persistants, erreurs à proximité, annonces discrètes avec aria-live. Guide contextuel court, sans notifications trompeuses ni changements invisibles. FR/EN/DE/NL persistants ; aucun mélange non traduit ; formats localisés ; texte original inchangé.

## Parcours prioritaire
1. Sécurité : mettre à l'abri, blessés, secours, un/deux véhicules, date/heure/lieu/pays. Orienter les situations hors périmètre sans forcer un accord.
2. Participants : séparer conducteur, preneur d'assurance, propriétaire, témoins. A/B, coordonnées, véhicule, immatriculation et pays, remorque, permis, assurance/police/agence et période si requises. Ne jamais présumer conducteur = assuré.
3. Faits : circonstances normalisées versionnées, sélection indépendante A/B, total de cases, dégâts et points d'impact, récit original, témoins ; gérer « inconnu » et désaccord, aucune attribution IA de responsabilité.
4. Pièces : caméra/import borné, originaux conservés, croquis intuitif routes/voitures/flèches, annotations séparées, horodatage fiable, GPS explicite avec refus géré.
5. Relecture : erreurs/champs manquants, résumé A/B, langue de lecture par conducteur, corrections traçables. Confirmer le contenu ; seulement ensuite signature et gel lorsque le prestataire et le cadre pays sont validés.
6. Export/transmission : PDF stable, intégrité/hash, numérotation de version, langues originales et traductions approuvées ; destinataires vérifiés, envoi explicite, vraie preuve de réception, aucun faux message de succès.

## Innovations utiles
Un QR de collaboration à durée limitée ; passation claire entre conducteurs ; traduction explicable ; OCR suggéré et toujours confirmé ; checklist sans distraction ; mode de reprise après perte de connexion ; croquis accessible avec commandes clavier ; prévention des contradictions sans décider qui a tort. Pas d'IA décorative ou de score de responsabilité.

## SaaS et architecture
API commune mobile/web, modules de dossiers, participants, pièces, versions, signatures, transmissions, abonnements et audit. Identité stable côté serveur et contrôle de propriété pour chaque lecture/écriture. Organisations isolées, invitations signées et révocables, limitation débit, idempotence, accès aux pièces temporaires, secrets serveur, validation de schémas, CSP adaptée et protection CSRF. Aucun droit admin par email côté client. Séparer rôle, pack et statut de compte. Le support ne lit pas tous les constats par défaut.

Données minimales : users, organizations, memberships, vehicles, reports, participants, circumstances, evidence, report_versions, signature_requests, deliveries, subscriptions, audit_events. Modéliser DRAFT -> REVIEW -> AWAITING_SIGNATURES -> SIGNED -> DELIVERY_PENDING -> DELIVERED/DELIVERY_FAILED avec transitions serveur. Correction d'un signé = nouvelle version, jamais écrasement. Les états futurs ne sont pas activés au lot 1.

Stockage chiffré en transit/au repos avec politique validée, rétention et purge, sauvegardes vérifiées, journaux sans contenu sensible. Évaluer RGPD/eIDAS et exigences locales avec spécialistes ; ne pas inventer d'homologation. Prévoir cas Belgique, France, Allemagne et Pays-Bas ; confirmer les marchés de lancement avant promesse commerciale.

## Application mobile
Utilise d'abord le parcours responsive commun puis choisis PWA, Capacitor ou Flutter selon exigences stores/hors ligne/caméra, avec API unique. Prévoir permissions au moment utile, refus, capture photo, sauvegarde résiliente et reprise. Ne promets ni APK ni application publiée tant que non construite et vérifiée.

## Validation
Tester changements de langue sans perte, champs invalides, 1/2 véhicules sans effacement, assuré distinct du conducteur, blessés, désaccord, absence de réseau, quota/disque saturé, photo corrompue/volumineuse, relecture complète, export long, XSS/IDOR/CSRF, invitation expirée, double soumission, modification après signature, échec assureur, annulation d'abonnement, permissions et restauration. Tester clavier, mobile et zoom 200 %. Faire relire traductions et formulaire avant lancement.

## Lots
1. Parcours local multilingue et dossier de préparation imprimable.
2. Authentification, API et stockage sécurisé partagé.
3. Collaboration à deux, pièces et croquis avancés.
4. Formulaire complet et traductions vérifiés, PDF et signature avec preuve.
5. Assureurs, paiements, administration et application mobile.
6. Audit, recette, publication contrôlée et exploitation.

Commence par le lot 1. Documente précisément tout ce qui reste non implémenté. Demande seulement les choix qui changent réellement le produit : marchés initiaux, cible particuliers/flottes, nom définitif, distribution mobile, partenaires assureurs et modèle économique. Ne bloque pas les tâches réversibles sur ces questions.

## Deuxième référence ajoutée : Crashform / Assuralia
Étudier aussi https://play.google.com/store/apps/details?id=be.assuralia.crashform. La fiche présente le chargement automatique d'informations et la déclaration électronique aux assureurs belges. Elle indique une autorisation d'Insurance Europe concernant l'utilisation des données du formulaire : cette autorisation n'est pas transférée à Accordia. Prévoir vérification des droits et des accords assureurs avant utilisation d'un formulaire officiel. Les langues exactes et fonctionnalités non décrites restent à vérifier, ne pas les inventer.
