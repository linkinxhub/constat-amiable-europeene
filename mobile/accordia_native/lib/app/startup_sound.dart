import 'package:audioplayers/audioplayers.dart';

import '../config/mobile_config.dart';

abstract interface class Chime {
  Future<void> play();
  Future<void> stop();
  Future<void> dispose();
}

class AssetChime implements Chime {
  final AudioPlayer _player = AudioPlayer();
  int _generation = 0;
  bool _disposed = false;
  @override
  Future<void> play() async {
    final generation = _generation;
    if (_disposed) return;
    await _player.setAudioContext(
      AudioContext(
        android: const AudioContextAndroid(
          contentType: AndroidContentType.sonification,
          usageType: AndroidUsageType.assistanceSonification,
          audioFocus: AndroidAudioFocus.none,
        ),
        iOS: AudioContextIOS(
          category: AVAudioSessionCategory.ambient,
          options: {AVAudioSessionOptions.mixWithOthers},
        ),
      ),
    );
    if (_disposed || generation != _generation) return;
    await _player.play(AssetSource('audio/startup.wav'), volume: .35);
  }

  @override
  Future<void> stop() {
    _generation++;
    return _player.stop();
  }

  @override
  Future<void> dispose() {
    _disposed = true;
    _generation++;
    return _player.dispose();
  }
}

class StartupSound {
  StartupSound(this.chime);
  final Chime chime;
  bool _attempted = false;
  int _pauseGeneration = 0;
  bool _disposed = false;
  Future<void> start(
    MobileConfig config, {
    required bool? userPreference,
    required bool reduceMotion,
  }) async {
    if (_attempted || _disposed) return;
    _attempted = true;
    if (!(userPreference ?? config.soundDefault) ||
        !config.introEnabled ||
        reduceMotion)
      return;
    final generation = _pauseGeneration;
    try {
      await chime.play();
      if (_disposed || generation != _pauseGeneration) await chime.stop();
    } catch (_) {
      // An audio or platform failure must never block starting a report.
    }
  }

  Future<void> pause() async {
    _pauseGeneration++;
    try {
      await chime.stop();
    } catch (_) {}
  }

  Future<void> dispose() async {
    _disposed = true;
    await pause();
    try {
      await chime.dispose();
    } catch (_) {}
  }
}
