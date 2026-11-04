import 'dart:convert';

import 'package:flutter/services.dart';

import '../design/horizon/copy.dart';

class ReportCopy {
  ReportCopy(this.data, this.language);
  final Map<String, dynamic> data;
  final HorizonLanguage language;
  static Future<Map<String, dynamic>> load() async =>
      jsonDecode(await rootBundle.loadString('assets/copy/constat.json'))
          as Map<String, dynamic>;
  Map<String, dynamic> get dict =>
      (data['dictionaries'][language.name] as Map).cast<String, dynamic>();
  String text(String key) => dict[key]?.toString() ?? key;
  String extra(String key) =>
      data['extraLabels'][language.name][key]?.toString() ?? text(key);
  String finalText(String key) =>
      data['finalCopy'][language.name][key]?.toString() ?? text(key);
  List<String> get standard =>
      (data['standardCircumstances'][language.name] as List).cast<String>();
  Map<String, String> get kinds =>
      (data['vehicleKindCopy'][language.name]['types'] as Map)
          .cast<String, String>();
  List<String> get steps => [
    for (final i in [0, 1, 2]) dict['steps'][i] as String,
    text('sketch'),
    dict['steps'][4] as String,
  ];
  String n(String key) => native[language]![key]!;
  static const native = {
    HorizonLanguage.fr: {
      'local':
          'Préparation locale sur cet appareil — non signée, non synchronisée.',
      'safe': 'Je suis à l’abri et je peux remplir le constat sans danger.',
      'delete': 'Supprimer le brouillon',
      'deleteConfirm': 'Supprimer ce brouillon de cet appareil ?',
      'encrypted': 'Brouillons enregistrés sur cet appareil.',
      'unreadable': 'Certains brouillons ne peuvent pas être ouverts. Ils sont conservés.',
      'secureError': 'Le stockage sécurisé est indisponible. Vos données ne sont pas enregistrées en clair.',
      'pdf': 'Aperçu PDF interne',
      'unsigned': 'PRÉPARATION À RELIRE — NON SIGNÉE',
      'annex': 'Texte intégral en annexe',
      'account': 'La connexion mobile et les invitations ne sont pas encore configurées. Aucun compte ou accord n’est simulé.',
      'rescue': 'Secours web',
      'rescueHelp': 'Uniquement si vous êtes bloqué : ouvrir volontairement le site sécurisé. Les brouillons de cet appareil ne seront pas transférés.',
      'leave': 'Quitter sans enregistrer ?',
      'stay': 'Rester',
      'leaveYes': 'Quitter',
      'help': 'Dans l’application : confirmez la sécurité, renseignez la situation et les véhicules A/B, vérifiez les circonstances, enregistrez un brouillon ou ouvrez le PDF à relire. Le document est une préparation locale, sans signature ni envoi à un assureur.',
      'later': 'Le croquis manuel est disponible. Photos et signatures restent à ajouter dans ce parcours natif.',
      'trailerConflict': 'Les données de remorque sont conservées. Vérifiez le type de véhicule choisi.',
      'saved': 'Brouillon enregistré sur cet appareil.',
    },
    HorizonLanguage.en: {
      'local': 'Local preparation on this device — unsigned, not synced.',
      'safe':
          'I am in a safe place and can complete the report without danger.',
      'delete': 'Delete draft',
      'deleteConfirm': 'Delete this draft from this device?',
      'encrypted': 'Drafts saved on this device.',
      'unreadable': 'Some drafts cannot be opened. They are preserved.',
      'secureError': 'Secure storage is unavailable. Your data is not saved as plain text.',
      'pdf': 'In-app PDF preview',
      'unsigned': 'PREPARATION FOR REVIEW — UNSIGNED',
      'annex': 'Full text in appendix',
      'account': 'Mobile sign-in and invitations are not configured yet. No account or agreement is simulated.',
      'rescue': 'Website fallback',
      'rescueHelp': 'Only if you are blocked: voluntarily open the secure website. Drafts on this device will not be transferred.',
      'leave': 'Leave without saving?',
      'stay': 'Stay',
      'leaveYes': 'Leave',
      'help': 'In the app: confirm safety, enter the situation and vehicles A/B, review circumstances, save a draft or open the PDF for review. This is a local preparation without signatures or insurer submission.',
      'later': 'Manual sketching is available. Photos and signatures are still pending in this native flow.',
      'trailerConflict':
          'Trailer details are retained. Check the chosen vehicle type.',
      'saved': 'Draft saved on this device.',
    },
    HorizonLanguage.de: {
      'local': 'Lokale Vorbereitung auf diesem Gerät — ohne Unterschrift, nicht synchronisiert.',
      'safe': 'Ich bin in Sicherheit und kann den Bericht gefahrlos ausfüllen.',
      'delete': 'Entwurf löschen',
      'deleteConfirm': 'Diesen Entwurf von diesem Gerät löschen?',
      'encrypted': 'Auf diesem Gerät gespeicherte Entwürfe.',
      'unreadable':
          'Einige Entwürfe können nicht geöffnet werden. Sie bleiben erhalten.',
      'secureError': 'Sicherer Speicher nicht verfügbar. Ihre Daten werden nicht im Klartext gespeichert.',
      'pdf': 'PDF-Vorschau in der App',
      'unsigned': 'VORBEREITUNG ZUR PRÜFUNG — NICHT UNTERSCHRIEBEN',
      'annex': 'Vollständiger Text im Anhang',
      'account': 'Mobile Anmeldung und Einladungen sind noch nicht eingerichtet. Kein Konto oder Einverständnis wird simuliert.',
      'rescue': 'Website als Ausweichlösung',
      'rescueHelp': 'Nur wenn Sie nicht weiterkommen: sichere Website bewusst öffnen. Entwürfe dieses Geräts werden nicht übertragen.',
      'leave': 'Ohne Speichern verlassen?',
      'stay': 'Bleiben',
      'leaveYes': 'Verlassen',
      'help': 'In der App: Sicherheit bestätigen, Situation und Fahrzeuge A/B ausfüllen, Umstände prüfen, Entwurf speichern oder PDF zur Prüfung öffnen. Lokale Vorbereitung ohne Unterschrift oder Versicherungsversand.',
      'later': 'Manuelles Zeichnen ist verfügbar. Fotos und Unterschriften folgen in diesem nativen Ablauf später.',
      'trailerConflict': 'Anhängerdaten bleiben erhalten. Prüfen Sie die gewählte Fahrzeugart.',
      'saved': 'Entwurf auf diesem Gerät gespeichert.',
    },
    HorizonLanguage.nl: {
      'local': 'Lokale voorbereiding op dit apparaat — niet ondertekend of gesynchroniseerd.',
      'safe': 'Ik ben op een veilige plaats en kan het formulier zonder gevaar invullen.',
      'delete': 'Concept verwijderen',
      'deleteConfirm': 'Dit concept van dit apparaat verwijderen?',
      'encrypted': 'Concepten op dit apparaat opgeslagen.',
      'unreadable':
          'Sommige concepten kunnen niet worden geopend. Ze blijven bewaard.',
      'secureError': 'Beveiligde opslag niet beschikbaar. Uw gegevens worden niet als gewone tekst opgeslagen.',
      'pdf': 'PDF-voorbeeld in de app',
      'unsigned': 'VOORBEREIDING TER CONTROLE — NIET ONDERTEKEND',
      'annex': 'Volledige tekst in bijlage',
      'account': 'Mobiel aanmelden en uitnodigingen zijn nog niet ingesteld. Er wordt geen account of akkoord gesimuleerd.',
      'rescue': 'Website als noodoplossing',
      'rescueHelp': 'Alleen als u vastloopt: de beveiligde website bewust openen. Concepten op dit apparaat worden niet overgedragen.',
      'leave': 'Verlaten zonder opslaan?',
      'stay': 'Blijven',
      'leaveYes': 'Verlaten',
      'help': 'In de app: veiligheid bevestigen, situatie en voertuigen A/B invullen, omstandigheden controleren, concept opslaan of PDF ter controle openen. Lokale voorbereiding zonder handtekeningen of verzending aan een verzekeraar.',
      'later': 'Handmatig tekenen is beschikbaar. Foto’s en handtekeningen volgen later in deze native werkwijze.',
      'trailerConflict': 'Aanhangergegevens blijven bewaard. Controleer het gekozen voertuigtype.',
      'saved': 'Concept op dit apparaat opgeslagen.',
    },
  };
}
