# Splash n° 2 — Du constat à la sérénité

Version Flutter 0.4.1+7, branche feat/splash-serenity-audit-20261103.
Séquence réelle Flutter : scène accident/constat révélée, traînée lumineuse dessinée,
bouclier en relief et titre localisé, puis accueil. Image séparée des vrais textes.
Il s’agit de l’introduction après le lancement système Android/iOS, pas d’une vidéo
injectée dans la WebView ni d’une animation de la couche système Android.

Activation/durée/couleur/titre/son suivent la configuration existante. Schéma actuel :
durée 0–1500 ms ; valeur courante du défaut 900 ms, pas d’allongement forcé à 2 s.
Passer ouvre immédiatement l’accueil ; mouvement réduit ou introduction désactivée
suppriment l’animation et l’attente. Cache borné, aucun réseau nécessaire à l’animation.
Pas de faux compteur de chargement, de permissions ni d’appel métier au démarrage.
Pause arrière-plan ; aucun rejeu sur reprise/réglages/langue. Son si activé au début,
arrêt à la fin/Passer/arrière-plan, politique audio existante conservée.
Guide natif FR/EN/DE/NL mis à jour ; guide/tutoriel web vérifiés sans changement métier.
Brouillons, droits et navigation WebView Azur conservés.

Tests : 320×640 et texte 150 % dans quatre langues, Passer et fin une seule fois,
mouvement réduit immédiat, pause/reprise, réseau qui ne répond pas, aucun rejeu ;
captures Flutter de la phase lumineuse et du résultat final. Analyse et suite Flutter
complète exécutées : 51 tests réussis, aucun diagnostic d’analyse. Compte rendu global : ../MASTER_AUDIT_2026-11-03.md.

Assets : scène existante azur-accident.webp conservée ; nouveau shield-relief.png.
Emblème relief généré à partir de la silhouette blanche du bouclier Accordia existant,
matériau porcelaine/platinum blanc, extrusion discrète et lumière froide, fond transparent,
sans texte, autre marque ou nouveau symbole. Prompt de production : préserver contour,
proportions et coche ; rendre les traits en porcelaine blanche biseautée, reflets bleu
cobalt sur le bord, lumière en haut à gauche ; fond et intérieur transparents, sans
panneau, cercle, sol, orbite, véhicules ni filigrane. Création d’image native, non CLI.

Fichiers : lib/design/horizon/{intro,bootstrap,splash_copy}.dart, lib/app/app.dart,
assets/brand/shield-relief.png, version/assets pubspec, label/package de test Android,
tests splash/bootstrap/rendu ; eslint.config.mjs pour exclure les caches générés.
Retour arrière : checkpoint/before-splash-master-audit-20261103, sans effacement de données.
Anciennes installations conservées ; nouvel identifiant debug pour éviter un conflit de
signature. Pas de publication productive. iOS et fluidité/son physiques à qualifier.
