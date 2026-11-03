import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'config_repository.dart';
import 'mobile_config.dart';

const _maxConfigBytes = 4096;

/// Only calls the known presentation endpoint, with no cookies or auth headers.
/// An HTTPS redirect or a Sites sign-in page is an error, never followed.
class HttpsConfigSource implements ConfigSource {
  HttpsConfigSource({Uri? origin}) : endpoint = _endpoint(origin);
  final Uri endpoint;
  static Uri _endpoint(Uri? supplied) {
    final origin =
        supplied ?? Uri.https('accordia-constat.adil-btp.chatgpt.site');
    if (origin.scheme != 'https' ||
        origin.host != 'accordia-constat.adil-btp.chatgpt.site' ||
        origin.userInfo.isNotEmpty ||
        origin.hasQuery ||
        origin.hasFragment ||
        (origin.path.isNotEmpty && origin.path != '/') ||
        origin.port != 443) {
      throw ArgumentError('Unsupported configuration origin');
    }
    return origin.resolve('/api/mobile/config');
  }

  @override
  Future<Map<String, dynamic>> fetch() async {
    final client = HttpClient()..connectionTimeout = const Duration(seconds: 5);
    try {
      return await _fetch(client).timeout(const Duration(seconds: 5));
    } finally {
      client.close(force: true);
    }
  }

  Future<Map<String, dynamic>> _fetch(HttpClient client) async {
    final request = await client.getUrl(endpoint);
    request.followRedirects = false;
    request.headers.set(HttpHeaders.acceptHeader, 'application/json');
    final response = await request.close();
    if (response.statusCode != 200 ||
        response.headers.contentType?.mimeType != 'application/json' ||
        response.contentLength > _maxConfigBytes) {
      throw const FormatException('Configuration unavailable');
    }
    final bytes = BytesBuilder(copy: false);
    var length = 0;
    await for (final chunk in response) {
      length += chunk.length;
      if (length > _maxConfigBytes)
        throw const FormatException('Configuration too large');
      bytes.add(chunk);
    }
    final value =
        jsonDecode(utf8.decode(bytes.takeBytes(), allowMalformed: false));
    if (value is! Map<String, dynamic>)
      throw const FormatException('Invalid configuration');
    return MobileConfig.fromJson(value).toJson();
  }
}

/// Supply an app-private file (Application Support), never a shared download path.
class FileConfigCache implements ConfigCache {
  FileConfigCache(this.file);
  final File file;
  @override
  Future<Map<String, dynamic>?> read() async {
    if (!await file.exists()) return null;
    if (await file.length() > _maxConfigBytes)
      throw const FormatException('Cache too large');
    final bytes = await file
        .openRead(0, _maxConfigBytes + 1)
        .fold<List<int>>(<int>[], (buffer, chunk) => buffer..addAll(chunk));
    if (bytes.length > _maxConfigBytes)
      throw const FormatException('Cache too large');
    final value = jsonDecode(utf8.decode(bytes, allowMalformed: false));
    if (value is! Map<String, dynamic>)
      throw const FormatException('Invalid cache');
    return MobileConfig.fromJson(value).toJson();
  }

  @override
  Future<void> write(Map<String, dynamic> config) async {
    final payload = jsonEncode(MobileConfig.fromJson(config).toJson());
    if (utf8.encode(payload).length > _maxConfigBytes)
      throw const FormatException('Cache too large');
    await file.parent.create(recursive: true);
    final temp =
        File('${file.path}.${DateTime.now().microsecondsSinceEpoch}.tmp');
    try {
      await temp.writeAsString(payload, flush: true);
      await temp.rename(file.path);
    } finally {
      if (await temp.exists()) await temp.delete();
    }
  }
}
