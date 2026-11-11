# TEST_PLAN

## 2026-11-11 — En-tête et commandes de saisie

Dans input_visual_test.dart, vérifier le rendu à 390 px puis à 320 px avec texte 160 % en FR/EN/DE/NL. Confirmer le statut local, le compteur d’étapes 1 → 2 → 1, l’absence d’erreur de mise en page et la conservation du brouillon. Exécuter la suite Flutter complète et produire l’APK Android de test avec le workflow existant.

Analyser et formater tous les fichiers Dart. Exécuter la suite reprise : modèles/validation locale, stockage chiffré, suppression, configuration, widgets 320 px/quatre langues, splash/son/réduction de mouvement et captures de rendu. Tests supplémentaires : neuf routes, garde d’origine/identifiants, pas d’en-têtes d’identité, 401/HTML/redirect ≠ compte connecté, contrat CAS, invitation étrangère sans requête, retour conservé après refus. Compiler Android à distance ; iOS et terrain à déclarer non qualifiés tant que non exécutés.

Parité des fiches : exécuter depuis la racine node --experimental-strip-types --test tests/native-form-contract.test.mjs, puis Flutter form_parity_test.dart et suite globale. Tester champs/suggestions libres, non-perte des propriétés inconnues, 4 langues et 320 px. Les validations temps/fuseaux et parcours multimédias restent à comparer.

0.6 : tester geste natif, annulation et effacement confirmé, limites/coordonnées invalides, croquis historique malformé conservé, reprise AES-GCM et export PDF non destructif ; rendu 390 px et 320 px/texte 1,6× FR/EN/DE/NL. Variables optionnelles ACCORDIA_INPUT_PREVIEWS et ACCORDIA_SKETCH_PDF pour exporter les preuves de rendu hors du dépôt.

PDF original : tests/native-reference-contract.test.mjs contrôle fond/police/glyphes/métriques et coordonnées du serveur ; reference_pdf_test.dart produit 3 styles × 4 langues et un cas B inactif. Comparer la page 1 via Poppler, décoder le QR et vérifier annexes/absence de données B. La CI exporte les rendus fictifs dans Accordia-Native-Review.

PDF de session : vérifier la distinction relecture/signé dans les quatre langues à 320 px, la conservation des octets d’origine et les refus 401/403, redirections et réponses invalides. Sur Preview, après mise en place de l’identité mobile, ouvrir sur Android et iOS le PDF du même dossier que dans le navigateur et comparer les octets. Vérifier ensuite le partage système et l’impression.
