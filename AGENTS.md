# Règles Accordia
Lire la documentation produit et Git avant toute modification. Lot courant uniquement, pas de suppression sans accord. Aucune intégration simulée. Pas d'envoi aux assureurs ni signature contractuelle dans le lot 1. Pas de publication production sans autorisation explicite. Tests ciblés, build, revue responsive ; actualiser STATUS.md et CHANGELOG.md. Préserver conducteur/preneur distincts et données originales lors des traductions.

## Guide et tutoriel — règle permanente
À chaque mise à jour, vérifier le guide utilisateur, le tutoriel animé et les aides contextuelles. Toute modification visible (fonction, bouton, étape, droit, limite, consentement, sauvegarde, langue ou PDF) doit être expliquée dans le même lot, en FR/EN/DE/NL, pour les parcours concernés : local, session partagée A/B et appareil commun. Utiliser les libellés réels, préciser les prérequis et le résultat attendu ; ne jamais présenter une fonction prévue comme disponible.
Repères : features/constat/usage-guide.tsx et les dictionnaires/composants de guide et tutoriel associés ; retrouver leurs dépendances avant édition.
Critère de livraison : vérifier les explications contre les commandes réelles en Preview, les quatre langues et la lisibilité mobile ; consigner les sections actualisées et les vérifications dans STATUS.md et CHANGELOG.md. Pour un changement purement interne, consigner « guide vérifié, aucun impact utilisateur » avec la raison, sans inventer de modification pédagogique. Toute limite de validation doit être déclarée. La publication demeure soumise à l’autorisation explicite du propriétaire.

Le guide des conducteurs exclut les instructions et fonctions réservées à l’administration (demande du propriétaire). Maintenir les fonctions administratives réelles séparément.
