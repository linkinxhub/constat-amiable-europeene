import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import '../config/config_repository.dart';

const nativeApiHost = 'accordia-constat.adil-btp.chatgpt.site';

class NativeApiError implements Exception {
  const NativeApiError(this.status, this.code);
  final int status;
  final String code;
  bool get needsAuthentication =>
      status == 401 || code == 'authentication_required';
  @override
  String toString() => 'NativeApiError($status, $code)';
}

class ApiReply {
  const ApiReply(this.status, this.contentType, this.bytes);
  final int status;
  final String contentType;
  final Uint8List bytes;
}

abstract interface class ApiTransport {
  Future<ApiReply> send(
    String method,
    Uri uri,
    Map<String, String> headers,
    Uint8List? body,
  );
}

/// Real HTTPS transport. No imported cookies, forged identity headers or fake login.
/// Sites SIWC currently has no supported native session handoff in this project.
/// An authenticated transport may replace this only after its server contract exists.
class HttpsNativeTransport implements ApiTransport {
  final HttpClient _client = HttpClient()
    ..connectionTimeout = const Duration(seconds: 12);
  @override
  Future<ApiReply> send(
    String method,
    Uri uri,
    Map<String, String> headers,
    Uint8List? body,
  ) async {
    final request = await _client
        .openUrl(method, uri)
        .timeout(const Duration(seconds: 15));
    request.followRedirects = false;
    headers.forEach(request.headers.set);
    if (body != null) request.add(body);
    final response = await request.close().timeout(const Duration(seconds: 25));
    final bytes = BytesBuilder(copy: false);
    var size = 0;
    await for (final chunk in response.timeout(const Duration(seconds: 25))) {
      size += chunk.length;
      if (size > 20 * 1024 * 1024) {
        throw const NativeApiError(413, 'too_large');
      }
      bytes.add(chunk);
    }
    return ApiReply(
      response.statusCode,
      response.headers.contentType?.mimeType ?? '',
      bytes.takeBytes(),
    );
  }

  void close() => _client.close(force: true);
}

class NativeApi {
  NativeApi({ApiTransport? transport})
    : transport = transport ?? HttpsNativeTransport();
  final ApiTransport transport;
  static final _id = RegExp(r'^[a-zA-Z0-9-]{1,100}$');
  static String id(String value) {
    if (!_id.hasMatch(value)) throw const FormatException('Invalid record ID');
    return value;
  }

  Future<ApiReply> _send(
    String method,
    String path, {
    Object? body,
    String accept = 'application/json',
  }) async {
    if (!path.startsWith('/api/') ||
        path.contains('://') ||
        path.contains('#') ||
        path.contains('..'))
      throw const FormatException('Invalid API path');
    final relative = Uri.parse(path);
    if (relative.pathSegments.any((part) => part == '.' || part == '..') ||
        !relative.path.startsWith('/api/'))
      throw const FormatException('Invalid API path');
    final uri = Uri.https(
      nativeApiHost,
      relative.path,
      relative.queryParameters.isEmpty ? null : relative.queryParameters,
    );
    final data = body == null
        ? null
        : Uint8List.fromList(utf8.encode(jsonEncode(body)));
    if (data != null && data.length > 8 * 1024 * 1024)
      throw const NativeApiError(413, 'too_large');
    final headers = <String, String>{'Accept': accept};
    if (data != null)
      headers.addAll({
        'Content-Type': 'application/json',
        'Origin': 'https://$nativeApiHost',
        'x-accordia-request': '1',
      });
    final response = await transport.send(method, uri, headers, data);
    if (response.status >= 300 && response.status < 400)
      throw const NativeApiError(401, 'authentication_required');
    return response;
  }

  Future<Object?> request(String method, String path, {Object? body}) async {
    final response = await _send(method, path, body: body);
    Object? decoded;
    if (response.contentType.contains('application/json')) {
      try {
        decoded = jsonDecode(utf8.decode(response.bytes));
      } catch (_) {
        throw const NativeApiError(502, 'invalid_response');
      }
    }
    if (response.status < 200 || response.status >= 300) {
      final code = decoded is Map && decoded['error'] is String
          ? decoded['error'] as String
          : 'request_failed';
      throw NativeApiError(response.status, code);
    }
    if (decoded == null)
      throw const NativeApiError(401, 'authentication_required');
    return decoded;
  }

