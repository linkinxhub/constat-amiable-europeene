import type {Lang} from './i18n';
import {documentState,type DocumentFacts} from './document-status';
import {documentStatusCopy} from './document-status-copy';
export function DocumentStatus({lang,...facts}:DocumentFacts&{lang:Lang}){
 const c=documentStatusCopy[lang],state=documentState(facts);
 return <section className={'document-status document-status-'+state} aria-label={c.title}><p role="status"><strong>{c[state]}</strong></p><p className="muted">{c.notice}</p></section>;
}
