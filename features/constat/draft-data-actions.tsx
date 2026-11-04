'use client';
import {useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import type {Lang} from './i18n';
import type {Report} from './model';
import {deleteDraft} from './storage';
import {draftExport,draftFilename} from './draft-data';
import {draftDataCopy} from './draft-data-copy';
export function DraftDataActions({report,lang,disabled,onDeleted}:{report:Report;lang:Lang;disabled:boolean;onDeleted:(snapshot:Report)=>void}){
 const c=draftDataCopy[lang],working=useRef(false),mounted=useRef(true);
 const [confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[copy,setCopy]=useState<{source:Report;url:string}|null>(null);
 const [previous,setPrevious]=useState(report);if(previous!==report){setPrevious(report);setConfirm(false);setCopy(null);setMessage('')}
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
 useEffect(()=>()=>{if(copy)URL.revokeObjectURL(copy.url)},[copy]);
 function prepare(){if(disabled||working.current)return;try{setCopy({source:report,url:URL.createObjectURL(new Blob([draftExport(report)],{type:'application/json'}))});setMessage('')}catch{setMessage(c.error)}}
 async function remove(){if(!confirm||disabled||working.current)return;working.current=true;setBusy(true);setMessage('');try{await deleteDraft(report);onDeleted(report)}catch(e){if(mounted.current)setMessage(e instanceof Error&&e.message==='conflict'?c.conflict:c.error)}finally{working.current=false;if(mounted.current){setBusy(false);setConfirm(false)}}}
 return <details className="draft-data-actions"><summary>{c.title}</summary><p className="muted">{c.exportHint}</p><div className="draft-data-buttons"><Button type="button" variant="outline" disabled={disabled||busy} onClick={prepare}>{c.export}</Button>{copy?.source===report&&<a className="pdf-link" href={copy.url} download={draftFilename(report.id)}>{c.download}</a>}<Button type="button" variant="outline" disabled={disabled||busy} onClick={()=>setConfirm(true)}>{c.remove}</Button></div>{confirm&&<div className="draft-delete-confirm" role="group" aria-label={c.question}><p><strong>{c.question}</strong></p><p>{c.scope}</p><p>{c.warning}</p><div className="draft-data-buttons"><Button type="button" variant="outline" disabled={busy} onClick={()=>setConfirm(false)}>{c.cancel}</Button><Button type="button" disabled={disabled||busy} onClick={()=>void remove()}>{c.confirm}</Button></div></div>}{message&&<p role="alert">{message}</p>}</details>;
}
