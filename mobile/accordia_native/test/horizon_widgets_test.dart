import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_native/config/mobile_config.dart';
import 'package:accordia_native/design/horizon/copy.dart';
import 'package:accordia_native/design/horizon/home.dart';
import 'package:accordia_native/design/horizon/azur_copy.dart';
import 'package:accordia_native/design/horizon/intro.dart';
import 'package:accordia_native/design/horizon/theme.dart';

void main() {
  for (final language in HorizonLanguage.values) {
    testWidgets('Horizon actions and enlarged text: ${language.name}', (
      tester,
    ) async {
      tester.view.physicalSize = const Size(320, 740);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      final actions = <String>[];
      final copy = HorizonCopy.values[language]!;
      await tester.pumpWidget(
        MaterialApp(
          theme: horizonTheme(MobileConfig.fallback),
          home: MediaQuery(
            data: const MediaQueryData(textScaler: TextScaler.linear(1.5)),
            child: HorizonHome(
              config: MobileConfig.fallback,
              language: language,
              onLanguageChanged: (_) => actions.add('language'),
              onStart: () => actions.add('start'),
              onJoin: () => actions.add('join'),
              onTogether: () => actions.add('together'),
              onDrafts: () => actions.add('drafts'),
              onReports: () => actions.add('reports'),
              onAccount: () => actions.add('account'),
              onHelp: () => actions.add('help'),
            ),
          ),
        ),
      );
      expect(find.text(copy.headline), findsOneWidget);
      for (final label in [
        copy.start,
        copy.join,
        AzurCopy.values[language]!.together,
        copy.drafts,
      ]) {
        await tester.ensureVisible(find.text(label));
        await tester.tap(find.text(label));
        await tester.pump();
      }
      expect(actions, ['start', 'join', 'together', 'drafts']);
      await tester.tap(find.text(copy.reports));
      await tester.tap(find.text(copy.account));
      expect(actions, [
        'start',
        'join',
        'together',
        'drafts',
        'reports',
        'account',
      ]);
      expect(tester.takeException(), isNull);
    });
  }
  testWidgets(
    'introduction respects reduced motion and injected official mark',
    (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: MediaQuery(
            data: MediaQueryData(disableAnimations: true),
            child: HorizonIntro(
              config: MobileConfig.fallback,
              officialLogo: Text('TEST OFFICIAL ASSET SLOT'),
            ),
          ),
        ),
      );
      expect(find.text('TEST OFFICIAL ASSET SLOT'), findsOneWidget);
      await tester.pump();
      expect(tester.binding.transientCallbackCount, 0);
      expect(tester.takeException(), isNull);
    },
  );
}
