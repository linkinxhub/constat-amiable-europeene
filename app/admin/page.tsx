import {MobileAdminPanel} from '@/features/mobile/admin-panel';
import {mobileCopy} from '@/features/mobile/copy';
import {FeedbackInbox} from '@/features/feedback/inbox';
import {RetentionAdminPanel} from '@/features/constat/retention-admin-panel';
import {env} from 'cloudflare:workers';
import {getChatGPTUser,chatGPTSignInPath} from '../chatgpt-auth';
import {isSuperAdmin,readAiSettings} from '@/server/ai-settings';
import {AdminPanel,type AiSettingsView} from '@/features/constat/admin-panel';
import {adminCopy} from '@/features/constat/admin-copy';
import type {Lang} from '@/features/constat/i18n';
export const dynamic='force-dynamic';
export default async function Admin({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const query=await searchParams,lang:Lang=query?.lang&&Object.hasOwn(adminCopy,query.lang)?query.lang as Lang:'fr',c=adminCopy[lang],user=await getChatGPTUser();
 let initial:AiSettingsView|null=null,unavailable=false;
 if(user){try{if(!env.DB)throw new Error();if(await isSuperAdmin(env.DB,user.userId))initial=await readAiSettings(env.DB,user.userId,env);}catch{unavailable=true;}}
 return <main className="account-page" lang={lang}><a href={'/account?lang='+lang} className="account-back">{c.back}</a><div className="account-card"><h1>{mobileCopy[lang].adminTitle}</h1>{!user?<a className="cloud-signin" href={chatGPTSignInPath('/admin?lang='+lang)} target="_top">{c.signin}</a>:unavailable?<p role="alert">{c.unavailable}</p>:<>{initial&&<MobileAdminPanel lang={lang}/>}<h2>{c.title}</h2><AdminPanel lang={lang} initial={initial}/>{initial&&<><RetentionAdminPanel lang={lang}/><FeedbackInbox lang={lang}/></>}</>}</div></main>;
}
