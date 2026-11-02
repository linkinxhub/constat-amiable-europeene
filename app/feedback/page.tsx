import {getChatGPTUser,chatGPTSignInPath} from '../chatgpt-auth';
import {publicLanguage} from '@/features/product/presentation-copy';
import {feedbackCopy} from '@/features/feedback/copy';
import {FeedbackForm} from '@/features/feedback/form';
export const dynamic='force-dynamic';
export default async function FeedbackPage({searchParams}:{searchParams:Promise<{lang?:string;source?:string}>}){const q=await searchParams,lang=publicLanguage(q.lang)||'fr',source=q.source==='platform'?'platform':'site',c=feedbackCopy[lang],user=await getChatGPTUser();return <main className="account-page feedback-page" lang={lang}><a href={'/?lang='+lang}>{c.back}</a><nav aria-label="Language">{(['fr','en','de','nl'] as const).map(l=><a key={l} href={'/feedback?lang='+l+'&source='+source} aria-current={l===lang?'page':undefined}>{l.toUpperCase()}</a>)}</nav><section className="account-card"><h1>{c.title}</h1>{user?<FeedbackForm lang={lang} source={source}/>:<><p>{c.intro}</p><a className="cloud-signin" href={chatGPTSignInPath('/feedback?lang='+lang+'&source='+source)} target="_top">{c.signin}</a><p>{c.privacy}</p></>}</section></main>}
