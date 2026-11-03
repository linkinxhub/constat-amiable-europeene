import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_native/config/mobile_config.dart';
import 'package:accordia_native/config/config_repository.dart';
import 'package:accordia_native/design/horizon/bootstrap.dart';
import 'package:accordia_native/design/horizon/intro.dart';
import 'package:accordia_native/design/horizon/copy.dart';
import 'package:accordia_native/design/horizon/splash_copy.dart';

class OfflineCache implements ConfigCache {
  @override
  Future<Map<String, dynamic>?> read() async => null;
  @override
  Future<void> write(Map<String, dynamic> value) async {}
}

class SlowSource implements ConfigSource {
  final pending = Completer<Map<String, dynamic>>();
  @override
  Future<Map<String, dynamic>> fetch() => pending.future;
}

void main() {
  for (final language in HorizonLanguage.values) {
    testWidgets('Serenity splash 320px and large text in ${language.name}', (
      tester,
    ) async {
      tester.view.physicalSize = const Size(320, 640);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      var completions = 0;
      await tester.pumpWidget(
        MaterialApp(
          home: MediaQuery(
            data: const MediaQueryData(textScaler: TextScaler.linear(1.5)),
            child: HorizonIntro(
              config: MobileConfig.fallback,
              language: language,
              onCompleted: () => completions++,
            ),
          ),
        ),
      );
      await tester.pump(const Duration(milliseconds: 400));
      expect(find.text(SplashCopy.values[language]!.tagline), findsOneWidget);
      expect(completions, 0);
      await tester.tap(find.text(SplashCopy.values[language]!.skip));
      await tester.pump();
      expect(completions, 1);
      await tester.pump(const Duration(seconds: 2));
      expect(completions, 1);
      expect(tester.takeException(), isNull);
      expect(find.byType(CircularProgressIndicator), findsNothing);
    });
  }
  testWidgets(
    'reduced motion completes without waiting; background pauses the animated scene',
    (tester) async {
      var completed = 0;
      await tester.pumpWidget(
        MaterialApp(
          home: MediaQuery(
            data: const MediaQueryData(disableAnimations: true),
            child: HorizonIntro(
              config: MobileConfig.fallback,
              onCompleted: () => completed++,
            ),
          ),
        ),
      );
      await tester.pump();
      expect(completed, 1);
      expect(tester.binding.transientCallbackCount, 0);
      await tester.pumpWidget(const SizedBox.shrink());
      completed = 0;
      await tester.pumpWidget(
        MaterialApp(
          home: HorizonIntro(
            config: MobileConfig.fallback,
            onCompleted: () => completed++,
          ),
        ),
      );
      await tester.pump(const Duration(milliseconds: 200));
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.inactive);
      await tester.pump(const Duration(seconds: 3));
      expect(completed, 0);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
      await tester.pumpAndSettle();
      expect(completed, 1);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'home opens after the local intro even if network never responds, and does not replay on resume',
    (tester) async {
      final source = SlowSource();
      var finished = 0;
      await tester.pumpWidget(
        HorizonBootstrap(
          repository: ConfigRepository(source: source, cache: OfflineCache()),
          reportInProgress: false,
          locale: const Locale('fr'),
          onIntroFinished: () => finished++,
          contentBuilder: (_, config) =>
              const Scaffold(body: Text('HOME READY')),
        ),
      );
      await tester.pump();
      expect(find.byType(HorizonIntro), findsOneWidget);
      expect(find.text('HOME READY'), findsNothing);
      await tester.pumpAndSettle();
      expect(find.text('HOME READY'), findsOneWidget);
      expect(finished, 1);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.inactive);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
      await tester.pump();
      expect(find.byType(HorizonIntro), findsNothing);
      expect(finished, 1);
      await tester.pumpWidget(const SizedBox.shrink());
      source.pending.complete(MobileConfig.fallback.toJson());
      await tester.pump();
    },
  );
}
