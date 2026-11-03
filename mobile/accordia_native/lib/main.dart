import 'dart:io';

import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';

import 'app/preferences.dart';
import 'app/startup_sound.dart';
import 'config/config_io.dart';
import 'config/config_repository.dart';
import 'reports/store.dart';
import 'reports/copy.dart';
import 'native/api.dart';
import 'native/app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  ConfigCache cache = _MemoryCache();
  PreferenceStore preferences = UnavailablePreferenceStore();
  DraftStore drafts = UnavailableDraftStore();
  try {
    final dir = await getApplicationSupportDirectory().timeout(
      const Duration(seconds: 2),
    );
    cache = FileConfigCache(File('${dir.path}/mobile-presentation-v1.json'));
    preferences = FilePreferenceStore(File('${dir.path}/preferences-v1.json'));
    final storage = Directory('${dir.path}/local-drafts');
    drafts = EncryptedDraftStore(storage, PlatformDraftKey(storage));
  } catch (_) {
    /* Fail closed: never fall back to unencrypted reports. */
  }
  AppPreferences initial = const AppPreferences();
  try {
    initial = await preferences.read().timeout(
      const Duration(milliseconds: 500),
    );
  } catch (_) {}
  final api = NativeApi(), data = await ReportCopy.load();
  runApp(
    NativeAccordiaApp(
      repository: ConfigRepository(
        source: NativeConfigSource(api),
        cache: cache,
      ),
      preferences: preferences,
      initialPreferences: initial,
      sound: StartupSound(AssetChime()),
      drafts: drafts,
      reportData: data,
      api: api,
    ),
  );
}

class _MemoryCache implements ConfigCache {
  Map<String, dynamic>? value;
  @override
  Future<Map<String, dynamic>?> read() async => value;
  @override
  Future<void> write(Map<String, dynamic> next) async {
    value = next;
  }
}
