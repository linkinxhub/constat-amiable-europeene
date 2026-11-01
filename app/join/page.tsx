import {JoinPanel} from '@/features/constat/join-panel';
import {publicLanguage} from '@/features/product/presentation-copy';
export default async function JoinPage({searchParams}:{searchParams:Promise<{lang?:string}>}){const q=await searchParams;return <JoinPanel initialLanguage={q.lang===undefined?undefined:publicLanguage(q.lang)}/>}
