import 'package:flutter_test/flutter_test.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:accordia_mobile/app/site_browser.dart';
import 'package:accordia_mobile/platform/policy.dart';

void main() {
  test('browser authentication restarts the site instead of exporting the provider transaction', () {
    final original = Uri.parse(
      'https://$accordiaHost/session/TEST-SESSION?lang=fr#invite=PRIVATE_INVITATION',
    );
    for (final host in [
      'auth.openai.com',
      'accounts.google.com',
      'login.microsoftonline.com',
      'login.live.com',
      'appleid.apple.com',
    ]) {
      final target = Uri.https(host, '/authorize', {
        'state': 'WEBVIEW_STATE',
        'code': 'WEBVIEW_CODE',
        'client_id': 'PROVIDER_CLIENT',
      });
      final destination = externalBrowserDestination(target, original);
      expect(destination, restartAccordiaSignIn(original));
      for (final secret in [
        'WEBVIEW_STATE',
        'WEBVIEW_CODE',
        'PROVIDER_CLIENT',
        'PRIVATE_INVITATION',
      ])
        expect(destination.toString().contains(secret), false);
    }
    final terms = Uri.parse('https://help.openai.com/en/articles/7426629');
    expect(externalBrowserDestination(terms, original), terms);
    expect(
      isAuthenticationDestination(
        Uri.parse('https://accounts.google.com.evil.test/login'),
      ),
      false,
    );
  });
  test('HTTPS uses an integrated browser while telephone and unavailable tabs use explicit external fallback', () async {
    final modes = <LaunchMode>[];
    Future<bool> launch(Uri uri, LaunchMode mode) async {
      modes.add(mode);
      return true;
    }

    expect(
      await openSiteBrowser(
        Uri.https(accordiaHost, '/constat'),
        supports: (_) async => true,
        launch: launch,
      ),
      true,
    );
    expect(modes, [LaunchMode.inAppBrowserView]);
    modes.clear();
    expect(
      await openSiteBrowser(
        Uri.https(accordiaHost, '/constat'),
        supports: (_) async => false,
        launch: launch,
      ),
      true,
    );
    expect(modes, [LaunchMode.externalApplication]);
    modes.clear();
    expect(
      await openSiteBrowser(
        Uri.parse('tel:+3212345678'),
        supports: (_) async => throw StateError('not called'),
        launch: launch,
      ),
      true,
    );
    expect(modes, [LaunchMode.externalApplication]);
  });
  test(
    'failed browser services are reported and dangerous schemes never launch',
    () async {
      final modes = <LaunchMode>[];
      expect(
        await openSiteBrowser(
          Uri.https(accordiaHost, '/account'),
          supports: (_) async => true,
          launch: (_, mode) async {
            modes.add(mode);
            return false;
          },
        ),
        false,
      );
      expect(modes, [
        LaunchMode.inAppBrowserView,
        LaunchMode.externalApplication,
      ]);
      modes.clear();
      for (final value in [
        'intent://unsafe',
        'file:///secret',
        'javascript:alert(1)',
        'http://example.com',
      ]) {
        expect(
          await openSiteBrowser(
            Uri.parse(value),
            launch: (_, mode) async {
              modes.add(mode);
              return true;
            },
          ),
          false,
        );
      }
      expect(modes, isEmpty);
    },
  );
}
