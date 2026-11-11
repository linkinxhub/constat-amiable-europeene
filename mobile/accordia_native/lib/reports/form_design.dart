import 'package:flutter/material.dart';

import '../design/horizon/copy.dart';

const formInk = Color(0xff122442);
const formBlue = Color(0xff0754d7);
const formTeal = Color(0xff007d83);

class FormWords {
  const FormWords(this.language);
  final HorizonLanguage language;
  String t(String key) => words[key]![language.index];
  static const words = {
    'pdfTemplate': [
      'Le modèle fourni reste en français. La langue choisie s’applique aux annexes ; vos récits restent inchangés.',
      'The supplied template stays in French. The selected language applies to appendices; your statements remain unchanged.',
      'Die bereitgestellte Vorlage bleibt französisch. Die gewählte Sprache gilt für Anlagen; Ihre Aussagen bleiben unverändert.',
      'Het aangeleverde sjabloon blijft Frans. De gekozen taal geldt voor bijlagen; uw verklaringen blijven ongewijzigd.',
    ],
    'step': ['Étape', 'Step', 'Schritt', 'Stap'],
    'progress': [
      'Repères de saisie, pas une validation',
      'Input steps, not a validation',
      'Eingabeschritte, keine Prüfung',
      'Invulstappen, geen controle',
    ],
    'situation': [
      'Les faits, simplement',
      'The facts, simply',
      'Die Fakten, einfach',
      'De feiten, eenvoudig',
    ],
    'details': [
      'Vos informations',
      'Your details',
      'Ihre Angaben',
      'Uw gegevens',
    ],
    'vehicle': [
      'Véhicule et assurance',
      'Vehicle and insurance',
      'Fahrzeug und Versicherung',
      'Voertuig en verzekering',
    ],
    'damage': [
      'Ce que vous avez constaté',
      'What you observed',
      'Was Sie beobachtet haben',
      'Wat u hebt waargenomen',
    ],
    'time': [
      'Date et lieu',
      'Date and location',
      'Datum und Ort',
      'Datum en plaats',
    ],
    'sketchHelp': [
      'Dessinez les routes, les véhicules A/B et leurs directions. Ce croquis ne détermine aucune responsabilité.',
      'Draw roads, vehicles A/B and their directions. This sketch does not determine liability.',
      'Zeichnen Sie Straßen, Fahrzeuge A/B und ihre Richtungen. Die Skizze bestimmt keine Haftung.',
      'Teken wegen, voertuigen A/B en hun richtingen. Deze schets bepaalt geen aansprakelijkheid.',
    ],
    'clear': [
      'Effacer le croquis',
      'Clear sketch',
      'Skizze löschen',
      'Schets wissen',
    ],
    'clearAsk': [
      'Effacer tous les traits de ce croquis ?',
      'Clear all strokes from this sketch?',
      'Alle Striche dieser Skizze löschen?',
      'Alle lijnen van deze schets wissen?',
    ],
    'limit': [
      'Limite de dessin atteinte. Annulez un trait pour continuer.',
      'Drawing limit reached. Undo a stroke to continue.',
      'Zeichenlimit erreicht. Machen Sie einen Strich rückgängig.',
      'Tekenlimiet bereikt. Maak een lijn ongedaan.',
    ],
    'mediaLater': [
      'Les photos et les signatures seront ajoutées dans un prochain lot. Le croquis manuel est disponible ici.',
      'Photos and signatures will follow in a later update. Manual sketching is available here.',
      'Fotos und Unterschriften folgen später. Manuelles Zeichnen ist hier verfügbar.',
      'Foto’s en handtekeningen volgen later. Handmatig tekenen is hier beschikbaar.',
    ],
    'sketchGuide': [
      'Croquis : dessinez au doigt, utilisez Annuler pour retirer le dernier trait ou Effacer le croquis après confirmation. Enregistrez le brouillon pour conserver le dessin. Dans Vérification, choisissez Clavier, Stylo bleu ou Stylo noir et la langue des annexes. Le PDF reprend le modèle du site et le croquis ; il reste non signé.',
      'Sketch: draw with your finger, use Undo to remove the last stroke or Clear sketch after confirmation. Save the draft to retain the drawing. In Review, choose Keyboard, Blue pen or Black pen and the appendix language. The PDF uses the website template, includes the sketch and remains unsigned.',
      'Skizze: mit dem Finger zeichnen, mit Rückgängig den letzten Strich entfernen oder das Löschen bestätigen. Entwurf speichern, um die Zeichnung zu behalten. Unter Prüfung Tastatur, blauen oder schwarzen Stift und die Sprache der Anlagen wählen. Das PDF verwendet die Website-Vorlage, enthält die Skizze und bleibt unsigniert.',
      'Schets: teken met uw vinger, verwijder de laatste lijn met Ongedaan maken of bevestig het wissen. Sla het concept op om de tekening te bewaren. Kies bij Controle Toetsenbord, Blauwe pen of Zwarte pen en de taal van de bijlagen. De PDF gebruikt het websitesjabloon, bevat de schets en blijft ongetekend.',
    ],
  };
}

