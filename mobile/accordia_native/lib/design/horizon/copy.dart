enum HorizonLanguage { fr, en, de, nl }

class HorizonCopy {
  const HorizonCopy(
    this.headline,
    this.guidance,
    this.start,
    this.join,
    this.drafts,
    this.home,
    this.reports,
    this.account,
    this.help,
    this.language,
  );
  final String headline, guidance, start, join, drafts;
  final String home, reports, account, help, language;

  String get settings => switch (language) {
    'Langue' => 'Réglages',
    'Sprache' => 'Einstellungen',
    'Taal' => 'Instellingen',
    _ => 'Settings',
  };

  static const values = {
    HorizonLanguage.fr: HorizonCopy(
      'Votre constat,\nsimplement.',
      'Guidé, étape par étape',
      'Je commence',
      'Je rejoins',
      'Mes brouillons',
      'Accueil',
      'Constats',
      'Compte',
      'Aide',
      'Langue',
    ),
    HorizonLanguage.en: HorizonCopy(
      'Your report,\nmade simple.',
      'Guided, step by step',
      'Start my report',
      'Join',
      'My drafts',
      'Home',
      'Reports',
      'Account',
      'Help',
      'Language',
    ),
    HorizonLanguage.de: HorizonCopy(
      'Ihr Unfallbericht,\neinfach.',
      'Schritt für Schritt begleitet',
      'Unfallbericht beginnen',
      'Beitreten',
      'Meine Entwürfe',
      'Start',
      'Berichte',
      'Konto',
      'Hilfe',
      'Sprache',
    ),
    HorizonLanguage.nl: HorizonCopy(
      'Uw aangifte,\neenvoudig.',
      'Begeleid, stap voor stap',
      'Mijn aangifte starten',
      'Deelnemen',
      'Mijn concepten',
      'Start',
      'Aangiften',
      'Account',
      'Hulp',
      'Taal',
    ),
  };
}
