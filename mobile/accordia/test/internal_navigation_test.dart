import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_mobile/platform/policy.dart';

void main() {
  test('embedded navigation permits exact identity origins, denies lookalikes and unsafe schemes', () {
    for (final host in [
      'auth.openai.com',
      'chatgpt.com',
      'accounts.google.com',
      'login.microsoftonline.com',
      'login.live.com',
      'appleid.apple.com',
    ]) {
      expect(canNavigateInside(Uri.https(host, '/authorize')), true);
    }
    for (final value in [
      'https://auth.openai.com.evil.test',
      'http://$accordiaHost',
      'https://$accordiaHost:444',
      'intent://open',
      'javascript:alert(1)',
      'file:///secret',
      'tel:112',
      'mailto:test@example.test',
      'https://user:pass@$accordiaHost',
    ]) {
      expect(canNavigateInside(Uri.parse(value)), false);
      expect(
        canNavigateInside(Uri.parse(value), externalContent: true),
        value.startsWith('https://auth.openai.com.evil.test'),
      );
    }
    expect(canNavigateInside(Uri.https('insurance.example', '/help')), false);
    expect(
      canNavigateInside(
        Uri.https('insurance.example', '/help'),
        externalContent: true,
      ),
      true,
    );
    expect(embeddedService(Uri.https('accounts.google.com', '/')), 'Google');
    expect(embeddedService(Uri.https('unknown.example', '/')), isEmpty);
  });
  test('same-phone preset survives restarting sign-in without exporting invitation tokens', () {
    final uri = restartAccordiaSignIn(
      Uri.https(accordiaHost, '/constat', {
        'entry': 'same-device',
        'lang': 'nl',
      }).replace(fragment: 'invite=TEST_ONLY'),
    );
    final target = Uri.parse(uri.queryParameters['return_to']!);
    expect(target.queryParameters, {'entry': 'same-device', 'lang': 'nl'});
    expect(target.fragment, isEmpty);
    expect(uri.toString(), isNot(contains('TEST_ONLY')));
  });
}
