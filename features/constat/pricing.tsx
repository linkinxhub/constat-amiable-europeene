import {QuestionnaireInfo} from './questionnaire-info';
import {documentCopy} from './document-copy';
import {DocumentCoverage} from './document-coverage';
import type {Lang} from './i18n';
import {pricingCopy} from './pricing-copy';
import {PlanCards} from '../product/plan-cards';
import {presentationCopy} from '../product/presentation-copy';
export function Pricing({lang}:{lang:Lang}){const c=pricingCopy[lang];return <>
<header className="site-page-heading pricing-header"><span className="site-eyebrow">Accordia · {presentationCopy[lang].pricing}</span><h1>{c.title}</h1><p>{c.intro}</p></header>
<div className="product-availability"><span className="product-status status-planned">{presentationCopy[lang].future}</span><p>{c.status}</p></div>
<section className="site-section" aria-labelledby="personal-plans"><div className="site-section-heading"><h2 id="personal-plans">{presentationCopy[lang].personal}</h2><p>{presentationCopy[lang].personalText}</p></div><PlanCards lang={lang}/></section>
<section className="site-section" aria-labelledby="fleet-plans"><div className="site-section-heading"><h2 id="fleet-plans">{presentationCopy[lang].fleet}</h2><p>{presentationCopy[lang].fleetText}</p></div><PlanCards lang={lang} group="fleet"/></section>
<section className="site-section product-explain" aria-labelledby="included-services"><div className="site-section-heading"><h2 id="included-services">{presentationCopy[lang].included}</h2><p>{presentationCopy[lang].includedText}</p></div><div className="product-info-grid"><div className="site-surface"><QuestionnaireInfo lang={lang}/></div><div className="site-surface"><span className="premium-badge">Premium</span><h3>{documentCopy[lang].title}</h3><p>{documentCopy[lang].pitch}</p><p>{documentCopy[lang].closed}</p><DocumentCoverage lang={lang}/></div></div><details className="product-details"><summary>{c.why}</summary><p>{c.whyText}</p></details></section>
<section className="site-section pricing-rules"><h2>{c.rulesTitle}</h2><ul>{c.rules.map(r=><li key={r}>{r}</li>)}</ul></section>
<section className="site-section pricing-faq"><h2>{c.faqTitle}</h2>{c.faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
<div className="product-bottom-actions"><a className="site-action" href={'/constat?lang='+lang}>{presentationCopy[lang].start}</a><a className="site-action site-action-secondary" href={'/account?lang='+lang+'#offers'}>{presentationCopy[lang].preference}</a></div>
</>}
