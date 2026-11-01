"use client";
import {useLayoutEffect,useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {TextField} from './fields';
import {newLocalId} from './storage';
import {policyCopy} from './policy-copy';
import type {Report} from './model';import type {Lang} from './i18n';
export function RefusalPanel({report,lang,side}:{report:Report,lang:Lang,side?:'A'|'B'}){
 const c=policyCopy[lang];const [actor,setActor]=useState<'A'|'B'>(side||'A'),[reason,setReason]=useState(''),[confirmed,setConfirmed]=useState(false),[busy,setBusy]=useState(false),[url,setUrl]=useState(''),[error,setError]=useState(false);
 const latest=useRef({report,lang,actor,reason});useLayoutEffect(()=>{latest.current={report,lang,actor:side||actor,reason}},[report,lang,actor,reason,side]);const generation=useRef(0);
 useLayoutEffect(()=>{generation.current++},[report,lang,actor,reason,side]);const [previousSource,setPreviousSource]=useState({report,lang,actor,reason,side});if(previousSource.report!==report||previousSource.lang!==lang||previousSource.actor!==actor||previousSource.reason!==reason||previousSource.side!==side){setPreviousSource({report,lang,actor,reason,side});setUrl('');setConfirmed(false)}
 useEffect(()=>()=>{generation.current++},[]);useEffect(()=>()=>{if(url)URL.revokeObjectURL(url)},[url]);
 async function generate(){if(busy||!confirmed)return;setBusy(true);setError(false);const snapshot=latest.current,token=++generation.current;
 try{const {renderPdf}=await import('../../server/pdf-renderer');const data=await renderPdf({report:snapshot.report,lang:snapshot.lang,style:'keyboard',revision:0,digest:'unilateral-'+newLocalId(),createdAt:new Date().toISOString(),sketch:null,unilateral:{side:snapshot.actor,reason:snapshot.reason}});if(token===generation.current)setUrl(URL.createObjectURL(new Blob([new Uint8Array(data)],{type:'application/pdf'})));}catch{if(token===generation.current)setError(true)}finally{setBusy(false)}}
 return <details className="policy-panel no-print"><summary>{c.refusal}</summary><p>{c.steps}</p><p>{c.deadline}</p><label className="field"><span>{c.declarant}</span><NativeSelect value={side||actor} disabled={!!side||busy} onChange={e=>setActor(e.target.value as 'A'|'B')}><NativeSelectOption value="A">A</NativeSelectOption><NativeSelectOption value="B">B</NativeSelectOption></NativeSelect></label><TextField label={c.reason} value={reason} onChange={s=>setReason(s.slice(0,4000))}/><label className="policy-confirm"><Checkbox checked={confirmed} disabled={busy} onCheckedChange={v=>setConfirmed(v===true)}/><span>{c.confirm}</span></label><Button type="button" disabled={busy||!confirmed||report.injured==='yes'} onClick={()=>void generate()}>{busy?'…':c.generate}</Button>{url&&<a className="pdf-link" href={url} download={'Accordia-declaration-'+(side||actor)+'-'+lang+'.pdf'}>{c.download}</a>}{error&&<p role="alert">{c.error}</p>}</details>
}
