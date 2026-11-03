import 'dart:async';

import 'mobile_config.dart';

abstract interface class ConfigSource {
  Future<Map<String, dynamic>> fetch();
}

abstract interface class ConfigCache {
  Future<Map<String, dynamic>?> read();
  Future<void> write(Map<String, dynamic> config);
}

/// Cache holds public presentation only, never reports, roles or credentials.
/// The caller chooses a safe boundary for apply(); refresh never changes a form.
class ConfigRepository {
  ConfigRepository({required this.source, required this.cache});
  final ConfigSource source;
  final ConfigCache cache;
  ConfigSession _session = ConfigSession();
  Future<bool>? _refreshing;
  Future<void>? _initialization;
  Future<void> _writes = Future<void>.value();
  Future<void> get pendingWrites => _writes;
  MobileConfig get active => _session.active;

  Future<void> initialize() => _initialization ??= _initialize();

  Future<void> _initialize() async {
    try {
      final data = await cache.read().timeout(
        const Duration(milliseconds: 500),
      );
      if (data != null)
        _session = ConfigSession(cached: MobileConfig.fromJson(data));
    } catch (_) {
      // Missing, corrupt or inaccessible cache must not block the user.
    }
  }

  Future<bool> refresh() {
    final pending = _refreshing;
    if (pending != null) return pending;
    final future = _refresh();
    _refreshing = future;
    future.then((_) {
      if (identical(_refreshing, future)) _refreshing = null;
    });
    return future;
  }

  Future<bool> _refresh() async {
    try {
      await initialize();
      final data = await source.fetch().timeout(const Duration(seconds: 5));
      return _session.stage(data);
    } catch (_) {
      // Offline, unauthorized Sites gateway, malformed and future schemas all
      // preserve the last known valid configuration. No fabricated auth headers.
      return false;
    }
  }

  bool apply({required bool reportInProgress}) {
    if (!_session.applyAtSafeBoundary(reportInProgress: reportInProgress))
      return false;
    final snapshot = active.toJson();
    _writes = _writes.then((_) => cache.write(snapshot)).catchError((Object _) {
      // Presentation is valid in memory even if the device storage is full.
    });
    return true;
  }
}
