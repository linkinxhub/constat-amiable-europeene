# Intégration des pièces validées au constat — 23 octobre 2026

Sur le site publié v52, reprise exacte du même constat navigateur qui contient les cinq extractions réelles validées. Aucune recopie, nouvelle extraction, lecture de clé ou modification applicative.

Actions : ouvrir Vérification, constater les valeurs A/B, cliquer Préparer le document à relire puis télécharger par le véritable lien PDF. Lecture de la première page du fichier téléchargé : TEST-A-001, TEST-B-002, Renault Clio, Toyota Corolla, ASSURANCE-FICTIVE-A, ASSURANCE-FICTIVE-B, POLICE-TEST-A, POLIS-TEST-B, Assurance TEST A, VERZEKERING TEST B, nom TEST A, prénom Camille et les deux dates 2026-01-01/2026-12-31 y figurent directement dans les cases. Quatorze valeurs attendues contrôlées textuellement ; rendu de la page inspecté.

La chaîne existante est vérifiée : DocumentImport applique les seuls champs sélectionnés au véhicule courant ; le report commun passe à LocalPdf/renderPdf, et referencePage remplit les cases du modèle. Les parcours partagés utilisent le report sauvegardé de la session : il faut enregistrer sa partie avant la préparation partagée. Les PDF gelés existants restent immuables ; une modification exige un nouveau PDF et, le cas échéant, de nouvelles signatures.

Une copie d'une page du PDF réellement téléchargé est remise au propriétaire comme preuve, sans retoucher les valeurs. Ce n'est pas le script indépendant de démonstration utilisé auparavant. L'export applicatif téléchargé comporte encore quatre pages : seule sa première page a été extraite pour cette preuve. Aucune suppression d'annexe par défaut n'est implémentée dans ce lot.

Le document est un brouillon incomplet non signé : faits de l'accident, circonstances, dégâts, contacts/permis et identité B non analysée restent vides. Les pièces fictives ne fournissent pas ces faits et aucune valeur n'est inventée. Aucun constat final signé, envoi à un assureur ni validation à deux comptes n'est revendiqué.

Guide vérifié, aucun impact utilisateur : aucun bouton, comportement ou droit modifié. Pas de build relancé pour cette recette navigateur et consignation uniquement. Vérifications : transfert réel des données validées au PDF, téléchargement, texte de la première page et inspection visuelle.
