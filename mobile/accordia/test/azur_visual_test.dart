import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_mobile/config/mobile_config.dart';
import 'package:accordia_mobile/design/horizon/copy.dart';
import 'package:accordia_mobile/design/horizon/home.dart';
import 'package:accordia_mobile/design/horizon/theme.dart';
import 'package:accordia_mobile/app/brand.dart';

void main() {
  testWidgets('Azur home actual Flutter rendering at phone size', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(390, 920);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    final font = FontLoader('AccordiaPreview')
      ..addFont(rootBundle.load('assets/fonts/DejaVuSans.ttf'));
    await font.load();
    await (FontLoader(
      'MaterialIcons',
    )..addFont(rootBundle.load('fonts/MaterialIcons-Regular.otf'))).load();
    debugDisableShadows = false;

    await tester.pumpWidget(
      MaterialApp(
        theme: horizonTheme(MobileConfig.fallback).copyWith(
          primaryTextTheme: horizonTheme(MobileConfig.fallback).primaryTextTheme
              .apply(fontFamily: 'AccordiaPreview'),
          textTheme: horizonTheme(MobileConfig.fallback).textTheme
              .apply(fontFamily: 'AccordiaPreview'),
        ),
        home: HorizonHome(
          config: MobileConfig.fallback,
          language: HorizonLanguage.fr,
          onLanguageChanged: (_) {},
          onStart: () {},
          onJoin: () {},
          onTogether: () {},
          onDrafts: () {},
          onReports: () {},
          onAccount: () {},
          onHelp: () {},
          onSettings: () {},
          officialLogo: const AccordiaBrand(title: 'Accordia', inverted: true),
        ),
      ),
    );
    await tester.runAsync(() async {
      await precacheImage(
        const AssetImage('assets/horizon/azur-accident.webp'),
        tester.element(find.byType(HorizonHome)),
      );
    });
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    await expectLater(
      find.byType(HorizonHome),
      matchesGoldenFile('goldens/azur-phone.png'),
    );
    debugDisableShadows = true;
  });
}
