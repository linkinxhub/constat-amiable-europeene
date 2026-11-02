'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {z} from 'zod';
import {Button} from '@/components/ui/button';
import {DocumentCoverage,coverageCopy} from './document-coverage';
import {documentCopy} from './document-copy';
import {documentPhotoCopy} from './document-photo-copy';
import {DOCUMENT_BATCH_LIMIT,documentCandidates,defaultDocumentSelection,type DocumentReading} from './document-batch';
import {prepareDocument,validDocumentSource} from './document-photo';
import {DOCUMENT_ACCEPT,documentKinds,extractionResult,applyDocumentFields,documentValue,type Extraction,type DocumentField} from './document-model';
import {dictionaries,type Lang} from './i18n';
import {extraLabels} from './final-copy';
import type {Vehicle} from './model';

type Piece={id:number;file:File;kind:typeof documentKinds[number];status:'pending'|'reading'|'done'|'failed'|'cancelled'};
export function DocumentImport({value,onChange,lang,side,sessionId,defaultOpen=false}:{value:Vehicle,onChange:(v:Vehicle)=>void,lang:Lang,side:'A'|'B',sessionId?:string,defaultOpen?:boolean}){
 const c=documentCopy[lang],u=coverageCopy[lang],p=documentPhotoCopy[lang];
 const current=useRef(value);
 useLayoutEffect(()=>{current.current=value},[value]);
 const snapshot=useRef(value),controller=useRef<AbortController|null>(null),alive=useRef(true),nextId=useRef(0),running=useRef(false);
 const camera=useRef<HTMLInputElement>(null);
 const [attempt,setAttempt]=useState(0),[access,setAccess]=useState<'checking'|'admin'|'closed'|'signin'|'error'>('checking');
 const [pieces,setPieces]=useState<Piece[]>([]),[readings,setReadings]=useState<DocumentReading[]>([]),[selected,setSelected]=useState<Extraction['fields']>([]);
 const [consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[verified,setVerified]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{
  alive.current=true;let mounted=true;const ac=new AbortController(),timeout=setTimeout(()=>ac.abort(),10000);
  void fetch('/api/document-extraction',{cache:'no-store',signal:ac.signal}).then(async r=>{if(r.status===401){if(mounted)setAccess('signin');return}if(!r.ok)throw new Error();const data=z.object({available:z.boolean(),mode:z.string()}).parse(await r.json());if(mounted)setAccess(data.available&&data.mode==='admin_preview'?'admin':'closed')}).catch(()=>{if(mounted)setAccess('error')}).finally(()=>clearTimeout(timeout));
  return()=>{mounted=false;alive.current=false;ac.abort();controller.current?.abort()};
 },[attempt]);
 function add(files:File[]){
  if(running.current||readings.length)return;
  if(pieces.length+files.length>DOCUMENT_BATCH_LIMIT||files.some(f=>!validDocumentSource(f))){setMessage(p.invalid);return}
  setPieces(old=>[...old,...files.map(file=>({id:++nextId.current,file,kind:'vehicle' as const,status:'pending' as const}))]);setConsent(false);setMessage('');
 }
 function clear(){if(running.current)return;setPieces([]);setReadings([]);setSelected([]);setConsent(false);setVerified(false);setMessage('')}
 function errorMessage(e:unknown){const code=e instanceof Error?e.message:'';return ['document_quota','ai_daily_limit'].includes(code)?c.quota:code==='premium_closed'?c.closed:code==='document_invalid'?p.invalid:c.failed}
 async function analyze(){
  if(running.current||!pieces.length||!consent||access!=='admin')return;
  running.current=true;setBusy(true);setMessage('');setVerified(false);
  if(!readings.length)snapshot.current=structuredClone(current.current);
  const ac=new AbortController();controller.current=ac;let combined=[...readings];
  try{for(const piece of pieces.filter(item=>item.status!=='done')){
   if(ac.signal.aborted||!alive.current)break;
   setPieces(old=>old.map(item=>item.id===piece.id?{...item,status:'reading'}:item));let timedOut=false;
   const timeout=setTimeout(()=>{timedOut=true;ac.abort()},60000);
   try{
    const data=await prepareDocument(piece.file,ac.signal);if(ac.signal.aborted||!alive.current)break;
    const response=await fetch('/api/document-extraction',{method:'POST',cache:'no-store',signal:ac.signal,headers:{'Content-Type':'application/json','X-Accordia-Request':'1'},body:JSON.stringify({kind:piece.kind,side,sessionId,consent:true,data})});
    const raw=await response.json();if(!response.ok)throw new Error(z.object({error:z.string()}).parse(raw).error);
    const result=extractionResult.parse(raw);if(ac.signal.aborted||!alive.current)break;
    combined=[...combined,{source:String(piece.id)+' · '+c.kinds[documentKinds.indexOf(piece.kind)],result}];
    setReadings(combined);setSelected(defaultDocumentSelection(snapshot.current,combined));
    setPieces(old=>old.map(item=>item.id===piece.id?{...item,status:'done'}:item));
    if(!combined.some(reading=>reading.result.fields.length))setMessage(c.empty);
   }catch(e){
    if(!alive.current)break;
    setPieces(old=>old.map(item=>item.id===piece.id?{...item,status:ac.signal.aborted?'cancelled':'failed'}:item));
    setMessage(ac.signal.aborted?(timedOut?u.timeout:u.cancelled):errorMessage(e));
    // Stop on a failure to avoid silently charging the rest of a batch.
    break;
   }finally{clearTimeout(timeout)}
  }}finally{running.current=false;controller.current=null;if(alive.current){setBusy(false);setConsent(false);setPieces(old=>old.map(item=>item.status==='reading'?{...item,status:'cancelled'}:item))}}
 }
 const candidates=documentCandidates(readings);
 const label=(key:DocumentField)=>String((dictionaries[lang] as unknown as Record<string,unknown>)[key]||(extraLabels[lang] as Record<string,string>)[key]||key);
 const locked=busy||readings.length>0;
 return <details open={defaultOpen||undefined} className="simple-details document-import"><summary>{c.title} · {side} <span className="premium-badge">{c.badge}</span></summary><div className="entry-management">
  <h3>{p.title} · {side}</h3><p>{p.intro}</p><DocumentCoverage lang={lang}/>
  {access!=='admin'?<><p role="status">{access==='checking'?u.checking:access==='error'?u.accessError:access==='signin'?c.signin:c.closed}</p>{access==='error'&&<Button type="button" variant="outline" onClick={()=>{setAccess('checking');setAttempt(n=>n+1)}}>{u.retry}</Button>}<a href={'/pricing?lang='+lang}>{c.badge}</a>{access==='signin'&&<a href={'/account?lang='+lang}>{c.signin}</a>}</>:<>
   <p className="notice">{c.admin}</p><p>{p.limit}</p>
   <input ref={camera} hidden type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={locked} onChange={e=>{add(Array.from(e.target.files||[]));e.target.value=''}}/>
   <Button type="button" disabled={locked||pieces.length>=DOCUMENT_BATCH_LIMIT} variant="outline" onClick={()=>camera.current?.click()}>{p.camera}</Button>
   <label className="field"><span>{p.files} · {side}</span><input type="file" accept={DOCUMENT_ACCEPT} multiple disabled={locked||pieces.length>=DOCUMENT_BATCH_LIMIT} onChange={e=>{add(Array.from(e.target.files||[]));e.target.value=''}}/></label>
   {pieces.length>0&&<><h4>{p.queue} · {pieces.length}/{DOCUMENT_BATCH_LIMIT}</h4><ol className="document-queue">{pieces.map(piece=><li key={piece.id}>
    <strong>{piece.file.name}</strong><label className="field"><span>{c.type} · {piece.file.name}</span><select disabled={locked} value={piece.kind} onChange={e=>{const kind=e.target.value as Piece['kind'];setPieces(old=>old.map(item=>item.id===piece.id?{...item,kind}:item));setConsent(false)}}>{documentKinds.map((kind,i)=><option key={kind} value={kind}>{c.kinds[i]}</option>)}</select></label>
    <span role="status">{p[piece.status]}</span><Button type="button" variant="outline" disabled={locked} aria-label={p.remove+' · '+piece.file.name} onClick={()=>{setPieces(old=>old.filter(item=>item.id!==piece.id));setConsent(false)}}>{p.remove}</Button>
   </li>)}</ol><p>{c.privacy}</p>
   {pieces.some(piece=>piece.status!=='done')&&<><label className="session-choice"><input type="checkbox" checked={consent} disabled={busy} onChange={e=>setConsent(e.target.checked)}/>{p.consent}</label><Button type="button" disabled={busy||!consent} onClick={()=>void analyze()}>{busy?p.progress:p.analyze}</Button></>}
   {busy&&<Button type="button" variant="outline" onClick={()=>controller.current?.abort()}>{c.cancel}</Button>}
   {!busy&&<Button type="button" variant="outline" onClick={clear}>{p.clear}</Button>}</>}
   {candidates.length>0&&<div className="document-proposals"><h4>{p.review} · {side}</h4>
    {candidates.map(({field,values})=>{const chosen=selected.find(item=>item.field===field);return <div className="document-proposal" key={field}><div><strong>{label(field)}</strong><p>{c.current}: {documentValue(value,field)||'—'}</p>{values.length>1&&<p className="notice">{p.conflict}</p>}
     <label className="field"><span>{c.proposed} · {label(field)}</span><select disabled={busy} value={chosen?String(values.findIndex(item=>item.value===chosen.value)):''} onChange={e=>{setVerified(false);const item=e.target.value===''?null:values[Number(e.target.value)];setSelected(old=>[...old.filter(item=>item.field!==field),...(item?[{field,value:item.value,confidence:item.confidence}]:[])])}}><option value="">{p.skip}</option>{values.map((item,i)=><option key={i} value={i}>{item.value}{item.confidence==='uncertain'?' · '+c.uncertain:''}</option>)}</select></label>
     {values.map(item=><p key={item.value}>{item.value} — {p.source}: {item.sources.join(', ')}{item.confidence==='uncertain'&&<em>{c.uncertain}</em>}</p>)}
    </div></div>})}
    <label className="session-choice"><input type="checkbox" checked={verified} disabled={busy} onChange={e=>setVerified(e.target.checked)}/>{c.verify}</label>
    <Button type="button" disabled={busy||!verified||!selected.length} onClick={()=>{try{const next=applyDocumentFields(current.current,snapshot.current,selected);onChange(next);snapshot.current=structuredClone(next);setPieces(old=>old.filter(item=>item.status!=='done'));setReadings([]);setSelected([]);setConsent(false);setVerified(false);setMessage(c.done)}catch{setMessage(c.conflict);setVerified(false)}}}>{c.apply} ({selected.length})</Button>
   </div>}
  </>}
  <p className="notice">{p.manual}</p>{message&&<p role="status" className="notice">{message}</p>}
 </div></details>
}
