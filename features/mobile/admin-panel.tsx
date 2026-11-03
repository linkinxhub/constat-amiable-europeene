'use client';
import {useEffect,useId,useRef,useState,type CSSProperties} from 'react';
import {mobilePresentationSchema,mobileDefaults,type MobilePresentation} from './model';
import {asPresentation,differentSettings,hasMobileEdits,mobileAdminViewSchema,type MobileAdminView} from './admin-model';
import {mobileCopy} from './copy';
import {mobileUxCopy} from './admin-ux-copy';
import type {Lang} from '../constat/i18n';

type Action='reload'|'draft'|'publish'|'rollback';
type Pending={action:'publish'|'rollback'|'reload'|'discard';revision:number;sourceRevision?:number};
class SettingsError extends Error {constructor(readonly code:string){super(code);Object.setPrototypeOf(this,SettingsError.prototype)}}
async function requestSettings(action:Action,view:MobileAdminView|null,config:MobilePresentation,signal:AbortSignal,sourceRevision?:number){
 const response=await fetch('/api/admin/mobile-settings',{
  method:action==='reload'?'GET':'PUT',cache:'no-store',signal,
  headers:action==='reload'?{}:{'Content-Type':'application/json','X-Accordia-Request':'1'},
  body:action==='reload'?undefined:JSON.stringify({action,expectedRevision:view?.revision??0,...(action==='draft'?{config}:{sourceRevision})})
 });
 if(!response.ok)throw new SettingsError(response.status===401?'unauthenticated':response.status===403?'forbidden':response.status===409?'conflict':response.status===400?'invalid':'error');
 return mobileAdminViewSchema.parse(await response.json());
}

