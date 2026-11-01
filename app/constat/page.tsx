import ConstatApp from '@/features/constat/workspace';
import {getChatGPTUser,chatGPTSignInPath} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function ConstatPage(){const user=await getChatGPTUser();return <ConstatApp account={user?{displayName:user.displayName}:null} signInUrl={chatGPTSignInPath('/constat')}/>;}
