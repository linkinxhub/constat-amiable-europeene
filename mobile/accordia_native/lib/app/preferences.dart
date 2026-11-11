import 'dart:convert';
import 'dart:io';

import '../design/horizon/copy.dart';

class AppPreferences {
  const AppPreferences({this.language = HorizonLanguage.fr, this.sound});
  final HorizonLanguage language;
  final bool? sound;
  Map<String, dynamic> toJson() => {
    'version': 1,
    'language': language.name,
    'sound': sound,
  };
  factory AppPreferences.fromJson(Map<String, dynamic> value) {
    if (value['version'] != 1 ||
        !HorizonLanguage.values.any((v) => v.name == value['language']) ||
        (value['sound'] != null && value['sound'] is! bool)) {
      throw const FormatException('Invalid preferences');
    }
    return AppPreferences(
      language: HorizonLanguage.values.firstWhere(
        (v) => v.name == value['language'],
      ),
      sound: value['sound'] as bool?,
    );
  }
}

abstract interface class PreferenceStore {
  Future<AppPreferences> read();
  Future<void> write(AppPreferences value);
}

class FilePreferenceStore implements PreferenceStore {
  FilePreferenceStore(this.file);
  final File file;
  Future<void> _writes = Future<void>.value();
  @override
  Future<AppPreferences> read() async {
    if (!await file.exists()) return const AppPreferences();
    if (await file.length() > 1024)
      throw const FormatException('Preferences too large');
    final bytes = await file
        .openRead(0, 1025)
        .fold<List<int>>(<int>[], (a, b) => a..addAll(b));
    if (bytes.length > 1024)
      throw const FormatException('Preferences too large');
    final value = jsonDecode(utf8.decode(bytes));
    if (value is! Map<String, dynamic>)
      throw const FormatException('Invalid preferences');
    return AppPreferences.fromJson(value);
  }

  @override
  Future<void> write(AppPreferences value) {
    final operation = _writes.then((_) async {
      await file.parent.create(recursive: true);
      final temp = File('${file.path}.tmp');
      try {
        await temp.writeAsString(jsonEncode(value.toJson()), flush: true);
        await temp.rename(file.path);
      } finally {
        if (await temp.exists()) await temp.delete();
      }
    });
    _writes = operation.catchError((Object _) {});
    return operation;
  }
}

/// Used only if the OS cannot provide private storage. Never claims persistence.
class UnavailablePreferenceStore implements PreferenceStore {
  @override
  Future<AppPreferences> read() async => const AppPreferences();
  @override
  Future<void> write(AppPreferences value) async =>
      throw const FileSystemException('Private storage unavailable');
}