export function MobileAdminPanel({lang,initial=null}:{lang:Lang;initial?:MobileAdminView|null}){
 const id=useId(),c=mobileCopy[lang],u=mobileUxCopy[lang];
 const [view,setView]=useState<MobileAdminView|null>(initial);
 const [config,setConfig]=useState<MobilePresentation>(()=>initial?asPresentation(initial.history[0]??initial.published):mobileDefaults);
 const [busy,setBusy]=useState(!initial),[error,setError]=useState(false),[message,setMessage]=useState('');
 const [pending,setPending]=useState<Pending|null>(null),[screen,setScreen]=useState<'home'|'launch'>('home');
 const [filter,setFilter]=useState<'all'|'draft'|'published'>('all');
 const lock=useRef(!initial),mounted=useRef(true),controller=useRef<AbortController|null>(null),confirmRef=useRef<HTMLButtonElement>(null),dialogRef=useRef<HTMLElement>(null);
 const returnFocus=useRef<HTMLElement|null>(null);
 const latest=view?.history[0],dirty=!!view&&hasMobileEdits(view,config),validation=mobilePresentationSchema.safeParse(config);
 const blocked=busy||pending!==null;
 const labels={title:c.name,primaryColor:c.color,designId:c.design,introEnabled:c.intro,introDurationMs:c.duration,soundDefault:c.sound};
 const format=(value:unknown)=>typeof value==='boolean'?(value?u.yes:u.no):String(value);
 const rows=view?.history.filter(item=>filter==='all'||item.state===filter)??[];
 const changes=view?differentSettings(asPresentation(view.published),config):[];
 const safeColor=/^#[0-9a-fA-F]{6}$/.test(config.primaryColor)?config.primaryColor:mobileDefaults.primaryColor;
 function errorText(reason:unknown){return reason instanceof SettingsError?u[reason.code as 'unauthenticated'|'forbidden'|'conflict'|'invalid'|'error']:u.error}

 useEffect(()=>{
  mounted.current=true;
  if(!initial){
   const abort=new AbortController();controller.current=abort;const timeout=setTimeout(()=>abort.abort(),15000);
   requestSettings('reload',null,mobileDefaults,abort.signal).then(next=>{
    if(!mounted.current||abort.signal.aborted||controller.current!==abort)return;setView(next);setConfig(asPresentation(next.history[0]??next.published));
   }).catch(reason=>{if(mounted.current&&controller.current===abort){setError(true);setMessage(reason instanceof SettingsError?mobileUxCopy[lang][reason.code as 'unauthenticated'|'forbidden'|'conflict'|'invalid'|'error']:mobileUxCopy[lang].error)}})
    .finally(()=>{clearTimeout(timeout);if(mounted.current&&controller.current===abort){lock.current=false;setBusy(false)}});
  }
  return ()=>{mounted.current=false;controller.current?.abort()};
 },[initial,lang]);
 useEffect(()=>{
  if(!dirty)return;
  const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue=''};
  window.addEventListener('beforeunload',warn);return ()=>window.removeEventListener('beforeunload',warn);
 },[dirty]);
 useEffect(()=>{
  if(!pending)return;
  const previous=returnFocus.current;confirmRef.current?.focus();
  return ()=>previous?.focus();
 },[pending]);
 function ask(action:Pending['action'],sourceRevision?:number){
  if(lock.current||!view||pending||((action==='publish'||action==='rollback')&&dirty))return;
  returnFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
  setPending({action,revision:view.revision,sourceRevision});
 }
 async function run(action:Action,sourceRevision?:number){
  if(lock.current)return;
  if(action==='draft'&&!validation.success){setError(true);setMessage(u.invalid);return}
  lock.current=true;setPending(null);setBusy(true);setMessage('');setError(false);
  const abort=new AbortController();controller.current=abort;const timeout=setTimeout(()=>abort.abort(),15000);
  try{
   const next=await requestSettings(action,view,validation.success?validation.data:config,abort.signal,sourceRevision);
   if(!mounted.current||abort.signal.aborted||controller.current!==abort)return;
   setView(next);setConfig(asPresentation(next.history[0]??next.published));setMessage(action==='reload'?'':action==='draft'?u.draftSaved:u.publishedSaved);
  }catch(reason){if(mounted.current&&controller.current===abort){setError(true);setMessage(errorText(reason))}}
  finally{clearTimeout(timeout);if(mounted.current&&controller.current===abort){lock.current=false;setBusy(false)}}
 }
 function confirm(){
  if(!pending||!view||pending.revision!==view.revision)return;
  if(pending.action==='discard'){
   setConfig(asPresentation(view.history[0]??view.published));setPending(null);setMessage('');setError(false);
  }else void run(pending.action,pending.sourceRevision);
 }
 const target=pending?.sourceRevision?view?.history.find(item=>item.revision===pending.sourceRevision):null;
 const targetChanges=view&&target?differentSettings(asPresentation(view.published),asPresentation(target)):[];
 const confirmationTitle=pending?.action==='publish'?u.confirmPublish:pending?.action==='rollback'?u.confirmRollback:u.confirmDiscard;
 const pendingIsPublication=pending?.action==='publish'||pending?.action==='rollback';

 return <section id="mobile-settings" className="admin-panel mobile-console" aria-labelledby={id+'heading'} aria-busy={busy}>
  <header className="mobile-console-heading"><div><span className="mobile-console-kicker">Accordia · Horizon</span><h2 id={id+'heading'}>{c.title}</h2><p>{u.help}</p></div><button type="button" disabled={blocked} onClick={()=>dirty?ask('reload'):void run('reload')}>{c.reload}</button></header>
  <details className="mobile-console-limits"><summary>{u.compatibility}</summary><p>{u.native}</p><p>{u.sync}</p><p>{u.soundHelp}</p></details>
  {busy&&!view&&<p role="status">{u.loading}</p>}
  {view&&<>
   <div className="mobile-status-grid"><div><span>{u.live}</span><strong>{view.published.revision?'r'+view.published.revision:u.fallback}</strong></div><div><span>{u.editing}</span><strong>{latest?'r'+latest.revision+' · '+(latest.state==='draft'?c.draft:c.published):u.empty}</strong></div><div className={dirty?'mobile-dirty':''}><span>{u.status}</span><strong role="status">{dirty?u.unsaved:u.clean}</strong></div></div>
   <div className="mobile-console-grid"><form onSubmit={event=>{event.preventDefault();if(!blocked)void run('draft')}}>
    <fieldset disabled={blocked}><legend>{u.identity}</legend>
     <label htmlFor={id+'title'}>{c.name}</label><input id={id+'title'} required maxLength={80} value={config.title} onChange={e=>setConfig(v=>({...v,title:e.target.value}))}/>
     <label htmlFor={id+'color'}>{c.color}</label><div className="mobile-color-row"><input id={id+'color'} type="color" value={safeColor} onChange={e=>setConfig(v=>({...v,primaryColor:e.target.value}))}/><input aria-label={u.hex} maxLength={7} pattern="#[0-9a-fA-F]{6}" required value={config.primaryColor} onChange={e=>setConfig(v=>({...v,primaryColor:e.target.value}))}/></div>
     <label htmlFor={id+'design'}>{c.design}</label><select id={id+'design'} value={config.designId} onChange={e=>setConfig(v=>({...v,designId:e.target.value as MobilePresentation['designId']}))}><option value="horizon">Horizon</option>{config.designId!=='horizon'&&<option value={config.designId}>{u.legacy} · {config.designId}</option>}</select>
    </fieldset>
    <fieldset disabled={blocked}><legend>{u.startup}</legend>
     <label className="mobile-toggle"><input type="checkbox" checked={config.introEnabled} onChange={e=>setConfig(v=>({...v,introEnabled:e.target.checked}))}/>{c.intro}</label>
     <label htmlFor={id+'duration'}>{c.duration}</label><input id={id+'duration'} type="number" min={0} max={1500} step={1} required value={Number.isFinite(config.introDurationMs)?config.introDurationMs:''} onChange={e=>setConfig(v=>({...v,introDurationMs:e.target.value===''?Number.NaN:Number(e.target.value)}))}/>
     <label className="mobile-toggle"><input type="checkbox" checked={config.soundDefault} onChange={e=>setConfig(v=>({...v,soundDefault:e.target.checked}))}/>{c.sound}</label><p className="mobile-field-help">{u.soundHelp}</p>
    </fieldset>
    {!validation.success&&<p role="alert">{u.invalid}</p>}
    <div className="mobile-actions"><button type="submit" className="mobile-primary" disabled={blocked||!validation.success||(!dirty&&!!latest)}>{c.save}</button><button type="button" disabled={blocked||!dirty} onClick={()=>ask('discard')}>{u.discard}</button></div>
   </form>
   <aside className="mobile-preview" aria-label={c.preview}><h3>{c.preview}</h3><div className="mobile-preview-switch" role="group" aria-label={c.preview}><button type="button" aria-pressed={screen==='home'} onClick={()=>setScreen('home')}>{u.home}</button><button type="button" aria-pressed={screen==='launch'} onClick={()=>setScreen('launch')}>{u.launch}</button></div>
    <div className="mobile-phone" style={{'--mobile-brand':safeColor} as CSSProperties}><div className="mobile-phone-camera" aria-hidden="true"/><div className={'mobile-phone-content '+(screen==='launch'?'mobile-launch':'')}><div className="mobile-wordmark">{config.title||'Accordia'}</div>{screen==='home'?<><div className="mobile-preview-landscape" aria-hidden="true"><span/><span/></div><h4>{u.previewTitle}</h4><p>{u.previewBody}</p></>:<><div className="mobile-preview-emblem" aria-hidden="true">{(config.title.trim()||'A').slice(0,1)}</div><p>{config.introEnabled?(Number.isFinite(config.introDurationMs)?config.introDurationMs+' ms':'—'):u.disabledIntro}</p><small>{c.sound}: {config.soundDefault?u.yes:u.no}</small></>}</div></div><p className="mobile-field-help">{u.previewNote}</p>
   </aside></div>
   <section className="mobile-workflow" aria-labelledby={id+'workflow'}><h3 id={id+'workflow'}>{u.workflow}</h3><p>{u.publishHelp}</p><h4>{u.compare}</h4>{changes.length?<div className="mobile-table-wrap"><table><thead><tr><th scope="col">{u.field}</th><th scope="col">{u.before}</th><th scope="col">{u.after}</th></tr></thead><tbody>{changes.map(key=><tr key={key}><th scope="row">{labels[key]}</th><td>{format(view.published[key])}</td><td>{format(config[key])}</td></tr>)}</tbody></table></div>:<p>{u.same}</p>}
    {latest?.state==='draft'&&<button type="button" className="mobile-primary" disabled={blocked||dirty||!validation.success} onClick={()=>ask('publish',latest.revision)}>{c.publish}</button>}
   </section>
   <section className="mobile-history" aria-labelledby={id+'history'}><h3 id={id+'history'}>{c.history}</h3><p>{u.historyHelp}</p><label htmlFor={id+'filter'}>{u.filter}</label><select id={id+'filter'} value={filter} onChange={e=>setFilter(e.target.value as typeof filter)}><option value="all">{u.all}</option><option value="draft">{c.draft}</option><option value="published">{c.published}</option></select>
    {!rows.length?<p>{u.empty}</p>:<ul>{rows.map(item=><li key={item.revision}><div className="mobile-history-heading"><strong>r{item.revision} · {item.state==='draft'?c.draft:c.published}</strong><span>{item.title}</span><time dateTime={item.createdAt}>{Number.isFinite(Date.parse(item.createdAt))?new Intl.DateTimeFormat(lang,{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Brussels'}).format(new Date(item.createdAt)):item.createdAt}</time></div><details><summary>{u.details}</summary><dl>{Object.keys(labels).map(key=><div key={key}><dt>{labels[key as keyof typeof labels]}</dt><dd>{format(item[key as keyof typeof labels])}</dd></div>)}</dl></details>{item.state==='published'&&item.revision!==view.published.revision&&<button type="button" disabled={blocked||dirty} onClick={()=>ask('rollback',item.revision)}>{c.rollback}</button>}</li>)}</ul>}
   </section>
  </>}
  {message&&<p className="mobile-result" role={error?'alert':'status'}>{message}</p>}
  {pending&&<div className="mobile-confirm-backdrop"><section ref={dialogRef} className="mobile-confirm" role="alertdialog" aria-modal="true" aria-labelledby={id+'confirmation'} aria-describedby={id+'confirmation-help'} onKeyDown={event=>{
   if(event.key==='Escape'){event.preventDefault();setPending(null)}
   if(event.key==='Tab'){const buttons=dialogRef.current?.querySelectorAll<HTMLButtonElement>('button');if(buttons?.length){const first=buttons[0],last=buttons[buttons.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}}
  }}><h3 id={id+'confirmation'}>{confirmationTitle}</h3><p id={id+'confirmation-help'}>{pendingIsPublication?u.publishHelp:pending.action==='reload'?u.discardHelp+' '+u.reloadGuard:u.discardHelp}</p>{pendingIsPublication&&target&&<><p>{u.version}: r{target.revision} · {target.title}</p><ul>{targetChanges.map(key=><li key={key}>{labels[key]}: {format(view!.published[key])} → {format(target[key])}</li>)}</ul>{!targetChanges.length&&<p>{u.same}</p>}</>}<div className="mobile-actions"><button ref={confirmRef} type="button" onClick={()=>setPending(null)}>{u.cancel}</button><button type="button" className="mobile-primary" onClick={confirm}>{u.confirm}</button></div></section></div>}
 </section>;
}
