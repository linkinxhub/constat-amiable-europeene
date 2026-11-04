import type {Lang} from './i18n';
import {continuityCopy} from './continuity-copy';
export function ContinuityInfo({lang}:{lang:Lang}){const c=continuityCopy[lang];return <details className="product-details continuity-info"><summary>{c.profiles} · {c.onlineData}</summary><p>{c.profileHint}</p><p>{c.dataHint}</p><p>{c.deleteHint}</p><p>{c.shareHint}</p><p>{c.offlineGuide}</p></details>}
