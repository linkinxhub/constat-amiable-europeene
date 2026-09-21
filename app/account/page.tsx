import {pricingCopy} from '@/features/constat/pricing-copy';
import {OfferPanel} from '@/features/constat/offer-panel';
import {policyCopy} from '@/features/constat/policy-copy';
import {adminCopy} from '@/features/constat/admin-copy';
import {StoragePanel} from '@/features/constat/storage-panel';
import {getChatGPTUser,chatGPTSignInPath,chatGPTSignOutPath} from '../chatgpt-auth';import {cloudCopy} from '@/features/constat/cloud-copy';import type {Lang} from '@/features/constat/i18n';
export const dynamic='force-dynamic';
export default async function Account({searchParams}:{searchParams:Promise<{lang?:string}>}){const query=await searchParams;const lang:Lang=query?.lang&&Object.hasOwn(cloudCopy,query.lang)?query.lang as Lang:'fr';const c=cloudCopy[lang];const user=await getChatGPTUser();return <main className="account-page" lang={lang}><a href="/" className="account-back">{c.back}</a><div className="account-card"><h1>{c.account}</h1><p>{c.accountText}</p><a className="pricing-link" href={"/pricing?lang="+lang}>{pricingCopy[lang].title}</a>{user?<><a className="cloud-signin" href={'/admin?lang='+lang}>{adminCopy[lang].title}</a><OfferPanel lang={lang}/><StoragePanel lang={lang}/><strong className="account-name">{user.displayName}</strong><a className="cloud-signin" href={chatGPTSignOutPath('/')} target="_top">{c.signout}</a></>:<a className="cloud-signin" href={chatGPTSignInPath('/account?lang='+lang)} target="_top">{c.signin}</a>}<p className="notice">{c.beta}</p><p>{c.local}</p><p>{policyCopy[lang].retention}</p></div></main>}
