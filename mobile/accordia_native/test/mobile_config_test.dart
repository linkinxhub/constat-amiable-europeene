import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_native/config/mobile_config.dart';

Map<String, dynamic> config(int revision) => {
  'schemaVersion': 1,
  'revision': revision,
  'title': 'Accordia',
  'primaryColor': '#064cec',
  'introEnabled': true,
  'introDurationMs': 900,
  'soundDefault': true,
};
void main() {
  test('invalid and future schemas preserve fallback', () {
    final session = ConfigSession();
    expect(session.stage({...config(1), 'schemaVersion': 2}), isFalse);
    expect(session.stage({...config(1), 'introDurationMs': 90000}), isFalse);
    expect(session.active.revision, 0);
  });
  test('revision is applied only outside an active report', () {
    final session = ConfigSession();
    expect(session.stage(config(2)), isTrue);
    expect(session.applyAtSafeBoundary(reportInProgress: true), isFalse);
    expect(session.active.revision, 0);
    expect(session.applyAtSafeBoundary(reportInProgress: false), isTrue);
    expect(session.active.revision, 2);
    expect(session.stage(config(1)), isFalse);
  });
  test('newest pending revision wins, rollback uses a new revision', () {
    final session = ConfigSession();
    session.stage(config(3));
    expect(session.stage(config(2)), isFalse);
    session.applyAtSafeBoundary(reportInProgress: false);
    expect(session.active.revision, 3);
    expect(session.stage(config(4)), isTrue);
  });
  test(
    'user and system preferences take priority over administrator default',
    () {
      final session = ConfigSession();
      session.stage(config(1));
      session.applyAtSafeBoundary(reportInProgress: false);
      bool play({
        bool cold = true,
        bool system = true,
        bool reduced = false,
        bool? preference,
      }) => session.shouldPlaySound(
        coldStart: cold,
        systemAllowsAudio: system,
        reduceMotion: reduced,
        userSoundPreference: preference,
      );
      expect(play(), isTrue);
      expect(play(preference: false), isFalse);
      expect(play(system: false), isFalse);
      expect(play(cold: false), isFalse);
      expect(play(reduced: true), isFalse);
    },
  );
}
