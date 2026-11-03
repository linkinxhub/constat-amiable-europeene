import 'copy.dart';

class AzurCopy {
  const AzurCopy(
    this.question,
    this.create,
    this.joinHint,
    this.together,
    this.togetherHint,
    this.documents,
    this.safety,
  );
  final String question,
      create,
      joinHint,
      together,
      togetherHint,
      documents,
      safety;
  static const values = {
    HorizonLanguage.fr: AzurCopy(
      'Comment commencer ?',
      'Créer un nouveau constat',
      'Scanner un QR ou une invitation',
      'Ensemble',
      'Sur le même téléphone',
      'Mes documents',
      'À remplir une fois à l’abri.',
    ),
    HorizonLanguage.en: AzurCopy(
      'How would you like to start?',
      'Create a new report',
      'Scan a QR or an invitation',
      'Together',
      'On the same phone',
      'My documents',
      'Complete only once you are safe.',
    ),
    HorizonLanguage.de: AzurCopy(
      'Wie möchten Sie beginnen?',
      'Neuen Unfallbericht erstellen',
      'QR oder Einladung scannen',
      'Gemeinsam',
      'Auf demselben Telefon',
      'Meine Dokumente',
      'Erst an einem sicheren Ort ausfüllen.',
    ),
    HorizonLanguage.nl: AzurCopy(
      'Hoe wilt u beginnen?',
      'Een nieuwe aangifte maken',
      'QR of uitnodiging scannen',
      'Samen',
      'Op dezelfde telefoon',
      'Mijn documenten',
      'Vul dit pas in op een veilige plek.',
    ),
  };
}
