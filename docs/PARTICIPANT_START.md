# Démarrage partagé A/B — 23 octobre 2026

Référence : source 2dd785415d16101be94fd9584d54be9ef33d2b20, version Sites 33. Point de restauration local : before-participant-start-20261023. Source propre et synchronisée avant modification.

## Spécification et critères

Dès le formulaire, choisir A ou B, une langue FR/EN/DE/NL, le responsable des photos (A, B ou les deux) et le mode de croquis automatique. Le bouton de partage prépare un dossier à deux véhicules, crée une invitation et ouvre la session du créateur. Le QR code est affiché au début de la session ; il contient le lien personnel à usage unique et expiration 24 h. L'invité se connecte avec son propre compte et choisit sa langue ; le serveur lui attribue la lettre restante. Les droits de partage du site restent nécessaires.

Chaque conducteur peut écrire seulement sa déclaration et sa langue. A conserve la proposition des faits communs et le dessin manuel, même si B a créé le dossier. Aucun changement de responsabilité juridique n'est déduit de la lettre. Les enregistrements restent soumis à contrôle de révision et fusion préservant la partie distante. Les rôles/configuration sont immuables après création de session.

Les ajouts/remplacements de photos sont réservés au responsable désigné, avec les limites existantes (trois photos par côté). Les photos existantes restent conservées. Le choix « les deux » permet la contribution des deux côtés. Cette attribution concerne les sessions partagées ; le mode sur un appareil garde ses contrôles manuels.

En mode automatique, le navigateur du créateur doit garder la session ouverte. Après photos enregistrées, confirmations de fin des deux fiches et consentements de cette version, il demande une génération. Le serveur vérifie les prérequis, utilise son verrou IA existant et réserve durablement une seule tentative automatique par révision. Un échec ou une réponse perdue ne déclenche pas de nouvelle tentative automatique. Une relance manuelle reste possible, soumise aux quotas existants. Les appels utilisent la configuration OpenAI existante et sont facturés à son projet. La proposition doit toujours être approuvée par les deux conducteurs avant utilisation finale.

La langue de chaque fiche pilote sa relecture et le choix initial de langue du PDF partagé. La relecture locale et son PDF suivent le lecteur A/B sélectionné. Le modèle imprimé reste français, les annexes sont localisées ; les textes originaux ne sont pas remplacés. La traduction IA reste une option distincte avec consentement des deux parties. Chaque PDF préparé est un document immuable qui doit être relu et signé dans sa version exacte.

## Lots et contrôles

1. Modèle et migration additive : `Report.start`, `shared_sessions.owner_side` (défaut A) et `auto_sketch_revision` (défaut 0). Préserver les anciennes sessions et leurs données.
2. Service de session : attribution inverse A/B, renouvellement réservé au créateur, liste de sessions correcte, langues et photos isolées. Contrôles D1/R2 réels locaux et tentatives de modification de l'autre côté.
3. Interface : démarrage, QR visible, textes génériques d'invitation, relecture/PDF, aides et tutoriel FR/EN/DE/NL. Contrôle TypeScript et build ; revue navigateur tentée mais bloquée par la politique de l'outil.
4. Croquis : action `auto`, conditions serveur, réservation persistante, consentements et validation humaine conservés. Tests avec réponses synthétiques seulement ; aucun appel OpenAI réel.

## Retour arrière et limites

Ne pas supprimer les colonnes ni inverser automatiquement les dossiers créés comme B. Pour désactiver l'option après une publication, masquer la nouvelle création et l'automatisation tout en conservant la lecture du rôle `owner_side`. Revenir intégralement au code antérieur après création de dossiers B attribuerait les mauvaises lettres : cette forme de retour arrière n'est pas sûre. Aucune migration distante ni donnée de production modifiée dans ce lot.

Les sauvegardes automatiques générales, l'extraction des dégâts depuis la caméra et une traduction intégrale du modèle standard ne sont pas ajoutées par ce lot. Il ne change pas les fonctions de facturation, la configuration secrète, les accès du site ou les données existantes. Les contrôles réels sur deux comptes et la qualité d'un croquis OpenAI réel restent à réaliser.
