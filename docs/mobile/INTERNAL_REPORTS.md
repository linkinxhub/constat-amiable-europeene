# Accordia — constat interne, 0.2.0+2

## Périmètre et acceptation

Demande : l’application doit fonctionner en interne et réserver le site à un
secours exceptionnel. Lot livré en source : préparation locale, pas migration
complète des services connectés. Création → situation → A/B → circonstances →
relecture → PDF sans navigateur ; sauvegarde/reprise/suppression confirmée des
brouillons dans le stockage privé. Help est le seul appel restant à `_web` ;
aucune redirection automatique sur panne réseau ou service non porté.

Les boutons compte/rejoindre ne prétendent pas connecter un utilisateur : panneau
natif explicite. L’identité Sites dépend de son dispatcher ; aucun en-tête de
confiance forgé, jeton embarqué, compte fictif ou remplacement d’intégration réelle.

## Implémentation

- `lib/reports/model.dart` : structure du modèle existant, UUID sécurisé, conducteur
  et preneur séparés, six types de véhicule, validations, données B conservées en
  mode un véhicule mais exclues du PDF. Remorque conservée et conflit signalé.
- `store.dart` : AES-GCM 256, nonce aléatoire, AAD liée à l’UUID, clé dans
  flutter_secure_storage (Keystore/Keychain), fichiers privés `.enc`. Aucun repli
  en clair. Clé manquante avec fichiers existants : refus et conservation.
  Sérialisation des accès, révision attendue, snapshot avant attente, remplacement
  atomique par fichier temporaire, limite 50 brouillons/8 Mio de données claires.
  Fichier altéré conservé et signalé, pas d’effacement silencieux.
- `editor.dart`, `list.dart` : widgets Flutter, date/heure natives, 17 circonstances
  et confirmation par partie ; sécurité avant progression, blocage si blessés.
  Quitter sans enregistrer demande confirmation ; pas de promesse d’autosauvegarde.
  Saisie absorbée pendant sauvegarde pour éviter de remplacer une saisie en cours.
- `pdf.dart` : pdf/printing, police Unicode embarquée, aperçu interne et partage
  système explicite. Document de préparation non signé et sans statut officiel.
  Texte intégral paginé en annexe ; source jamais modifiée. Photos/croquis existants
  provoquent un refus explicite de génération plutôt qu’une omission silencieuse.
- `copy.dart`, `assets/copy/constat.json` : FR/EN/DE/NL. Export reproductible via
  `node --experimental-strip-types scripts/export-mobile-copy.mjs` depuis les
  dictionnaires canoniques. Licence DejaVu embarquée avec la police.
- `app/app.dart` : routes natives et verrou de configuration tant qu’un parcours
  de constat est ouvert. Aucun restylage à distance pendant la saisie.

## Android, conservation et secours

Sauvegarde Android désactivée (`allowBackup=false`, `fullBackupContent=false`) :
les brouillons sensibles ne doivent pas être restaurés sans leur clé. Cette
version ne propose pas encore de sauvegarde/export chiffré de récupération.
Ne pas désinstaller l’ancienne application pour essayer cette version : package
debug séparé `be.adilbtp.accordia.nativepreview`, libellé « Accordia Natif (test) ».
Les brouillons de l’ancienne version/site ne sont pas migrés automatiquement.
Clé debug CI temporaire ; distribution/mises à jour signées durables à préparer.
Version 0.2.0+2. Le package release reste be.adilbtp.accordia, sans clé de production.

## Validation réellement exécutée

Flutter 3.47.9 / Dart 3.13.7 : analyse sans diagnostic, formatage conforme,
30 tests réussis (21 existants actualisés + 9 nouveaux). Tests de stockage réel
chiffré séparés des doubles de test UI ; aucun faux stockage dans l’application.
Altération de MAC conservée, conflits concurrents rejetés, suppression liée à la
révision, champs inconnus/inactifs préservés. Parcours 320 px FR/EN/DE/NL jusqu’à
relecture et génération PDF des quatre langues avec 3 900 caractères d’observation.
Extraction pdftotext : fin `_END` présente et partie B inactive absente. Rendu FR
inspecté. Fixture JSON native acceptée par schéma et `complete()` du serveur web.

CI GitHub [41618963419](https://github.com/linkinxhub/constat-amiable-europeene/actions/runs/41618963419)
réussie : dépendances verrouillées, formatage, analyse, 30 tests, compilation APK et
artefact 13223646161. Source canonique 5de795b ; commit GitHub
0062b62ed6d3375f29b7ebd6ca9c3eb3b6505284. Sous-arbre mobile strictement identique
`9d892a7aa743129ca8cc15334daddc0bf96af0c9`. ZIP CRC correct et SHA-256 identique à
l’empreinte GitHub `cbb47bcf49a1147d75fb041113d9685142d38c4213e1f802f1f8a6341b9a2088`.
APK extrait : 96 225 138 octets, SHA-256
`f84a158b0d9959a208642a03adfd56302689affc5cd9d0c75af4ee9d9eff32dd`.
Signature debug v2 vérifiée par apksigner ; manifeste aapt : package
be.adilbtp.accordia.nativepreview, version 0.2.0 code 2, SDK min 24 / cible 36,
libellé Accordia Natif (test), ARM64. Installation sur téléphone non effectuée.
APK mis à disposition sous Accordia-Natif-test.apk, fichier persistant
libfile_cefda94d88d481918615173332f5e7c8, sauvegarde réussie et métadonnées appliquées.
L’ancien APK reste conservé séparément.
Aucun build
iOS, test matériel Keystore/Keychain, impression réelle, partage téléphone, test
perceptuel audio ou recette deux appareils revendiqué. Aucun changement du site
ni déploiement production. Main canonique 195dda2 observé et préservé ; revue native
sur branche dédiée, pas de fusion globale d’un miroir web ancien.

## Limites et suite

Pas encore de connexion mobile sécurisée, invitations collaboratives, photos,
croquis, signatures, upload/synchronisation cloud ou soumission assureur. La fiche
« documents » ouvre les préparations locales, pas une bibliothèque synchronisée.
Configuration distante : mécanisme/cache existants conservés ; API/admin productive
non encore validée de bout en bout. Icône/nom du lanceur et splash OS exigent une
nouvelle version installée ; les paramètres internes ne peuvent pas tout modifier
sans limite. Priorité suivante : authentification mobile avec backend réel, puis
collaboration et preuves/signatures. Retour arrière par branche checkpoint,
aucune suppression de données ou mise à jour forcée.
