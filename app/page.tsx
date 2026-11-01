import Landing from '@/features/marketing/landing';
import {getChatGPTUser} from './chatgpt-auth';
import {publicLanguage} from '@/features/product/presentation-copy';
export const dynamic='force-dynamic';
export default async function Home({searchParams}:{searchParams:Promise<{lang?:string}>}){const [user,q]=await Promise.all([getChatGPTUser(),searchParams]);return <Landing initialLanguage={publicLanguage(q.lang)} signedIn={Boolean(user)} displayName={user?.displayName||null}/>;}
