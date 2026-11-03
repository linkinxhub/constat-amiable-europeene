import 'dart:io';
import 'dart:convert';

import 'package:accordia_mobile/platform/policy.dart';

import 'package:accordia_mobile/reports/copy.dart';
import 'package:accordia_mobile/reports/store.dart';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_mobile/app/app.dart';
import 'package:accordia_mobile/app/preferences.dart';
import 'package:accordia_mobile/app/startup_sound.dart';
import 'package:accordia_mobile/app/web_actions.dart';
import 'package:accordia_mobile/config/config_repository.dart';
import 'package:accordia_mobile/config/mobile_config.dart';
import 'package:accordia_mobile/design/horizon/copy.dart';

class Config implements ConfigSource, ConfigCache {
  @override
  Future<Map<String, dynamic>> fetch() async => MobileConfig.fallback.toJson();
  @override
  Future<Map<String, dynamic>?> read() async => null;
  @override
  Future<void> write(Map<String, dynamic> value) async {}
}

class Preferences implements PreferenceStore {
  AppPreferences value = const AppPreferences();
  @override
  Future<AppPreferences> read() async => value;
  @override
  Future<void> write(AppPreferences next) async {
    value = next;
  }
}

class ChimeRecorder implements Chime {
  int plays = 0, stops = 0;
  @override
  Future<void> play() async {
    plays++;
  }

  @override
  Future<void> stop() async {
    stops++;
  }

  @override
  Future<void> dispose() async {}
}

