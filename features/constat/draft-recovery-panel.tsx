'use client';
import {useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {continuityCopy} from './continuity-copy';
import {parseDraftBackup,recoveredDraft} from './draft-recovery';
import {saveDraft,newLocalId} from './storage';
import {REPORT_BYTES} from './photo-limits';
import type {Report} from './model';
import type {Lang} from './i18n';
export function DraftRecovery({lang,onCreated}:{lang:Lang;onCreated:()=>void}){
 const c=continuityCopy[lang],[preview,setPreview]=useState<Report|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState<keyof typeof continuityCopy.fr|''>(''),request=useRef(0),working=useRef(false),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
 async function read(file:File){const token=++request.current;setPreview(null);setMessage('');try{if(file.size>REPORT_BYTES)throw new Error('too_large');const report=parseDraftBackup(new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer()));if(token===request.current&&mounted.current)setPreview(report)}catch{if(token===request.current&&mounted.current)setMessage('error')}}
 async function recover(){if(!preview||working.current)return;working.current=true;setBusy(true);try{await saveDraft(recoveredDraft(preview,newLocalId()));if(mounted.current){setPreview(null);setMessage('imported');onCreated()}}catch{if(mounted.current)setMessage('error')}finally{working.current=false;if(mounted.current)setBusy(false)}}
 return <details className="simple-details draft-recovery"><summary>{c.import}</summary><p>{c.importHint}</p><input type="file" accept=".json,application/json" aria-label={c.import} disabled={busy} onChange={e=>{const f=e.currentTarget.files?.[0];e.currentTarget.value='';if(f)void read(f)}}/>{preview&&<><p>{c.importReady}</p><p>{preview.place} · {preview.date} · {preview.vehicles.map(v=>v.plate).filter(Boolean).join(' / ')} · {preview.photos.length} photos</p><div className="draft-data-buttons"><Button type="button" variant="outline" disabled={busy} onClick={()=>{request.current++;setPreview(null)}}>{c.cancel}</Button><Button type="button" disabled={busy} onClick={()=>void recover()}>{c.importConfirm}</Button></div></>}{message&&<p role="status">{c[message]}</p>}</details>
}
