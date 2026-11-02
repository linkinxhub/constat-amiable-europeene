import {UsageGuide} from '@/features/constat/usage-guide';
import {publicLanguage} from '@/features/product/presentation-copy';
import {guidePageCopy} from '@/features/product/guide-page-copy';
import {SiteHeader,SiteFooter} from '@/features/product/site-header';
export default async function GuidePage({searchParams}:{searchParams:Promise<{lang?:string}>}){const q=await searchParams,lang=publicLanguage(q.lang)||'fr',c=guidePageCopy[lang];return <main className="public-page guide-page" lang={lang}><SiteHeader lang={lang} active="guide"/><div className="site-content"><h1>{c.title}</h1><p>{c.intro}</p><UsageGuide lang={lang}/></div><SiteFooter lang={lang}/></main>}
