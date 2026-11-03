const accordiaHost = 'accordia-constat.adil-btp.chatgpt.site';
bool isAccordia(Uri? uri) =>
    uri != null &&
    uri.scheme == 'https' &&
    uri.host == accordiaHost &&
    uri.port == 443 &&
    uri.userInfo.isEmpty;
Uri? scannedAccordia(String input) {
  if (input.length > 8192 || RegExp(r'[\x00-\x20]').hasMatch(input.trim()))
    return null;
  final uri = Uri.tryParse(input.trim());
  if (!isAccordia(uri) ||
      !RegExp(r'^/(?:join|session/[a-zA-Z0-9-]+|constat|account|guide)/?$')
          .hasMatch(uri!.path))
    return null;
  return uri;
}
