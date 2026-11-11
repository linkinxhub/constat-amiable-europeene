import { pathToFileURL } from 'node:url';

const liveHost = 'accordia-constat.adil-btp.chatgpt.site';

export function checkPreviewOrigins(site, gateway) {
  function requirePreviewOrigin(value, name) {
    let url;
    try {
      url = new URL(value);
    } catch {
      throw new Error(name + ' must be an HTTPS origin');
    }
    if (url.protocol !== 'https:' || !url.hostname || url.username ||
        url.password || url.search || url.hash ||
        (value !== url.origin && value !== url.origin + '/')) {
      throw new Error(name + ' must be an HTTPS origin without credentials, path or query');
    }
    if (url.hostname === liveHost) throw new Error(name + ' must not be the live Accordia site');
    return url.origin;
  }
  const siteOrigin = requirePreviewOrigin(site, 'PAIRING_SITE_ORIGIN');
  const gatewayOrigin = requirePreviewOrigin(gateway, 'PAIRING_GATEWAY_ORIGIN');
  if (siteOrigin === gatewayOrigin) throw new Error('The test gateway needs a separate origin');
  return { siteOrigin, gatewayOrigin };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkPreviewOrigins(process.env.PAIRING_SITE_ORIGIN, process.env.PAIRING_GATEWAY_ORIGIN);
}
