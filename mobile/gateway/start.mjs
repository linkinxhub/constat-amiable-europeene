import { createGateway } from './gateway.mjs';

const port = Number(process.env.PORT ?? '8080');
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('Invalid PORT');
}
createGateway({
  siteOrigin: process.env.ACCORDIA_SITE_ORIGIN,
  siteToken: process.env.ACCORDIA_SITE_SERVICE_TOKEN,
  gatewaySecret: process.env.ACCORDIA_MOBILE_GATEWAY_SECRET,
}).listen(port, '0.0.0.0');
