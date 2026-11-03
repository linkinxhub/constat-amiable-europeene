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
