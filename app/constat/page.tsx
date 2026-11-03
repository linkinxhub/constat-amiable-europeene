import ConstatApp from '@/features/constat/workspace';
import {getChatGPTUser,chatGPTSignInPath} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function ConstatPage({searchParams}:{searchParams:Promise<{entry?:string}>}){const [user,q]=await Promise.all([getChatGPTUser(),searchParams]);return <ConstatApp initialParticipationMode={q.entry==='same-device'?'same-device':undefined} account={user?{displayName:user.displayName}:null} signInUrl={chatGPTSignInPath('/constat')}/>;}
