import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_mobile/config/mobile_config.dart';
import 'package:accordia_mobile/config/config_repository.dart';
import 'package:accordia_mobile/config/config_io.dart';

Map<String, dynamic> value(int revision) => {
      ...MobileConfig.fallback.toJson(),
      'revision': revision,
      'title': 'Horizon $revision',
    };

class MemoryCache implements ConfigCache {
  Map<String, dynamic>? value;
  bool broken = false;
  @override
  Future<Map<String, dynamic>?> read() async {
    if (broken) throw const FileSystemException('TEST cache unavailable');
    return value;
  }

  @override
  Future<void> write(Map<String, dynamic> data) async {
    if (broken) throw const FileSystemException('TEST cache unavailable');
    value = data;
  }
}

class Source implements ConfigSource {
  Source(this.load);
  final Future<Map<String, dynamic>> Function() load;
  int calls = 0;
  @override
  Future<Map<String, dynamic>> fetch() {
    calls++;
    return load();
  }
}

void main() {
  test(
      'valid cached presentation restores offline and invalid remote leaves it intact',
      () async {
    final cache = MemoryCache()..value = value(2);
    final source =
        Source(() async => throw const SocketException('TEST offline'));
    final repo = ConfigRepository(source: source, cache: cache);
    await repo.initialize();
    expect(repo.active.revision, 2);
    expect(await repo.refresh(), false);
    expect(repo.active.revision, 2);
  });
  test('refresh coalesces concurrent calls and applies only at a safe boundary',
      () async {
    final gate = Completer<Map<String, dynamic>>();
    final source = Source(() => gate.future), cache = MemoryCache();
    final repo = ConfigRepository(source: source, cache: cache);
    final first = repo.refresh(), second = repo.refresh();
    await Future<void>.delayed(Duration.zero);
    expect(source.calls, 1);
    gate.complete(value(3));
    expect(await first, true);
    expect(await second, true);
    expect(repo.apply(reportInProgress: true), false);
    expect(repo.active.revision, 0);
    expect(repo.apply(reportInProgress: false), true);
    expect(repo.active.revision, 3);
    await repo.pendingWrites;
    expect(cache.value?['revision'], 3);
  });
  test(
      'synchronous transport failure can be retried; broken cache never blocks valid config',
      () async {
    final source = Source(() => throw StateError('TEST synchronous failure'));
    final repo =
        ConfigRepository(source: source, cache: MemoryCache()..broken = true);
    expect(await repo.refresh(), false);
    expect(await repo.refresh(), false);
    expect(source.calls, 2);
    final healthy = ConfigRepository(
        source: Source(() async => value(4)),
        cache: MemoryCache()..broken = true);
    expect(await healthy.refresh(), true);
    expect(healthy.apply(reportInProgress: false), true);
    await healthy.pendingWrites;
    expect(healthy.active.revision, 4);
  });
  test('old and future configurations cannot replace active state', () async {
    final cache = MemoryCache()..value = value(5);
    var response = {...value(6), 'schemaVersion': 2};
    final repo =
        ConfigRepository(source: Source(() async => response), cache: cache);
    expect(await repo.refresh(), false);
    response = value(3);
    expect(await repo.refresh(), false);
    expect(repo.active.revision, 5);
  });
  test('file cache validates, strips unknown fields and replaces atomically',
      () async {
    final dir = await Directory.systemTemp.createTemp('accordia-test-');
    addTearDown(() => dir.delete(recursive: true));
    final file = File('${dir.path}/config.json'),
        cache = FileConfigCache(File('${dir.path}/config.json'));
    expect(await cache.read(), isNull);
    await cache.write({...value(2), 'token': 'must-not-survive'});
    expect((await cache.read())?['revision'], 2);
    expect(jsonDecode(await file.readAsString()).containsKey('token'), false);
    await cache.write(value(3));
    expect((await cache.read())?['revision'], 3);
    expect(await dir.list().length, 1);
    await file.writeAsString('x' * 5000);
    await expectLater(cache.read(), throwsFormatException);
  });
  test('HTTPS origin cannot be controlled by remote configuration', () {
    expect(HttpsConfigSource().endpoint.toString(),
        'https://accordia-constat.adil-btp.chatgpt.site/api/mobile/config');
    for (final uri in [
      'http://accordia-constat.adil-btp.chatgpt.site',
      'https://external.invalid',
      'https://user@accordia-constat.adil-btp.chatgpt.site',
      'https://accordia-constat.adil-btp.chatgpt.site?token=x',
      'https://accordia-constat.adil-btp.chatgpt.site:444'
    ]) {
      expect(
          () => HttpsConfigSource(origin: Uri.parse(uri)), throwsArgumentError);
    }
  });
}
