import { createGateway } from './gateway.mjs';

const port = Number(process.env.PORT ?? '8080');
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('Invalid PORT');
}
createGateway({ siteToken: process.env.ACCORDIA_SITE_SERVICE_TOKEN }).listen(port, '0.0.0.0');