  Future<Map<String, dynamic>> object(
    String method,
    String path, {
    Object? body,
  }) async {
    final value = await request(method, path, body: body);
    if (value is! Map) throw const NativeApiError(502, 'invalid_response');
    return value.cast<String, dynamic>();
  }

  Future<Map<String, dynamic>> account() => object('GET', '/api/account');
  Future<Map<String, dynamic>> reports() => object('GET', '/api/reports');
  Future<Map<String, dynamic>> report(String key) =>
      object('GET', '/api/reports/${id(key)}');
  Future<Map<String, dynamic>> saveReport(
    String key,
    Map<String, dynamic> report,
    int revision,
  ) => object(
    'PUT',
    '/api/reports/${id(key)}',
    body: {'report': report, 'expectedRevision': revision},
  );
  Future<Map<String, dynamic>> history(String key) =>
      object('GET', '/api/reports/${id(key)}/history');
  Future<Map<String, dynamic>> restore(
    String key,
    int revision,
    int expected,
  ) => object(
    'POST',
    '/api/reports/${id(key)}/history',
    body: {'revision': revision, 'expectedRevision': expected},
  );
  Future<Map<String, dynamic>> sessions() => object('GET', '/api/sessions');
  Future<Map<String, dynamic>> session(String key) =>
      object('GET', '/api/sessions/${id(key)}');
  Future<Map<String, dynamic>> createSession(String reportId) =>
      object('POST', '/api/sessions', body: {'reportId': id(reportId)});
  Future<Map<String, dynamic>> join(String key, String token) =>
      object('POST', '/api/sessions/${id(key)}/invite', body: {'token': token});
  Future<Map<String, dynamic>> renewInvite(String key) =>
      object('PUT', '/api/sessions/${id(key)}/invite');
  Future<Map<String, dynamic>> updateSession(
    String key,
    Map<String, dynamic> report,
    int revision, {
    bool finish = false,
  }) => object(
    'PUT',
    '/api/sessions/${id(key)}',
    body: {'report': report, 'expectedRevision': revision, 'finish': finish},
  );
  Future<Map<String, dynamic>> documents(String key) =>
      object('GET', '/api/sessions/${id(key)}/final');
  Future<Uint8List> documentPdf(String session, String document) async {
    final response = await _send(
      'GET',
      '/api/sessions/${id(session)}/final/${id(document)}/pdf',
      accept: 'application/pdf',
    );
    if (response.status != 200) {
      throw NativeApiError(response.status, 'request_failed');
    }
    if (response.contentType == 'text/html') {
      throw const NativeApiError(401, 'authentication_required');
    }
    final bytes = response.bytes;
    const signature = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
    if (response.contentType != 'application/pdf' ||
        bytes.length <= signature.length) {
      throw const NativeApiError(502, 'invalid_response');
    }
    for (var i = 0; i < signature.length; i++) {
      if (bytes[i] != signature[i]) {
        throw const NativeApiError(502, 'invalid_response');
      }
    }
    return bytes;
  }

  Future<Map<String, dynamic>> prepareDocument(
    String key,
    int revision,
    String lang, {
    String style = 'keyboard',
  }) => object(
    'POST',
    '/api/sessions/${id(key)}/final',
    body: {
      'expectedRevision': revision,
      'lang': lang,
      'style': style,
      'translate': false,
      'sketchSource': 'manual',
    },
  );
  Future<Map<String, dynamic>> feedback(Map<String, dynamic> value) =>
      object('POST', '/api/feedback', body: value);
  Future<Map<String, dynamic>> mobileSettings() =>
      object('GET', '/api/admin/mobile-settings');
  Future<Map<String, dynamic>> writeMobileSettings(
    Map<String, dynamic> command,
  ) => object('PUT', '/api/admin/mobile-settings', body: command);
}

class NativeConfigSource implements ConfigSource {
  NativeConfigSource(this.api);
  final NativeApi api;
  @override
  Future<Map<String, dynamic>> fetch() =>
      api.object('GET', '/api/mobile/config');
}
