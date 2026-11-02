import {saveChoiceCopy} from '@/features/constat/save-choice-copy';
import {SiteHeader,SiteFooter} from '@/features/product/site-header';
import {PlanCards} from '@/features/product/plan-cards';
import {presentationCopy} from '@/features/product/presentation-copy';
import {entryCopy} from '@/features/constat/entry-copy';
import {SharedList} from '@/features/constat/shared-list';
import {pricingCopy} from '@/features/constat/pricing-copy';
import {OfferPanel} from '@/features/constat/offer-panel';
import {policyCopy} from '@/features/constat/policy-copy';
import {adminCopy} from '@/features/constat/admin-copy';
import {StoragePanel} from '@/features/constat/storage-panel';
import {getChatGPTUser,chatGPTSignInPath,chatGPTSignOutPath} from '../chatgpt-auth';
import {cloudCopy} from '@/features/constat/cloud-copy';
import type {Lang} from '@/features/constat/i18n';
export const dynamic='force-dynamic';
export default async function Account({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const query=await searchParams,lang:Lang=query?.lang&&Object.hasOwn(cloudCopy,query.lang)?query.lang as Lang:'fr';
 const c=cloudCopy[lang],p=presentationCopy[lang],user=await getChatGPTUser();
 return <main className="account-page public-page" lang={lang}>
  <SiteHeader lang={lang} active="account"/>
  <div className="site-content">
   <header className="site-page-heading"><span className="site-eyebrow">Accordia · {p.account}</span><h1>{c.account}</h1><p>{c.accountText}</p><p className="notice">{saveChoiceCopy[lang].local} {saveChoiceCopy[lang].hint}</p></header>
   {user?<>
    <section className="account-card account-reports"><strong className="account-name">{user.displayName}</strong><h2>{entryCopy[lang].dossiers}</h2><SharedList lang={lang}/><a className="site-action site-action-secondary" href={"/constat?lang="+lang+"#share-options"}>{entryCopy[lang].resume}</a></section>
    <OfferPanel lang={lang}/>
    <details className="simple-details account-settings"><summary>{p.settings}</summary><div className="entry-management"><StoragePanel lang={lang}/><a className="cloud-signin" href={'/admin?lang='+lang}>{adminCopy[lang].title}</a></div></details>
    <a className="account-signout" href={chatGPTSignOutPath('/?lang='+lang)} target="_top">{c.signout}</a>
   </>:<>
    <section className="account-card account-signin" id="offers"><div><h2>{p.signinTitle}</h2><p>{p.signinText}</p></div><a className="site-action" href={chatGPTSignInPath('/account?lang='+lang)} target="_top">{c.signin}</a></section>
    <section className="site-section"><div className="site-section-heading"><h2>{pricingCopy[lang].title}</h2><p>{pricingCopy[lang].status}</p></div><PlanCards lang={lang}/><a className="pricing-link" href={'/pricing?lang='+lang}>{p.pricing}</a></section>
   </>}
   <details className="product-details account-data-info"><summary>{entryCopy[lang].settings}</summary><p className="notice">{c.beta}</p><p>{c.local}</p><p>{policyCopy[lang].retention}</p></details>
  </div><SiteFooter lang={lang}/>
 </main>;
}
