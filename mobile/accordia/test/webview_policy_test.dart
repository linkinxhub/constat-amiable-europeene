import 'package:flutter_test/flutter_test.dart';
import 'package:accordia_mobile/platform/policy.dart';
import 'package:accordia_mobile/platform/copy.dart';
import 'package:accordia_mobile/design/horizon/copy.dart';

void main() {
  test('scanned collaboration links preserve the complete invitation without increasing access', () {
    const value =
        'https://$accordiaHost/session/63f6ad2e-a21e-4494-aed2-ef5bfa3e0c18?lang=de#invite=TEST_ONLY_TOKEN';
    final uri = scannedAccordia(value)!;
    expect(uri.toString(), value);
    expect(uri.fragment, 'invite=TEST_ONLY_TOKEN');
    expect(scannedAccordia('https://$accordiaHost/join'), isNotNull);
    expect(
      scannedAccordia(
        'https://$accordiaHost/session/63f6ad2e-a21e-4494-aed2-ef5bfa3e0c18?document=TEST_ONLY',
      ),
      isNotNull,
    );
  });
  test('scans refuse external origins, unsafe schemes, user-info and invalid destinations', () {
    for (final value in [
      'http://$accordiaHost/join',
      'https://$accordiaHost.evil.test/join',
      'https://$accordiaHost@evil.test/join',
      'https://evil@$accordiaHost/join',
      'https://$accordiaHost:444/join',
      'javascript:alert(1)',
      'file:///session/x',
      'https://$accordiaHost/admin',
      'https://$accordiaHost/session/x\n#invite=y',
      'https://$accordiaHost/api/reports',
      'https://$accordiaHost/callback',
    ])
      expect(scannedAccordia(value), isNull, reason: value);
  });
  test('PDF extraction and permissions remain restricted to the platform even on auth pages', () {
    expect(
      isAccordiaBlob(Uri.parse('blob:https://$accordiaHost/TEST_ONLY')),
      true,
    );
    expect(isAccordiaBlob(Uri.parse('blob:https://evil.test/x')), false);
    expect(isAccordia(Uri.parse('https://chatgpt.com')), false);
    expect(isTrustedAuthentication(Uri.parse('https://chatgpt.com')), true);
    expect(
      isTrustedAuthentication(Uri.parse('https://chatgpt.com.evil.test')),
      false,
    );
    for (final link in [
      'intent://x',
      'data:text/html,x',
      'file:///x',
      'http://example.com',
    ])
      expect(canOpenOutside(Uri.parse(link)), false);
  });
  test('WebView and A/B help cover all four supported languages', () {
    for (final lang in HorizonLanguage.values) {
      final copy = PlatformCopy(lang);
      for (final key in PlatformCopy.values[HorizonLanguage.fr]!.keys)
        expect(copy.t(key), isNotEmpty);
      expect(copy.t('help'), contains('#invite='));
    }
  });
  test('login restart initializes the real site flow without forwarding invitation or foreign parameters', () {
    final original = Uri.parse(
      'https://$accordiaHost/session/63f6ad2e-a21e-4494-aed2-ef5bfa3e0c18?lang=de&client_id=FAKE&access_token=SECRET#invite=TEST_ONLY',
    );
    final restart = restartAccordiaSignIn(original);
    expect(restart.host, accordiaHost);
    expect(restart.path, '/signin-with-chatgpt');
    expect(
      restart.queryParameters['return_to'],
      '/session/63f6ad2e-a21e-4494-aed2-ef5bfa3e0c18?lang=de',
    );
    for (final secret in ['TEST_ONLY', 'SECRET', 'FAKE', 'invite='])
      expect(restart.toString().contains(secret), false);
    expect(
      restartAccordiaSignIn(Uri.parse('https://evil.test/callback'))
          .queryParameters['return_to'],
      '/constat',
    );
  });
  test('actual child windows are allowed only from trusted contexts, with a bounded depth', () {
    final parent = Uri.parse('https://$accordiaHost/account');
    for (final target in [
      null,
      Uri.parse('about:blank'),
      Uri.parse('https://auth.openai.com/authorize'),
    ]) {
      expect(
        canCreateAccordiaWindow(
          parent: parent,
          target: target,
          depth: 0,
          alreadyOpen: false,
        ),
        true,
      );
    }
    expect(
      canCreateAccordiaWindow(
        parent: Uri.parse('https://evil.test'),
        target: null,
        depth: 0,
        alreadyOpen: false,
      ),
      false,
    );
    expect(
      canCreateAccordiaWindow(
        parent: parent,
        target: Uri.parse('https://evil.test'),
        depth: 0,
        alreadyOpen: false,
      ),
      false,
    );
    expect(
      canCreateAccordiaWindow(
        parent: parent,
        target: null,
        depth: 2,
        alreadyOpen: false,
      ),
      false,
    );
    expect(
      canCreateAccordiaWindow(
        parent: parent,
        target: null,
        depth: 0,
        alreadyOpen: true,
      ),
      false,
    );
  });
}
