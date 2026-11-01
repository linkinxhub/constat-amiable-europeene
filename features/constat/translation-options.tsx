'use client';
import {useEffect,useRef,useState} from 'react';
import {z} from 'zod';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {translationCopy} from './translation-copy';
import type {Lang} from './i18n';
const stateSchema=z.object({configured:z.boolean(),consentA:z.number(),consentB:z.number()});
export function TranslationOptions({sessionId,revision,side,lang,disabled,enabled,onEnabled,onReady}:{sessionId:string;revision:number;side:'A'|'B';lang:Lang;disabled:boolean;enabled:boolean;onEnabled:(value:boolean)=>void;onReady:(value:boolean)=>void}){
 const c=translationCopy[lang],[state,setState]=useState<z.infer<typeof stateSchema>|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(false);const requestId=useRef(0),working=useRef(false);const url='/api/sessions/'+encodeURIComponent(sessionId)+'/translation';const own=(side==='A'?state?.consentA:state?.consentB)===revision;
 async function read(){const res=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!res.ok)throw new Error();return stateSchema.parse(await res.json())}
 function load(){const token=++requestId.current;return read().then(next=>{if(token!==requestId.current)return;setState(next);setError(false);onReady(next.configured&&next.consentA===revision&&next.consentB===revision)}).catch(()=>{if(token===requestId.current){setError(true);onReady(false)}})}
 const scope=sessionId+'|'+revision;const [previousScope,setPreviousScope]=useState(scope);if(previousScope!==scope){setPreviousScope(scope);setState(null);setError(false)}
 useEffect(()=>{onReady(false);void load();const timer=setInterval(()=>{if(!working.current)void load()},10000);return()=>{requestId.current++;clearInterval(timer)}},[sessionId,revision]);
 async function consent(){if(working.current)return;working.current=true;requestId.current++;setBusy(true);setError(false);onReady(false);const token=requestId.current;try{const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-Accordia-Request':'1'},body:JSON.stringify({revision,allow:!own}),signal:AbortSignal.timeout(15000)});if(!res.ok)throw new Error();if(token===requestId.current)await load();}catch{if(token===requestId.current)setError(true)}finally{working.current=false;setBusy(false)}}
 return <section className="translation-options"><h3>{c.title}</h3><p>{c.hint}</p><label className="signature-consent"><Checkbox checked={enabled} disabled={disabled||busy} onCheckedChange={v=>onEnabled(v===true)}/><span>{c.option}</span></label>{enabled&&<>{state&&!state.configured&&<p role="status">{c.unconfigured}</p>}<p>{c.consent}</p><p aria-live="polite">A : {state?.consentA===revision?c.allowed:c.missing} · B : {state?.consentB===revision?c.allowed:c.missing}</p><Button type="button" variant="outline" disabled={disabled||busy||!state} onClick={()=>void consent()}>{busy?'…':own?c.revoke:c.allow}</Button>{!(state?.consentA===revision&&state?.consentB===revision)&&<p>{c.waiting}</p>}<p>{c.review}</p></>}{error&&<p role="alert">{c.statusError}</p>}</section>;
}
