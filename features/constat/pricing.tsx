import type {Lang} from './i18n';
import {pricingCopy} from './pricing-copy';
export function Pricing({lang}:{lang:Lang}){const c=pricingCopy[lang];return <>
<header className="pricing-header"><h1>{c.title}</h1><p>{c.intro}</p></header>
<p className="pricing-status">{c.status}</p>
<section className="pricing-why"><h2>{c.why}</h2><p>{c.whyText}</p></section>
<div className="pricing-grid">{c.plans.map((p,i)=><article className={'pricing-card'+(i===1?' pricing-premium':'')} key={p.name}><p className="pricing-badge">{i===0?c.freeStatus:i<3?c.planned:c.fleetStatus}</p><h2>{p.name}</h2><p className="pricing-price">{p.price}</p><p className="pricing-period">{p.period}</p><p>{p.detail}</p><p className="pricing-benefit">{p.benefit}</p>{p.extra&&<p>{p.extra}</p>}</article>)}</div>
<a className="cloud-signin pricing-account" href={'/account?lang='+lang+'#offers'}>{c.account}</a>
<section className="pricing-rules"><h2>{c.rulesTitle}</h2><ul>{c.rules.map(r=><li key={r}>{r}</li>)}</ul></section>
<section className="pricing-faq"><h2>{c.faqTitle}</h2>{c.faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
</>}
