import {ArrowUpRight,Check} from 'lucide-react';
import type {Lang} from '../constat/i18n';
import {pricingCopy,type Plan} from '../constat/pricing-copy';
import {presentationCopy} from './presentation-copy';
export function PlanCard({plan,index,lang,headingLevel=3}:{plan:Plan;index:number;lang:Lang;headingLevel?:2|3}){
 const c=pricingCopy[lang],p=presentationCopy[lang],free=index===0,Heading=headingLevel===2?'h2':'h3';
 return <article className={'product-plan'+(free?' product-plan-free':'')+(index===1?' product-plan-premium':'')} data-plan-index={index}>
  <span className={'product-status '+(free?'status-live':'status-planned')}>{free?<Check size={14} aria-hidden="true"/>:null}{free?p.available:index<3?c.planned:c.fleetStatus}</span>
  <Heading>{plan.name}</Heading><p className="product-plan-price">{plan.price}</p><p className="product-plan-period">{plan.period}</p><p className="product-plan-detail">{plan.detail}</p><p className="product-plan-benefit">{plan.benefit}</p>{plan.extra&&<p className="product-plan-extra">{plan.extra}</p>}
  <a className={free?'site-action':'site-action site-action-secondary'} href={free?'/constat?lang='+lang:'/account?lang='+lang+'#offers'}>{free?p.start:p.preference}<ArrowUpRight size={17} aria-hidden="true"/></a>
 </article>;
}
export function PlanCards({lang,group='personal'}:{lang:Lang;group?:'personal'|'fleet'}){const start=group==='personal'?0:3;return <div className="product-plan-grid">{pricingCopy[lang].plans.slice(start,start+3).map((plan,i)=><PlanCard key={start+i} plan={plan} index={start+i} lang={lang}/>)}</div>;}
