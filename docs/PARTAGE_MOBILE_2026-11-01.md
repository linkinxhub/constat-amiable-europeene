# Réparation du partage mobile
Référence locale 17e3c7c / GitHub 758c563db45796166b487493af8394419d4008e3 ; état propre et synchronisé avant édition. Restauration before-invitation-recovery-20261101. Demande : réparer le partage après capture montrant invitation absente et erreur générique. Logs récents : lectures session refusées 404, sans preuve permettant d’attribuer une cause unique à la perte de fragment. Aucun jeton réel ni adresse de connexion conservé dans ce document.

## Plan et critères
1. Validation et cache session bornés, conservation de l’invitation jusqu’à adhésion serveur ; jamais de jeton dans URL de connexion/query/logs ou stockage persistant localStorage.
2. Récupération explicite du lien même site/dossier, information claire sur compte différent, validité 24h/usage unique et remplacement de l’ancienne invitation.
3. Rejoindre vérifie l’appartenance avant de consommer une invitation, pour récupérer les réponses perdues. Lecture refusée avant adhésion devient une aide utile. Aucun affaiblissement serveur.
4. Interface/boutons mobiles, copie manuelle et annulation de partage ; guide/tutoriel/vitrine/tarifs/compte commun FR/EN/DE/NL.
5. Tests des vrais composants et services préexistants, build, Preview, synchronisation et sauvegarde sans publication.

## Vérifications et limites
Huit nouveaux scénarios ciblés réussis. Preview réelle sur session fictive non authentifiée : lien incomplet refusé, récupération en mémoire/session puis rechargement, quatre langues à 375 px sans débordement. Page de mesure temporaire supprimée. La connexion ChatGPT réelle n’a pas été exécutée ; aucun nouveau compte, rôle, jeton réel consommé, adhésion ou signature. Qualité complète finale consignée dans STATUS. L’application ne peut reconstruire un fragment supprimé avant son chargement par une redirection d’hébergement : le champ de récupération reste disponible. Usage de deux téléphones et de leurs applications de messagerie à confirmer par le propriétaire après publication.

## Retour arrière
Rétablir la source avant-invitation sans supprimer les dossiers ; aucun changement SQL ou API serveur. Le nouveau lecteur de cache sait lire les anciens jetons bruts, migration locale vers JSON ; si retour au vieux client et cache JSON, rouvrir le lien original. Source v61 et production v59 gardées, accès custom et visiteurs autorisés conservés.

Vérification finale : 247 tests réussis/0 échec après build, TypeScript validé, lint 0 erreur/54 avertissements historiques. Aucune nouvelle dépendance. Diff contrôlé ; publication non demandée.
