/// Public presentation only. Never contains tokens, roles or entitlement grants.
class MobileConfig {
  const MobileConfig({
    required this.revision,
    required this.title,
    required this.primaryColor,
    this.designId = 'horizon',
    required this.introEnabled,
    required this.introDurationMs,
    required this.soundDefault,
  });

  final int revision;
  final String title;
  final int primaryColor;
  final String designId;
  final bool introEnabled;
  final int introDurationMs;
  final bool soundDefault;

  static const fallback = MobileConfig(
    revision: 0,
    title: 'Accordia',
    primaryColor: 0xff064cec,
    introEnabled: true,
    introDurationMs: 900,
    soundDefault: false,
  );

  Map<String, dynamic> toJson() => {
    'schemaVersion': 1,
    'revision': revision,
    'title': title,
    'primaryColor':
        '#${(primaryColor & 0xffffff).toRadixString(16).padLeft(6, '0')}',
    'designId': designId,
    'introEnabled': introEnabled,
    'introDurationMs': introDurationMs,
    'soundDefault': soundDefault,
  };

  factory MobileConfig.fromJson(Map<String, dynamic> json) {
    if (json['schemaVersion'] != 1) {
      throw const FormatException('Unsupported configuration schema');
    }
    final design = json['designId'] ?? 'horizon';
    final revision = json['revision'];
    final title = json['title'];
    final color = json['primaryColor'];
    final intro = json['introEnabled'];
    final duration = json['introDurationMs'];
    final sound = json['soundDefault'];
    if (revision is! int ||
        revision < 0 ||
        !['horizon', 'signature', 'minimal', 'premium'].contains(design) ||
        title is! String ||
        title.trim().isEmpty ||
        title.length > 80 ||
        color is! String ||
        !RegExp(r'^#[0-9a-fA-F]{6}$').hasMatch(color) ||
        intro is! bool ||
        duration is! int ||
        duration < 0 ||
        duration > 1500 ||
        sound is! bool) {
      throw const FormatException('Invalid presentation configuration');
    }
    return MobileConfig(
      revision: revision,
      title: title.trim(),
      designId: design as String,
      primaryColor: 0xff000000 | int.parse(color.substring(1), radix: 16),
      introEnabled: intro,
      introDurationMs: duration,
      soundDefault: sound,
    );
  }
}

/// Applying a revision is deferred until a safe boundary in the user journey.
/// A rollback must be published by the server as a NEW, higher revision.
class ConfigSession {
  ConfigSession({MobileConfig? cached})
    : active = cached ?? MobileConfig.fallback;
  MobileConfig active;
  MobileConfig? _pending;

  bool stage(Map<String, dynamic> json) {
    try {
      final candidate = MobileConfig.fromJson(json);
      if (candidate.revision <= active.revision ||
          candidate.revision <= (_pending?.revision ?? 0))
        return false;
      _pending = candidate;
      return true;
    } on FormatException {
      return false;
    }
  }

  bool applyAtSafeBoundary({required bool reportInProgress}) {
    if (reportInProgress || _pending == null) return false;
    active = _pending!;
    _pending = null;
    return true;
  }

  bool shouldPlaySound({
    required bool coldStart,
    required bool systemAllowsAudio,
    required bool reduceMotion,
    bool? userSoundPreference,
  }) =>
      coldStart &&
      systemAllowsAudio &&
      !reduceMotion &&
      active.introEnabled &&
      (userSoundPreference ?? active.soundDefault);
}
