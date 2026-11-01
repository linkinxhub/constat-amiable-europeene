'use client';
import {useLayoutEffect,useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogHeader} from '@/components/ui/dialog';
import {DocumentImport} from './document-import';
import {quickFlowCopy} from './quick-flow-copy';
import {entryModeCopy} from './entry-mode-copy';
import {expressEntryAllowed,applyOwnEntry} from './entry-mode-model';
import type {Report} from './model';
import type {Lang} from './i18n';
export function EntryMode({report,side,lang,guided,onGuided,onClassic,onChange,sessionId,disabled=false}:{report:Report;side:0|1;lang:Lang;guided:boolean;onGuided:()=>void;onClassic:()=>void;onChange:(r:Report)=>void;sessionId?:string;disabled?:boolean}){
 const c=entryModeCopy[lang],current=useRef(report);useLayoutEffect(()=>{current.current=report},[report]);
 const [open,setOpen]=useState(false),[access,setAccess]=useState<'checking'|'admin'|'closed'|'error'>('checking'),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true;const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),10000);void fetch('/api/document-extraction',{cache:'no-store',signal:ac.signal}).then(async r=>{if(r.status===401||r.status===403){if(active)setAccess('closed');return}if(!r.ok)throw new Error();const data=await r.json();if(active)setAccess(expressEntryAllowed(data)?'admin':'closed')}).catch(()=>{if(active)setAccess('error')}).finally(()=>clearTimeout(timer));return()=>{active=false;ac.abort()}},[attempt]);
 return <section className="entry-mode"><details className="entry-preferences"><summary>{guided?c.guided:c.classic} · {quickFlowCopy[lang].settings}</summary><h2>{c.title}</h2><div className="entry-mode-cards"><article className={guided?'selected':''}><h3>{c.guided}</h3><p>{c.guide}</p><Button type="button" disabled={disabled} aria-pressed={guided} onClick={onGuided}>{c.guided}</Button></article><article><h3>{c.express}</h3><p>{c.documents}</p>{access==='error'?<Button type="button" variant="outline" disabled={disabled} onClick={()=>{setAccess('checking');setAttempt(v=>v+1)}}>{c.error}</Button>:<Button type="button" variant="outline" disabled={disabled||access!=='admin'} onClick={()=>setOpen(true)}>{access==='checking'?c.checking:access==='admin'?c.test:c.soon}</Button>}</article></div></details><Button type="button" variant="link" disabled={disabled} onClick={guided?onClassic:onGuided}>{guided?c.classic:c.guided}</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="entry-mode-dialog"><DialogHeader><DialogTitle>{c.express} · {side===0?'A':'B'}</DialogTitle><DialogDescription>{c.hint}</DialogDescription></DialogHeader>{open&&<DocumentImport defaultOpen key={report.id+side} value={report.vehicles[side]} side={side===0?'A':'B'} lang={lang} sessionId={sessionId} onChange={v=>onChange(applyOwnEntry(current.current,side,v))}/>}<Button type="button" onClick={()=>{setOpen(false);onGuided()}}>{c.continue}</Button></DialogContent></Dialog></section>
}
