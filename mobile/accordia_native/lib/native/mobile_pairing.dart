import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';

import 'package:cryptography/cryptography.dart';

import 'api.dart';

class MobilePairing {
  MobilePairing(this.transport, this.origin);
  final ApiTransport transport;
  final Uri origin;

  static final _opaque = RegExp(r'^[A-Za-z0-9_-]{43}$');
  static final _reportId = RegExp(r'^[A-Za-z0-9_-]{16,80}$');
  String? _verifier;
  String? _token;
  int _expiresAt = 0;

  static MobilePairing? configured(ApiTransport transport) {
    const value = String.fromEnvironment('ACCORDIA_MOBILE_GATEWAY_ORIGIN');
    final uri = Uri.tryParse(value);
    if (uri == null ||
        uri.scheme != 'https' ||
        uri.host.isEmpty ||
        uri.userInfo.isNotEmpty ||
        uri.hasQuery ||
        uri.hasFragment ||
        (uri.path.isNotEmpty && uri.path != '/')) {
      return null;
    }
    return MobilePairing(transport, uri);
  }

  Future<Uri> begin(String language) async {
    final random = Random.secure();
    final bytes = List<int>.generate(32, (_) => random.nextInt(256));
    final verifier = base64UrlEncode(bytes).replaceAll('=', '');
    final hash = await Sha256().hash(utf8.encode(verifier));
    final challenge = base64UrlEncode(hash.bytes).replaceAll('=', '');
    _verifier = verifier;
    return Uri.https(nativeApiHost, '/mobile-pairing', {
      'challenge': challenge,
      'lang': language,
    });
  }

  Future<void> exchange(String code) async {
    final verifier = _verifier;
    if (verifier == null || !_opaque.hasMatch(code)) {
      throw const NativeApiError(400, 'invalid_pairing');
    }
    final response = await _request('POST', '/v1/session', {
      'code': code,
      'verifier': verifier,
    });
    final token = response['token'];
    final expiresAt = response['expiresAt'];
    if (token is! String ||
        !_opaque.hasMatch(token) ||
        expiresAt is! int ||
        expiresAt <= DateTime.now().millisecondsSinceEpoch) {
      throw const NativeApiError(502, 'invalid_response');
    }
    _verifier = null;
    _token = token;
    _expiresAt = expiresAt;
  }

  Future<Map<String, dynamic>> reports() => _request('GET', '/v1/reports');

  Future<Map<String, dynamic>> report(String id) {
    if (!_reportId.hasMatch(id))
      throw const FormatException('Invalid report ID');
    return _request('GET', '/v1/reports/$id');
  }

  Future<void> disconnect() async {
    try {
      await _request('DELETE', '/v1/session');
    } finally {
      _token = null;
      _verifier = null;
      _expiresAt = 0;
    }
  }

  Future<Map<String, dynamic>> _request(
    String method,
    String path, [
    Map<String, String>? data,
  ]) async {
    final headers = {'Accept': 'application/json'};
    if (data == null) {
      final token = _token;
      if (token == null ||
          _expiresAt <= DateTime.now().millisecondsSinceEpoch) {
        throw const NativeApiError(401, 'authentication_required');
      }
      headers['Authorization'] = 'Bearer $token';
    } else {
      headers['Content-Type'] = 'application/json';
    }
    final reply = await transport.send(
      method,
      origin.replace(path: path),
      headers,
      data == null ? null : Uint8List.fromList(utf8.encode(jsonEncode(data))),
    );
    if (reply.status != 200 || reply.contentType != 'application/json') {
      if (reply.status == 401 && data == null) _token = null;
      throw NativeApiError(
        reply.status == 200 ? 502 : reply.status,
        'request_failed',
      );
    }
    try {
      final decoded = jsonDecode(utf8.decode(reply.bytes));
      if (decoded is Map<String, dynamic>) return decoded;
    } catch (_) {}
    throw const NativeApiError(502, 'invalid_response');
  }
}
