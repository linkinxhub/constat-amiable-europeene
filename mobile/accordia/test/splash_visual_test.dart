import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_mobile/config/mobile_config.dart';
import 'package:accordia_mobile/design/horizon/intro.dart';
import 'package:accordia_mobile/design/horizon/theme.dart';

void main() {
  testWidgets('Serenity splash real motion and final composition', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await (FontLoader(
      'SplashPreview',
    )..addFont(rootBundle.load('assets/fonts/DejaVuSans.ttf'))).load();
    debugDisableShadows = false;
    await tester.pumpWidget(
      MaterialApp(
        theme: horizonTheme(MobileConfig.fallback).copyWith(
          textTheme: horizonTheme(MobileConfig.fallback).textTheme
              .apply(fontFamily: 'SplashPreview'),
        ),
        home: const HorizonIntro(config: MobileConfig.fallback),
      ),
    );
    await tester.runAsync(() async {
      await precacheImage(
        const AssetImage('assets/horizon/azur-accident.webp'),
        tester.element(find.byType(HorizonIntro)),
      );
      await precacheImage(
        const AssetImage('assets/brand/shield-relief.png'),
        tester.element(find.byType(HorizonIntro)),
      );
    });
    await tester.pump(const Duration(milliseconds: 400));
    await expectLater(
      find.byType(HorizonIntro),
      matchesGoldenFile('goldens/serenity-motion.png'),
    );
    await tester.pump(const Duration(milliseconds: 550));
    await expectLater(
      find.byType(HorizonIntro),
      matchesGoldenFile('goldens/serenity-final.png'),
    );
    debugDisableShadows = true;
    expect(tester.takeException(), isNull);
  });
}
