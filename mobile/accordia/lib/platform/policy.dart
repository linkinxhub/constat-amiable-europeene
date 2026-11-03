const accordiaHost = 'accordia-constat.adil-btp.chatgpt.site';
bool isAccordia(Uri? uri) =>
    uri != null &&
    uri.scheme == 'https' &&
    uri.host == accordiaHost &&
    uri.port == 443 &&
    uri.userInfo.isEmpty;
bool isAccordiaBlob(Uri? uri) =>
    uri != null && uri.scheme == 'blob' && isAccordia(Uri.tryParse(uri.path));
bool canOpenOutside(Uri uri) =>
    uri.userInfo.isEmpty &&
    ((uri.scheme == 'https' && uri.host.isNotEmpty) ||
        ['tel', 'mailto'].contains(uri.scheme));
Uri? scannedAccordia(String value) {
  if (value.length > 8192 || RegExp(r'[\x00-\x20]').hasMatch(value.trim()))
    return null;
  final uri = Uri.tryParse(value.trim());
  if (!isAccordia(uri)) return null;
  // Invitation fragments remain byte-for-byte in the URI; never attach them to analytics.
  if (!RegExp(r'^/(?:join|session/[a-zA-Z0-9-]+|constat|account|guide)/?$')
      .hasMatch(uri!.path))
    return null;
  return uri;
}

// Authentication navigation only. These origins never receive native permissions
// or PDF extraction. Embedded sign-in may still be refused by the provider.
bool isTrustedAuthentication(Uri? uri) =>
    uri != null &&
    uri.scheme == 'https' &&
    uri.port == 443 &&
    uri.userInfo.isEmpty &&
    const {
      'chatgpt.com',
      'auth.openai.com',
      'auth0.openai.com',
    }.contains(uri.host);

bool isEmptyPopup(Uri? uri) =>
    uri == null || uri.toString().isEmpty || uri.toString() == 'about:blank';
bool canCreateAccordiaWindow({
  required Uri? parent,
  required Uri? target,
  required int depth,
  required bool alreadyOpen,
}) =>
    !alreadyOpen &&
    depth < 2 &&
    (isAccordia(parent) || isTrustedAuthentication(parent)) &&
    (isAccordia(target) ||
        isTrustedAuthentication(target) ||
        isEmptyPopup(target));

/// Start at the site's actual sign-in entry, never at an expired provider URL.
/// Invitation fragments remain in the original native/page context, not OAuth.
Uri restartAccordiaSignIn(Uri original) {
  final valid = scannedAccordia(original.toString()) != null;
  final params = <String, String>{};
  if (valid) {
    final lang = original.queryParameters['lang'];
    if (const ['fr', 'en', 'de', 'nl'].contains(lang)) params['lang'] = lang!;
    if (original.queryParameters['entry'] == 'same-device')
      params['entry'] = 'same-device';
    final document = original.queryParameters['document'];
    if (document != null && RegExp(r'^[a-zA-Z0-9-]{1,80}$').hasMatch(document))
      params['document'] = document;
  }
  final relative = Uri(
    path: valid ? original.path : '/constat',
    queryParameters: params.isEmpty ? null : params,
  );
  return Uri.https(accordiaHost, '/signin-with-chatgpt', {
    'return_to': relative.toString(),
  });
}

bool isAuthenticationDestination(Uri uri) =>
    uri.scheme == 'https' &&
    uri.port == 443 &&
    uri.userInfo.isEmpty &&
    (isTrustedAuthentication(uri) ||
        const {
          'accounts.google.com',
          'login.microsoftonline.com',
          'login.live.com',
          'appleid.apple.com',
        }.contains(uri.host));

/// Never move an OAuth transaction into a different browser's cookie jar.
/// Start the actual site sign-in flow there instead, without copied state/code.
Uri externalBrowserDestination(Uri requested, Uri original) {
  if (!canOpenOutside(requested))
    throw ArgumentError('Unsupported external link');
  return isAuthenticationDestination(requested)
      ? restartAccordiaSignIn(original)
      : requested;
}

/// Internal navigation only. External content never gets native capabilities.
bool isSecureWebPage(Uri? uri) =>
    uri != null &&
    uri.scheme == 'https' &&
    uri.port == 443 &&
    uri.host.isNotEmpty &&
    uri.userInfo.isEmpty;
bool canNavigateInside(Uri? uri, {bool externalContent = false}) =>
    isAccordia(uri) ||
    (uri != null && isAuthenticationDestination(uri)) ||
    (externalContent && isSecureWebPage(uri));
String embeddedService(Uri? uri) {
  if (uri == null || isAccordia(uri)) return 'Accordia';
  return switch (uri.host) {
    'auth.openai.com' || 'auth0.openai.com' || 'chatgpt.com' => 'OpenAI',
    'accounts.google.com' => 'Google',
    'login.microsoftonline.com' || 'login.live.com' => 'Microsoft',
    'appleid.apple.com' => 'Apple',
    _ => '',
  };
}
