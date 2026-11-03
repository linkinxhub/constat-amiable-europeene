'use client';
import {useId,useRef,useState} from 'react';
import {z} from 'zod';
import {mobilePresentationSchema,mobileDefaults,type MobilePresentation} from './model';
import {mobileCopy} from './copy';
import type {Lang} from '../constat/i18n';
const itemSchema=mobilePresentationSchema.extend({schemaVersion:z.literal(1),revision:z.number().int().nonnegative()});
const viewSchema=z.object({revision:z.number().int().nonnegative(),published:itemSchema,history:z.array(itemSchema.extend({state:z.enum(['draft','published']),actor:z.string(),createdAt:z.string(),sourceRevision:z.number().nullable()}))});
type View=z.infer<typeof viewSchema>;
export function MobileAdminPanel({lang}:{lang:Lang}){
 const id=useId(),c=mobileCopy[lang],lock=useRef(false);
 const [view,setView]=useState<View|null>(null),[config,setConfig]=useState<MobilePresentation>(mobileDefaults),[busy,setBusy]=useState(false),[error,setError]=useState(false),[message,setMessage]=useState('');
 const latest=view?.history[0];
 const dirty=!!latest&&JSON.stringify(mobilePresentationSchema.strip().parse(latest))!==JSON.stringify(config);
 async function run(action:'reload'|'draft'|'publish'|'rollback',sourceRevision?:number){
  if(lock.current)return;lock.current=true;setBusy(true);setMessage('');setError(false);
  try{const response=await fetch('/api/admin/mobile-settings',{method:action==='reload'?'GET':'PUT',cache:'no-store',signal:AbortSignal.timeout(15000),headers:action==='reload'?{}:{'Content-Type':'application/json','X-Accordia-Request':'1'},body:action==='reload'?undefined:JSON.stringify({action,expectedRevision:view?.revision??0,...(action==='draft'?{config}:{sourceRevision})})});
   if(!response.ok)throw Error();const next=viewSchema.parse(await response.json());setView(next);setConfig(mobilePresentationSchema.strip().parse(next.history[0]??next.published));setMessage(action==='reload'?'':c.saved);
  }catch{setError(true);setMessage(c.error)}finally{lock.current=false;setBusy(false)}
 }
 return <section id="mobile-settings" className="admin-panel" style={{scrollMarginTop:24}}><h2>{c.title}</h2><p>{c.help}</p><p>{c.native}</p><button type="button" disabled={busy} onClick={()=>void run('reload')}>{c.reload}</button>{view&&<><form onSubmit={e=>{e.preventDefault();void run('draft')}}><fieldset disabled={busy}><label htmlFor={id+'title'}>{c.name}</label><input id={id+'title'} required maxLength={80} value={config.title} onChange={e=>setConfig(v=>({...v,title:e.target.value}))}/><label htmlFor={id+'color'}>{c.color}</label><input id={id+'color'} type="color" value={config.primaryColor} onChange={e=>setConfig(v=>({...v,primaryColor:e.target.value}))}/><label htmlFor={id+'design'}>{c.design}</label><select id={id+'design'} value={config.designId} onChange={e=>setConfig(v=>({...v,designId:e.target.value as MobilePresentation['designId']}))}><option value="horizon">Horizon</option>{config.designId!=='horizon'&&<option value={config.designId}>{config.designId}</option>}</select><label><input type="checkbox" checked={config.introEnabled} onChange={e=>setConfig(v=>({...v,introEnabled:e.target.checked}))}/>{c.intro}</label><label htmlFor={id+'duration'}>{c.duration}</label><input id={id+'duration'} type="number" min={0} max={1500} required value={config.introDurationMs} onChange={e=>setConfig(v=>({...v,introDurationMs:Number(e.target.value)}))}/><label><input type="checkbox" checked={config.soundDefault} onChange={e=>setConfig(v=>({...v,soundDefault:e.target.checked}))}/>{c.sound}</label><button type="submit">{c.save}</button></fieldset></form><aside aria-label={c.preview}><h3>{c.preview}</h3><strong style={{borderLeft:'6px solid '+config.primaryColor,paddingLeft:12}}>{config.title}</strong><p>{config.designId} · {config.introDurationMs} ms</p></aside>{latest?.state==='draft'&&<button type="button" disabled={busy||dirty} onClick={()=>void run('publish',latest.revision)}>{c.publish}</button>}<h3>{c.history}</h3><ul>{view.history.map(item=><li key={item.revision}>r{item.revision} · {item.state==='draft'?c.draft:c.published} · {item.title} {item.state==='published'&&item.revision!==view.published.revision&&<button type="button" disabled={busy||dirty} onClick={()=>void run('rollback',item.revision)}>{c.rollback}</button>}</li>)}</ul></>}{message&&<p role={error?'alert':'status'}>{message}</p>}</section>;
}
