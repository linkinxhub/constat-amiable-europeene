import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:cryptography/cryptography.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'model.dart';

abstract interface class DraftKey {
  Future<SecretKey> read();
}

class PlatformDraftKey implements DraftKey {
  PlatformDraftKey(this.directory);
  final Directory directory;
  final FlutterSecureStorage storage = const FlutterSecureStorage();
  Future<SecretKey>? _key;
  @override
  Future<SecretKey> read() {
    if (_key != null) return _key!;
    final task = _load();
    _key = task;
    task.then<void>(
      (_) {},
      onError: (Object _, StackTrace __) {
        if (identical(_key, task)) _key = null;
      },
    );
    return task;
  }

  Future<SecretKey> _load() async {
    final encoded = await storage.read(key: 'accordia.local-drafts.aes256.v1');
    if (encoded != null) {
      final b = base64Decode(encoded);
      if (b.length != 32) throw const FormatException('Invalid key');
      return SecretKey(b);
    }
    if (await directory.exists() &&
        await directory.list().any((e) => e.path.endsWith('.enc')))
      throw StateError('Draft key unavailable; original files preserved');
    final key = await AesGcm.with256bits().newSecretKey();
    await storage.write(
      key: 'accordia.local-drafts.aes256.v1',
      value: base64Encode(await key.extractBytes()),
    );
    return key;
  }
}

class LocalDraft {
  LocalDraft(this.report, this.revision);
  final Map<String, dynamic> report;
  final int revision;
  String get id => report['id'] as String;
}

class DraftListing {
  DraftListing(this.items, this.unreadable);
  final List<LocalDraft> items;
  final int unreadable;
}

abstract interface class DraftStore {
  Future<DraftListing> list();
  Future<LocalDraft> save(
    Map<String, dynamic> report, {
    required int expectedRevision,
  });
  Future<void> delete(String id, {required int expectedRevision});
}

class EncryptedDraftStore implements DraftStore {
  EncryptedDraftStore(this.directory, this.key);
  final Directory directory;
  final DraftKey key;
  final _cipher = AesGcm.with256bits();
  Future<void> _queue = Future.value();
  static const maxPlain = 8 * 1024 * 1024;
  File _file(String id) {
    if (!RegExp(r'^[a-f0-9-]{36}$').hasMatch(id))
      throw const FormatException('Invalid ID');
    return File('${directory.path}/$id.enc');
  }

  Future<T> _serial<T>(Future<T> Function() run) {
    final work = _queue.then((_) => run());
    _queue = work.then<void>((_) {}, onError: (Object _, StackTrace __) {});
    return work;
  }

  Future<LocalDraft> _read(File file) async {
    if (await file.length() > 12 * 1024 * 1024)
      throw const FormatException('Draft too large');
    final wrapper =
        jsonDecode(await file.readAsString()) as Map<String, dynamic>;
    if (wrapper['version'] != 1)
      throw const FormatException('Unknown draft version');
    final id = file.uri.pathSegments.last.replaceAll('.enc', '');
    final box = SecretBox(
      base64Decode(wrapper['ciphertext'] as String),
      nonce: base64Decode(wrapper['nonce'] as String),
      mac: Mac(base64Decode(wrapper['mac'] as String)),
    );
    final plain = await _cipher.decrypt(
      box,
      secretKey: await key.read(),
      aad: utf8.encode('accordia:local-draft:v1:$id'),
    );
    if (plain.length > maxPlain) throw const FormatException('Draft too large');
    final payload = jsonDecode(utf8.decode(plain)) as Map<String, dynamic>;
    final report = payload['report'] as Map<String, dynamic>;
    validateReportShape(report);
    if (report['id'] != id ||
        payload['revision'] is! int ||
        (payload['revision'] as int) < 1)
      throw const FormatException('Invalid draft');
    return LocalDraft(report, payload['revision'] as int);
  }

  @override
  Future<DraftListing> list() => _serial(() async {
    if (!await directory.exists()) return DraftListing([], 0);
    final files = await directory
        .list()
        .where((e) => e is File && e.path.endsWith('.enc'))
        .take(51)
        .cast<File>()
        .toList();
    final items = <LocalDraft>[];
    var failures = 0;
    for (final file in files) {
      try {
        items.add(await _read(file));
      } catch (_) {
        failures++;
      }
    }
    items.sort(
      (a, b) => (b.report['updated'] as String).compareTo(
        a.report['updated'] as String,
      ),
    );
    return DraftListing(items, failures);
  });
  @override
  Future<LocalDraft> save(
    Map<String, dynamic> report, {
    required int expectedRevision,
  }) {
    final snapshot = cloneReport(report);
    validateReportShape(snapshot);
    return _serial(() async {
      final file = _file(snapshot['id'] as String);
      if (await file.exists()) {
        if ((await _read(file)).revision != expectedRevision)
          throw StateError('Draft changed');
      } else {
        if (expectedRevision != 0) throw StateError('Draft no longer exists');
        if (await directory.exists() &&
            await directory
                    .list()
                    .where((e) => e.path.endsWith('.enc'))
                    .length >=
                50)
          throw StateError('Draft limit reached');
      }
      snapshot['updated'] = DateTime.now().toUtc().toIso8601String();
      final revision = expectedRevision + 1,
          bytes = utf8.encode(
            jsonEncode({'revision': revision, 'report': snapshot}),
          );
      if (bytes.length > maxPlain)
        throw const FormatException('Draft too large');
      final box = await _cipher.encrypt(
        bytes,
        secretKey: await key.read(),
        aad: utf8.encode('accordia:local-draft:v1:${snapshot['id']}'),
      );
      await directory.create(recursive: true);
      final temp = File('${file.path}.tmp');
      try {
        await temp.writeAsString(
          jsonEncode({
            'version': 1,
            'nonce': base64Encode(box.nonce),
            'mac': base64Encode(box.mac.bytes),
            'ciphertext': base64Encode(box.cipherText),
          }),
          flush: true,
        );
        await temp.rename(file.path);
      } finally {
        if (await temp.exists()) await temp.delete();
      }
      return LocalDraft(cloneReport(snapshot), revision);
    });
  }

  @override
  Future<void> delete(String id, {required int expectedRevision}) =>
      _serial(() async {
        final file = _file(id);
        if ((await _read(file)).revision != expectedRevision)
          throw StateError('Draft changed');
        await file.delete();
      });
}

class UnavailableDraftStore implements DraftStore {
  @override
  Future<DraftListing> list() async =>
      throw StateError('Secure storage unavailable');
  @override
  Future<LocalDraft> save(
    Map<String, dynamic> report, {
    required int expectedRevision,
  }) async => throw StateError('Secure storage unavailable');
  @override
  Future<void> delete(String id, {required int expectedRevision}) async =>
      throw StateError('Secure storage unavailable');
}
