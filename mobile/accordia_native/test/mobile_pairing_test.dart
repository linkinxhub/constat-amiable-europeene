import 'dart:convert';
import 'dart:typed_data';

import 'package:accordia_native/native/api.dart';
import 'package:accordia_native/native/mobile_pairing.dart';
import 'package:cryptography/cryptography.dart';
import 'package:flutter_test/flutter_test.dart';

class PairingTransport implements ApiTransport {
  String? verifier;
  String? bearer;
  final token = List.filled(43, 't').join();

  @override
  Future<ApiReply> send(
    String method,
    Uri uri,
    Map<String, String> headers,
    Uint8List? body,
  ) async {
    expect(uri.origin, 'https://gateway.example');
    Map<String, dynamic> value;
    if (method == 'POST') {
      expect(uri.path, '/v1/session');
      expect(headers['Authorization'], isNull);
      verifier = (jsonDecode(utf8.decode(body!)) as Map)['verifier'] as String;
      value = {
        'token': token,
        'expiresAt': DateTime.now().millisecondsSinceEpoch + 60000,
      };
    } else {
      bearer = headers['Authorization'];
      expect(bearer, 'Bearer $token');
      value = method == 'DELETE' ? {'revoked': true} : {'reports': []};
    }
    return ApiReply(
      200,
      'application/json',
      Uint8List.fromList(utf8.encode(jsonEncode(value))),
    );
  }
}

void main() {
  test(
    'requires both HTTPS origins and rejects embedded credentials or paths',
    () {
      final transport = PairingTransport();
      for (final site in [
        '',
        'http://preview.example',
        'https://user@preview.example',
        'https://preview.example/path',
      ]) {
        expect(
          MobilePairing.fromOrigins(
            transport,
            gateway: 'https://gateway.example',
            site: site,
          ),
          isNull,
        );
      }
    },
  );

  test('links browser confirmation to the mobile verifier and clears session on exit', () async {
    final transport = PairingTransport();
    final client = MobilePairing(
      transport,
      Uri.parse('https://gateway.example'),
      siteOrigin: Uri.parse('https://preview.example'),
    );
    await expectLater(client.reports(), throwsA(isA<NativeApiError>()));
    final url = await client.begin('fr');
    expect(url.host, 'preview.example');
    expect(url.path, '/mobile-pairing');
    await client.exchange(List.filled(43, 'c').join());
    final hash = await Sha256().hash(utf8.encode(transport.verifier!));
    expect(
      url.queryParameters['challenge'],
      base64UrlEncode(hash.bytes).replaceAll('=', ''),
    );
    expect(url.toString(), isNot(contains(transport.verifier!)));
    expect(await client.reports(), {'reports': []});
    await client.disconnect();
    await expectLater(client.reports(), throwsA(isA<NativeApiError>()));
  });
}
