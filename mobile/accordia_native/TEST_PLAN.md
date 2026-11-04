# TEST_PLAN

Analyser et formater tous les fichiers Dart. Exécuter la suite reprise : modèles/validation locale, stockage chiffré, suppression, configuration, widgets 320 px/quatre langues, splash/son/réduction de mouvement et captures de rendu. Tests supplémentaires : neuf routes, garde d’origine/identifiants, pas d’en-têtes d’identité, 401/HTML/redirect ≠ compte connecté, contrat CAS, invitation étrangère sans requête, retour conservé après refus. Compiler Android à distance ; iOS et terrain à déclarer non qualifiés tant que non exécutés.

Parité des fiches : exécuter depuis la racine node --experimental-strip-types --test tests/native-form-contract.test.mjs, puis Flutter form_parity_test.dart et suite globale. Tester champs/suggestions libres, non-perte des propriétés inconnues, 4 langues et 320 px. Les validations temps/fuseaux et parcours multimédias restent à comparer.

0.6 : tester geste natif, annulation et effacement confirmé, limites/coordonnées invalides, croquis historique malformé conservé, reprise AES-GCM et export PDF non destructif ; rendu 390 px et 320 px/texte 1,6× FR/EN/DE/NL. Variables optionnelles ACCORDIA_INPUT_PREVIEWS et ACCORDIA_SKETCH_PDF pour exporter les preuves de rendu hors du dépôt.

PDF original : tests/native-reference-contract.test.mjs contrôle fond/police/glyphes/métriques et coordonnées du serveur ; reference_pdf_test.dart produit 3 styles × 4 langues et un cas B inactif. Comparer la page 1 via Poppler, décoder le QR et vérifier annexes/absence de données B. La CI exporte les rendus fictifs dans Accordia-Native-Review.
