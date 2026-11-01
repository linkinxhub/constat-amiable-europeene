import {Pricing} from '@/features/constat/pricing';
import {pricingCopy} from '@/features/constat/pricing-copy';
import type {Lang} from '@/features/constat/i18n';
import {SiteHeader,SiteFooter} from '@/features/product/site-header';
export default async function PricingPage({searchParams}:{searchParams:Promise<{lang?:string}>}){const q=await searchParams;const lang:Lang=q.lang&&Object.hasOwn(pricingCopy,q.lang)?q.lang as Lang:'fr';return <main className="pricing-page public-page" lang={lang}><SiteHeader lang={lang} active="pricing"/><div className="site-content"><Pricing lang={lang}/></div><SiteFooter lang={lang}/></main>}
