enum HorizonLanguage { fr, en, de, nl }

class HorizonCopy {
  const HorizonCopy(this.headline, this.guidance, this.start, this.join,
      this.drafts, this.home, this.reports, this.account, this.help, this.language);
  final String headline, guidance, start, join, drafts;
  final String home, reports, account, help, language;

  static const values = {
    HorizonLanguage.fr: HorizonCopy('Un imprévu.\nUne solution.',
      'Guidé, étape par étape', 'Commencer mon constat', 'Rejoindre',
      'Mes brouillons', 'Accueil', 'Constats', 'Compte', 'Aide', 'Langue'),
    HorizonLanguage.en: HorizonCopy('An unexpected turn.\nA clear way forward.',
      'Guided, step by step', 'Start my report', 'Join',
      'My drafts', 'Home', 'Reports', 'Account', 'Help', 'Language'),
    HorizonLanguage.de: HorizonCopy('Ein Zwischenfall.\nEine klare Lösung.',
      'Schritt für Schritt begleitet', 'Unfallbericht beginnen', 'Beitreten',
      'Meine Entwürfe', 'Start', 'Berichte', 'Konto', 'Hilfe', 'Sprache'),
    HorizonLanguage.nl: HorizonCopy('Een onverwacht moment.\nEen heldere oplossing.',
      'Begeleid, stap voor stap', 'Mijn aangifte starten', 'Deelnemen',
      'Mijn concepten', 'Start', 'Aangiften', 'Account', 'Hulp', 'Taal'),
  };
}
