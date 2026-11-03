import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:path_provider/path_provider.dart';

import 'app/app.dart';
import 'app/preferences.dart';
import 'app/startup_sound.dart';
import 'config/config_io.dart';
import 'config/config_repository.dart';
import 'reports/copy.dart';
import 'reports/store.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  PlatformInAppWebViewController.debugLoggingSettings.enabled = false;
  if (Platform.isAndroid) {
    try {
      await InAppWebViewController.setWebContentsDebuggingEnabled(false);
    } catch (_) {}
  }
  ConfigCache cache = _VolatileConfigCache();
  PreferenceStore preferences = UnavailablePreferenceStore();
  DraftStore drafts = UnavailableDraftStore();
  try {
    final dir = await getApplicationSupportDirectory().timeout(
      const Duration(seconds: 2),
    );
    cache = FileConfigCache(File('${dir.path}/mobile-presentation-v1.json'));
    preferences = FilePreferenceStore(File('${dir.path}/preferences-v1.json'));
    final draftDirectory = Directory('${dir.path}/local-drafts');
    drafts = EncryptedDraftStore(
      draftDirectory,
      PlatformDraftKey(draftDirectory),
    );
  } catch (_) {
    /* Native UI remains usable if private storage is unavailable. */
  }
  AppPreferences initial = const AppPreferences();
  try {
    initial = await preferences.read().timeout(
      const Duration(milliseconds: 500),
    );
  } catch (_) {}
  final reportData = await ReportCopy.load();
  runApp(
    AccordiaApp(
      repository: ConfigRepository(source: HttpsConfigSource(), cache: cache),
      preferences: preferences,
      initialPreferences: initial,
      sound: StartupSound(AssetChime()),
      drafts: drafts,
      reportData: reportData,
      openWebsite: (_) async => false,
    ),
  );
}

class _VolatileConfigCache implements ConfigCache {
  Map<String, dynamic>? _value;
  @override
  Future<Map<String, dynamic>?> read() async => _value;
  @override
  Future<void> write(Map<String, dynamic> config) async {
    _value = config;
  }
}
