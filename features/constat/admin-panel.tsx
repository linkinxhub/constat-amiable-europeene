'use client';
import {useId,useRef,useState} from 'react';
import {z} from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {adminCopy} from './admin-copy';
import type {Lang} from './i18n';
export type AiSettingsView={revision:number;hasKey:boolean;model:string;enabled:boolean;updatedAt:string;secureStorageReady:boolean};
const viewSchema=z.object({revision:z.number(),hasKey:z.boolean(),model:z.string(),enabled:z.boolean(),updatedAt:z.string(),secureStorageReady:z.boolean()});
export function AdminPanel({lang,initial}:{lang:Lang;initial:AiSettingsView|null}){
 const uid=useId();const c=adminCopy[lang],[settings,setSettings]=useState(initial),[model,setModel]=useState(initial?.model||''),[key,setKey]=useState(''),[enabled,setEnabled]=useState(initial?.enabled||false),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(false);const working=useRef(false);
 const dirty=!!settings&&(model!==settings.model||enabled!==settings.enabled||!!key);
 async function run(action:'activate'|'save'|'test'|'reload'){
  if(working.current)return;working.current=true;setBusy(true);setMessage('');setError(false);
  try{const method=action==='reload'?'GET':action==='save'?'PUT':'POST';const body=action==='activate'?{code:code.trim()}:action==='save'?{revision:settings?.revision,model,enabled,...(key.trim()?{apiKey:key.trim()}:{})}:{revision:settings?.revision};
   const response=await fetch('/api/admin/'+(action==='activate'?'activate':'ai-settings'),{method,cache:'no-store',signal:AbortSignal.timeout(30000),headers:method==='GET'?{}:{'Content-Type':'application/json','X-Accordia-Request':'1'},body:method==='GET'?undefined:JSON.stringify(body)});const data=await response.json();
   if(response.status===401)throw new Error('signin');
   if(!response.ok)throw new Error(z.object({error:z.string()}).safeParse(data).data?.error||'error');
   if(action==='activate'){setCode('');window.location.assign('/admin?lang='+lang);return;}
   if(action==='save'||action==='reload'){const view=viewSchema.parse(data);setSettings(view);setModel(view.model);setEnabled(view.enabled);setKey('');}setMessage(action==='test'?c.tested:action==='save'?c.saved:'');
  }catch(e){const name=e instanceof Error?e.message:'error';setMessage(Object.hasOwn(c,name)?c[name as keyof typeof c]:c.error);setError(true);}finally{working.current=false;setBusy(false)}
 }
 if(!settings)return <section className="admin-panel"><h2>{c.activateTitle}</h2><p>{c.activateHelp}</p><form onSubmit={e=>{e.preventDefault();void run('activate')}}><label htmlFor={uid+'activation-code'}>{c.code}</label><Input id={uid+'activation-code'} type="password" autoComplete="off" required maxLength={100} value={code} onChange={e=>setCode(e.target.value)} disabled={busy}/><Button disabled={busy||!code.trim()}>{busy?c.busy:c.activate}</Button></form>{message&&<p role={error?'alert':'status'}>{message}</p>}</section>;
 return <section className="admin-panel"><p>{c.intro}</p><form onSubmit={e=>{e.preventDefault();void run('save')}}><fieldset disabled={busy}><label htmlFor={uid+'openai-key'}>{c.key}</label><Input id={uid+'openai-key'} type="password" autoComplete="new-password" maxLength={500} spellCheck={false} value={key} onChange={e=>setKey(e.target.value)} aria-describedby={uid+'key-help '+uid+'key-status'}/><p id={uid+'key-status'} className="admin-state">{settings.hasKey?c.present:c.absent}</p><p id={uid+'key-help'}>{c.keyHelp}</p><label htmlFor={uid+'openai-model'}>{c.model}</label><Input id={uid+'openai-model'} required maxLength={120} autoComplete="off" spellCheck={false} value={model} onChange={e=>setModel(e.target.value)} aria-describedby={uid+'model-help'}/><p id={uid+'model-help'}>{c.modelHelp}</p><label className="session-choice"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/><span>{c.enabled}</span></label><Button type="submit" disabled={!dirty||!settings.secureStorageReady}>{busy?c.busy:c.save}</Button></fieldset></form><div className="admin-actions"><Button type="button" variant="outline" disabled={busy||dirty||!settings.hasKey} onClick={()=>void run('test')}>{c.test}</Button><Button type="button" variant="ghost" disabled={busy} onClick={()=>void run('reload')}>{c.reload}</Button></div><p>{c.testHelp}</p>{!settings.secureStorageReady&&<p role="alert">{c.ai_configuration}</p>}{message&&<p role={error?'alert':'status'}>{message}</p>}<p className="notice">{c.safety}</p></section>;
}
