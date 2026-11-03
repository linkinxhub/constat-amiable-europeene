import 'copy.dart';

class SplashCopy {
  const SplashCopy(this.tagline, this.skip, this.guide);
  final String tagline, skip, guide;
  static const values = {
    HorizonLanguage.fr: SplashCopy(
      'Le constat, en toute sérénité.',
      'Passer',
      'L’animation du constat apparaît une fois au démarrage. Passer ouvre immédiatement l’accueil. Sa durée et son activation suivent les réglages publiés ; le son reste désactivable et les animations réduites sont respectées.',
    ),
    HorizonLanguage.en: SplashCopy(
      'Your report, with peace of mind.',
      'Skip',
      'The report animation appears once at startup. Skip opens the home screen immediately. Duration and activation follow published settings; sound can be disabled and reduced motion is respected.',
    ),
    HorizonLanguage.de: SplashCopy(
      'Ihr Unfallbericht, ganz in Ruhe.',
      'Überspringen',
      'Die Berichtsanimation erscheint einmal beim Start. Überspringen öffnet sofort die Startseite. Dauer und Aktivierung folgen veröffentlichten Einstellungen; Ton ist abschaltbar und reduzierte Bewegung wird berücksichtigt.',
    ),
    HorizonLanguage.nl: SplashCopy(
      'Uw aangifte, met een gerust gevoel.',
      'Overslaan',
      'De aangifteanimatie verschijnt één keer bij het starten. Overslaan opent direct het startscherm. Duur en activering volgen gepubliceerde instellingen; geluid kan uit en verminderde beweging wordt gerespecteerd.',
    ),
  };
}
