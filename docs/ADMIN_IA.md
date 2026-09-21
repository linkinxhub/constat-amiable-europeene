# Administration du croquis IA

1. Le propriétaire se connecte avec son compte ChatGPT, puis ouvre **Mon compte → Administration IA**.
2. À la première visite, il saisit le code privé à usage unique remis lors de la livraison. Ce code n’est pas une clé OpenAI. Il expire après sept jours ; ne pas le communiquer aux conducteurs. Le rôle est attaché au compte utilisé et n’est pas réattribuable avec le même code.
3. Dans **Clé API OpenAI**, saisir la clé de son projet. Saisir aussi l’identifiant exact d’un modèle du projet compatible avec les images et les réponses JSON structurées.
4. Cocher **Autoriser la génération de croquis**, puis **Enregistrer les réglages**. La clé ne sera jamais réaffichée. Pour changer seulement le modèle ou l’activation, laisser le champ de clé vide.
5. **Tester la connexion enregistrée** vérifie la clé et l’accès au modèle sans transmettre de constat ou de photo. Le test ne produit pas de croquis et ne prouve pas la compatibilité de la génération.
6. Dans une session partagée, chaque conducteur autorise l’envoi des éléments nécessaires. Une génération est ensuite possible ; la proposition doit être relue et approuvée par les deux conducteurs avant son inclusion comme croquis IA dans le PDF.

Les réglages enregistrés sont utilisés par les nouvelles demandes sans redéployer le site. Désactiver empêche les nouvelles générations ; un appel déjà envoyé au fournisseur peut se terminer. Les appels de génération sont facturés au projet OpenAI de la clé saisie. Le super administrateur ne reçoit pas d’accès aux constats des autres comptes.

## Exploitation

- `AI_SETTINGS_ENCRYPTION_KEY` : secret Sites base64 de 32 octets aléatoires. Le conserver indépendamment de D1 ; sa perte rend les anciennes clés chiffrées inutilisables et impose une nouvelle saisie de la clé fournisseur. Ne pas le remplacer lors d’une simple publication.
- `SUPER_ADMIN_SETUP_HASH` : SHA-256 hex du code d’activation aléatoire de 32 octets encodé base64url. `SUPER_ADMIN_SETUP_EXPIRES` : échéance UTC en millisecondes. Aucun code en clair dans Git/D1/logs.
- Après activation, l’enregistrement singleton bloque toute réutilisation. Modifier les variables de setup ne transfère pas le rôle existant. Une récupération de compte doit être traitée explicitement avec le propriétaire ; aucune promotion automatique par email ou par ordre de connexion.
- Si le code expire avant activation, le propriétaire peut demander un nouveau code. Renouveler son hash et son expiration dans les secrets Sites, sans modifier la clé de chiffrement ; publier une version sauvegardée pour appliquer la nouvelle révision d’environnement.
- Ne jamais saisir une clé réelle dans une route de QA, un rapport d’erreur, la conversation ou le dépôt. La saisir uniquement dans le formulaire de l’application publiée avec le compte administrateur connecté.
- La migration 0007 ajoute une table ; aucune donnée existante n’est supprimée.

## Traduction des versions PDF
La configuration sert aussi à la traduction des récits. Activer le service ne transmet rien automatiquement : A et B doivent autoriser la traduction de leur révision dans la session. Chacun choisit sa langue PDF puis coche l’option de traduction. Six préparations traduites au maximum par heure et par session ; une version identique déjà préparée est réutilisée. Le modèle exact français et les données originales sont conservés. Chaque version doit être relue et signée par les deux personnes. La traduction est disponible en session partagée authentifiée, pas dans le mode local.
