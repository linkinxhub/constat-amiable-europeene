import 'package:url_launcher/url_launcher.dart';

import '../platform/policy.dart';

/// Secure browser context for explicitly chosen fallback, never a cookie bridge.
Future<bool> openSiteBrowser(
  Uri uri, {
  Future<bool> Function(LaunchMode)? supports,
  Future<bool> Function(Uri, LaunchMode)? launch,
}) async {
  if (!canOpenOutside(uri)) return false;
  final supported = supports ?? supportsLaunchMode;
  final open =
      launch ??
      (Uri uri, LaunchMode mode) => launchUrl(
        uri,
        mode: mode,
        browserConfiguration: const BrowserConfiguration(showTitle: true),
      );
  if (uri.scheme == 'https') {
    try {
      if (await supported(LaunchMode.inAppBrowserView) &&
          await open(uri, LaunchMode.inAppBrowserView))
        return true;
    } catch (_) {
      /* An explicit external-browser fallback was already consented. */
    }
  }
  try {
    return await open(uri, LaunchMode.externalApplication);
  } catch (_) {
    return false;
  }
}
