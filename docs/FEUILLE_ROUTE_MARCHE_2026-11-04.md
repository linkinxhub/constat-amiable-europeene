# Accordia — Décisions de marché et lots de réalisation

Demande approuvée le 4 novembre 2026. Production de référence : version 90, source 5a49c419433af896caec6ef98ebd6050bee710c8. Checkout documentaire propre 5ca68f57907095c66dce7b588a6b547f7d899cd7. Retour arrière : checkpoint/before-document-data-lot-b-20261104. Aucun nouveau déploiement autorisé dans cette demande.

| Décision | Traitement et critère |
| --- | --- |
| Conserver | Trois parcours solo/appareil commun/session A/B, FR/EN/DE/NL, conducteur distinct du preneur, originaux, photos, croquis manuel, tous les PDF antérieurs et styles existants. Aucun changement aux rôles, API d’accès ou abonnements. |
| Corriger en priorité | Vérification reproductible, quota exact 128 Mio et lecteur vidéo déjà livrés v90. Lot B : statuts fondés sur les faits, gestion locale des brouillons. Gestion serveur du cycle des données reste un lot séparé. |
| Ajouter ensuite | Accès invité avec droits limités par session, expiration et révocation serveur sans élargir l’audience Sites ; dépend du choix d’architecture d’identité et de l’hébergement. Reprise sans réseau avec test de fermeture/redémarrage/conflit et traitement de la confidentialité ; aucun mode hors ligne complet promis. Profils véhicule/assurance facultatifs et confirmation avant application, sans confusion conducteur/preneur. Partage simplifié sans secret public ni transmission automatique. |
| Simplifier | Lot B : les trois styles restent sous Apparence du PDF · facultatif, clavier par défaut d’un nouveau PDF. Ensuite : réglages avancés repliés et déduplication des explications, vidéo facultative ; garder aides, contrôle du mouvement et commandes disponibles. |
| Reporter | Acquisition grand public par abonnement annuel, multiplication des offres flotte et nouvelles langues. Ne pas supprimer les offres existantes ou modifier un droit acquis ; une décision commerciale ultérieure sera nécessaire. |
| Écarter | Aucune décision de responsabilité, aucune signature automatique, aucun envoi à un tiers sans validation explicite. Les signatures et intégrations personnelles existantes restent contrôlées côté serveur. |

## Lot B : statuts documentaires et brouillons locaux

Objectif : comprendre l’état réel d’un document et maîtriser une copie locale, sans modifier les droits ou les originaux.

Modules : document-status.ts/copy/panel, draft-data.ts/copy/actions, storage.ts, workspace.tsx, local-pdf.tsx, final-panel.tsx, same-device.tsx, guides/tutoriel et globals.css. Aucun schéma SQL ou stockage serveur modifié.

Critères : distinguer brouillon, PDF solo non signé, PDF à relire, une signature, deux signatures avec assemblage attendu, PDF signé et version historique. Un ready isolé ne prouve pas deux signatures. Un PDF signé d’une révision antérieure doit être signalé comme historique sans perdre son téléchargement. La saisie terminée ne vaut pas signature et aucun statut n’invente une réception assureur.

La copie JSON contient le brouillon enregistré complet avec photos et croquis ; elle n’est ni un PDF signé ni un export complet des données du compte. Aucun import JSON n’est encore disponible. La suppression ne touche que l’entrée IndexedDB reports, dans une transaction avec comparaison du snapshot complet. Les écritures du même onglet sont sérialisées ; une copie modifiée par un autre onglet est refusée. Les PDF IndexedDB documents, données en mémoire, copies téléchargées et dossiers serveur sont préservés. L’utilisateur confirme après explication de l’irréversibilité et peut exporter avant suppression. Aucun effacement de données utilisateur exécuté par l’agent ; seulement données synthétiques de recette.

Risques : une saisie encore ouverte peut être réenregistrée après une nouvelle modification. La suppression d’un brouillon local ne vaut pas exercice complet du droit d’effacement. Les exports contiennent des données personnelles des participants ; stockage sûr requis. Cette séparation suit le rappel CNIL : portabilité et effacement sont distincts ; elle ne constitue pas une certification RGPD. Source consultée : https://www.cnil.fr/fr/respecter-les-droits-des-personnes/professionnels-comment-repondre-une-demande-de-droit-la-portabilite .

## Lots suivants et conditions de livraison

1. Données serveur : inventorier versions, PDF, signatures et participants ; permettre export borné et suppression selon droits/rétention, en préservant les intérêts des deux conducteurs. Planification de purge et sauvegardes à valider avec l’hébergeur. Tests IDOR, suspension, conflits et reprise des nettoyages obligatoires.
2. Invité : décision d’identité/routage avant implémentation, token en fragment échangé contre session courte, secret haché, révocation, limites et journal, aucun assouplissement des routes existantes. Une invitation actuelle n’ouvre pas l’accès Sites à elle seule.
3. Réseau et profils : persistance/test des brouillons d’abord, gestion des conflits et reprise explicite ; profils opt-in isolés par compte, sans signature ou fait d’accident prérempli.
4. Partage/expérience : regroupement des commandes existantes et contenu pédagogique, contrôle des langues et mobile, aucun envoi externe implicite.

Chaque lot doit passer tests, TypeScript/build, recette pertinente et synchronisation GitHub, être sauvegardé puis publié seulement sur autorisation explicite. Les fonctions planifiées ne doivent pas être présentées comme disponibles.
