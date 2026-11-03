import 'dart:io';

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
        expect(uri.queryParameters, {'lang': lang.name});
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
    'native home asks before browser launch and settings persist without replaying sound',
    (tester) async {
      tester.view.physicalSize = const Size(375, 850);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
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
          openWebsite: (uri) async {
            opened.add(uri);
            return true;
          },
        ),
      );
      await tester.pumpAndSettle();
      expect(chime.plays, 0);
      await tester.tap(find.text('Commencer mon constat'));
      await tester.pumpAndSettle();
      expect(opened, isEmpty);
      expect(find.text('Continuer sur le site sécurisé'), findsOneWidget);
      await tester.tap(find.text('Annuler'));
      await tester.pumpAndSettle();
      expect(opened, isEmpty);
      await tester.tap(find.text('Rejoindre'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Ouvrir Accordia'));
      await tester.pumpAndSettle();
      expect(opened.single.path, '/join');
      await tester.tap(find.byTooltip('Réglages'));
      await tester.pumpAndSettle();
      await tester.tap(find.byType(Switch));
      await tester.pumpAndSettle();
      expect(preferences.value.sound, true);
      expect(chime.plays, 0);
      expect(tester.takeException(), isNull);
    },
  );
}