class FormPanel extends StatelessWidget {
  const FormPanel({
    super.key,
    required this.child,
    this.title,
    this.icon,
    this.side,
  });
  final Widget child;
  final String? title;
  final IconData? icon;
  final int? side;
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(bottom: 20),
    padding: const EdgeInsets.all(18),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(26),
      border: Border.all(color: const Color(0xffe1e7ef)),
      boxShadow: const [
        BoxShadow(
          color: Color(0x11132947),
          blurRadius: 20,
          offset: Offset(0, 10),
        ),
        BoxShadow(
          color: Color(0xffffffff),
          blurRadius: 2,
          offset: Offset(-2, -2),
        ),
      ],
    ),
    child: Material(
      type: MaterialType.transparency,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (title != null) ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (side != null)
                  SideMedallion(side: side!)
                else if (icon != null)
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xffedf3ff),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(icon, color: formBlue, size: 22),
                  ),
                if (side != null || icon != null) const SizedBox(width: 12),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      title!,
                      style: const TextStyle(
                        color: formInk,
                        fontSize: 19,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
          child,
        ],
      ),
    ),
  );
}

class SideMedallion extends StatelessWidget {
  const SideMedallion({super.key, required this.side});
  final int side;
  @override
  Widget build(BuildContext context) => Container(
    width: 48,
    height: 48,
    alignment: Alignment.center,
    decoration: BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: side == 0
            ? const [Color(0xff3481ff), Color(0xff063885)]
            : const [Color(0xff27c6c0), Color(0xff005760)],
      ),
      borderRadius: BorderRadius.circular(15),
      border: Border.all(color: const Color(0xffbad7f2)),
      boxShadow: const [
        BoxShadow(
          color: Color(0x28112442),
          blurRadius: 8,
          offset: Offset(0, 5),
        ),
      ],
    ),
    child: Text(
      side == 0 ? 'A' : 'B',
      style: const TextStyle(
        color: Colors.white,
        fontSize: 26,
        fontWeight: FontWeight.w900,
      ),
    ),
  );
}

class FormStepHeader extends StatelessWidget {
  const FormStepHeader({
    super.key,
    required this.labels,
    required this.current,
    required this.words,
    required this.status,
  });
  final List<String> labels;
  final int current;
  final FormWords words;
  final String status;

  @override
  Widget build(BuildContext context) {
    final stepLabel = '${words.t('step')} ${current + 1} / ${labels.length}';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xffdce5f0)),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Semantics(
            label: '$stepLabel. ${words.t('progress')}',
            excludeSemantics: true,
            child: Text(
              stepLabel,
              style: const TextStyle(
                color: Color(0xff173b69),
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(height: 4),
          Semantics(
            header: true,
            child: Text(
              labels[current],
              style: const TextStyle(
                color: formInk,
                fontSize: 23,
                fontWeight: FontWeight.w800,
                height: 1.2,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            spacing: 5,
            children: [
              for (var i = 0; i < labels.length; i++)
                Expanded(
                  child: Container(
                    height: 5,
                    decoration: BoxDecoration(
                      color: i == current ? formBlue : const Color(0xffdce5f0),
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            status,
            style: const TextStyle(color: Color(0xff52617a), height: 1.4),
          ),
        ],
      ),
    );
  }
}

/// Native equivalent of the website's outlined aria-pressed command buttons.
class FormChoiceButton extends StatelessWidget {
  const FormChoiceButton({
    super.key,
    required this.label,
    required this.selected,
    required this.onPressed,
    this.leading,
  });
  final String label;
  final bool selected;
  final VoidCallback? onPressed;
  final Widget? leading;
  @override
  Widget build(BuildContext context) => Semantics(
    selected: selected,
    child: OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(44, 44),
        backgroundColor: selected ? const Color(0xffe7f0ff) : Colors.white,
        foregroundColor: const Color(0xff173b69),
        side: BorderSide(
          color: selected ? const Color(0xff1557c0) : const Color(0xffacbfd8),
          width: selected ? 2 : 1,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
      ),
      child: leading == null
          ? Text(label)
          : Column(
              mainAxisSize: MainAxisSize.min,
              children: [leading!, Text(label)],
            ),
    ),
  );
}
