import '../design/horizon/copy.dart';

class PlatformCopy {
  PlatformCopy(this.language);
  final HorizonLanguage language;
  String t(String key) => _copy[key]?[language.index] ?? key;
  static const _copy = <String, List<String>>{
    'scan': [
      'Scanner une invitation',
      'Scan an invitation',
      'Einladung scannen',
      'Uitnodiging scannen',
    ],
    'paste': [
      'Coller une invitation',
      'Paste an invitation',
      'Einladung einfügen',
      'Uitnodiging plakken',
    ],
    'invalid': [
      'Invitation Accordia non reconnue.',
      'Unrecognized Accordia invitation.',
      'Unbekannte Accordia-Einladung.',
      'Onbekende Accordia-uitnodiging.',
    ],
    'camera': [
      'Caméra indisponible ou permission refusée. Vous pouvez coller le lien.',
      'Camera unavailable or denied. You can paste the link.',
      'Kamera nicht verfügbar oder abgelehnt. Link kann eingefügt werden.',
      'Camera niet beschikbaar of geweigerd. U kunt de link plakken.',
    ],
  };
}
