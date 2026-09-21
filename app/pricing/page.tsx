import {Pricing} from '@/features/constat/pricing';
import {pricingCopy} from '@/features/constat/pricing-copy';
import type {Lang} from '@/features/constat/i18n';
export default async function PricingPage({searchParams}:{searchParams:Promise<{lang?:string}>}){const q=await searchParams;const lang:Lang=q.lang&&Object.hasOwn(pricingCopy,q.lang)?q.lang as Lang:'fr';return <main className="pricing-page" lang={lang}><nav className="pricing-nav"><a href="/">{pricingCopy[lang].back}</a><div>{(['fr','en','de','nl'] as const).map(l=><a key={l} href={'/pricing?lang='+l} hrefLang={l} lang={l} aria-current={l===lang?'page':undefined}>{({fr:'Français',en:'English',de:'Deutsch',nl:'Nederlands'})[l]}</a>)}</div></nav><Pricing lang={lang}/></main>}