void main() {
  test('browser routes are fixed to the real site in each language', () {
    for (final lang in HorizonLanguage.values)
      for (final action in WebAction.values) {
        final uri = websiteAction(action, lang);
        expect(uri.scheme, 'https');
        expect(uri.host, 'accordia-constat.adil-btp.chatgpt.site');
        expect(uri.queryParameters, {
          'lang': lang.name,
          if (action == WebAction.together) 'entry': 'same-device',
        });
        expect(uri.fragment, isEmpty);
      }
  });
  test('startup sound respects explicit preference, reduced motion and one cold attempt', () async {
    final recorder = ChimeRecorder(), sound = StartupSound(ChimeRecorder());
    await sound.start(
      MobileConfig.fallback,
      userPreference: false,
      reduceMotion: false,
    );
    final active = StartupSound(recorder);
    await active.start(
      MobileConfig.fallback,
      userPreference: true,
      reduceMotion: false,
    );
    await active.start(
      MobileConfig.fallback,
      userPreference: true,
      reduceMotion: false,
    );
    expect(recorder.plays, 1);
    await active.pause();
    expect(recorder.stops, 1);
    await active.dispose();
    final reduced = ChimeRecorder();
    await StartupSound(reduced)
        .start(MobileConfig.fallback, userPreference: true, reduceMotion: true);
    expect(reduced.plays, 0);
  });
  test('private preferences persist language and explicit sound refusal; corrupt data is rejected', () async {
    final dir = await Directory.systemTemp.createTemp('accordia-prefs-test-');
    addTearDown(() => dir.delete(recursive: true));
    final store = FilePreferenceStore(File('${dir.path}/prefs.json'));
    await store.write(
      const AppPreferences(language: HorizonLanguage.de, sound: false),
    );
    final restored = await store.read();
    expect(restored.language, HorizonLanguage.de);
    expect(restored.sound, false);
    await File('${dir.path}/prefs.json')
        .writeAsString('{"version":1,"language":"external","sound":true}');
    await expectLater(store.read(), throwsFormatException);
  });
  testWidgets(
    'native home keeps core actions internal and settings persist without replaying sound',
    (tester) async {
      tester.view.physicalSize = const Size(375, 850);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      final navigated = <Uri>[];
      final config = Config(),
          preferences = Preferences(),
          chime = ChimeRecorder(),
          opened = <Uri>[];
      await tester.pumpWidget(
        AccordiaApp(
          repository: ConfigRepository(source: config, cache: config),
          preferences: preferences,
          initialPreferences: const AppPreferences(),
          sound: StartupSound(chime),
          drafts: UnavailableDraftStore(),
          reportData: await ReportCopy.load(),
          platformBuilder: (uri, copy, outside) {
            navigated.add(uri);
            return Scaffold(
              appBar: AppBar(title: const Text('Platform test surface')),
              body: Text(uri.path),
            );
          },
          openWebsite: (uri) async {
            opened.add(uri);
            return true;
          },
        ),
      );
      await tester.pumpAndSettle();
      expect(chime.plays, 0);
      await tester.ensureVisible(find.text('Je commence'));
      await tester.tap(find.text('Je commence'));
      await tester.pumpAndSettle();
      expect(opened, isEmpty);
      expect(find.text('Platform test surface'), findsOneWidget);
      expect(navigated.last.path, '/constat');
      await tester.tap(find.byType(BackButton));
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('Je rejoins'));
      await tester.tap(find.text('Je rejoins'));
      await tester.pumpAndSettle();
      expect(opened, isEmpty);
      expect(find.text('Scanner un QR Accordia'), findsOneWidget);
      expect(find.text('Coller un lien Accordia'), findsOneWidget);
      await tester.tap(find.text('Coller un lien Accordia'));
      await tester.pumpAndSettle();
      await tester.enterText(
        find.byType(TextField),
        'https://evil.test/session/test#invite=bad',
      );
      await tester.tap(find.text('Ouvrir dans Accordia'));
      await tester.pumpAndSettle();
      expect(find.textContaining('Lien Accordia non reconnu'), findsOneWidget);
      const invitation =
          'https://accordia-constat.adil-btp.chatgpt.site/session/63f6ad2e-a21e-4494-aed2-ef5bfa3e0c18#invite=TEST_ONLY_TOKEN';
      await tester.enterText(find.byType(TextField), invitation);
      await tester.tap(find.text('Ouvrir dans Accordia'));
      await tester.pumpAndSettle();
      expect(navigated.last.toString(), invitation);
      expect(opened, isEmpty);
      await tester.tap(find.byType(BackButton));
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.byTooltip('Réglages'));
      await tester.tap(find.byTooltip('Réglages'));
      await tester.pumpAndSettle();
      await tester.tap(find.byType(Switch));
      await tester.pumpAndSettle();
      expect(preferences.value.sound, true);
      expect(chime.plays, 0);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'external callback is disabled and subsequent services stay internal',
    (tester) async {
      tester.view.physicalSize = const Size(375, 850);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      final config = Config(), opened = <Uri>[], views = <Uri>[];
      final data = jsonDecode(
        File('assets/copy/constat.json').readAsStringSync(),
      ) as Map<String, dynamic>;
      await tester.pumpWidget(
        AccordiaApp(
          repository: ConfigRepository(source: config, cache: config),
          preferences: Preferences(),
          initialPreferences: const AppPreferences(),
          sound: StartupSound(ChimeRecorder()),
          drafts: UnavailableDraftStore(),
          reportData: data,
          openWebsite: (uri) async {
            opened.add(uri);
            return true;
          },
          platformBuilder: (uri, copy, outside) {
            views.add(uri);
            return Scaffold(
              appBar: AppBar(title: const Text('Embedded test page')),
              body: TextButton(
                onPressed: () async {
                  await outside(restartAccordiaSignIn(uri));
                },
                child: const Text('Choose secure browser'),
              ),
            );
          },
        ),
      );
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('Je commence'));
      await tester.tap(find.text('Je commence'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Choose secure browser'));
      await tester.pumpAndSettle();
      expect(opened, isEmpty);
      await tester.tap(find.byType(BackButton));
      await tester.pumpAndSettle();
      await tester.tap(find.byIcon(Icons.person_outline));
      await tester.pumpAndSettle();
      expect(opened, isEmpty);
      expect(views.any((uri) => uri.path == '/account'), true);
      expect(tester.takeException(), isNull);
    },
  );
}
