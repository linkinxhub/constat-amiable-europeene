'use client';
import type {ReviewedEntry} from './document-first-model';
import {quickFlowCopy} from './quick-flow-copy';
import {SaveStatus} from './save-status';
import {EntryMode} from './entry-mode';
import {Questionnaire} from './questionnaire';

import {retentionDeadline} from './retention';
import {RefusalPanel} from './refusal-panel';
import {sha256} from '@noble/hashes/sha2.js';
import {bytesToHex} from '@noble/hashes/utils.js';
import {useLayoutEffect,useEffect,useMemo,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {dictionaries,type Lang} from './i18n';
import {complete,type Report} from './model';
import {reportContentKey,deviceCompletionKey,deviceSideReady} from './same-device-model';
import {deviceCopy} from './device-copy';
import {finalCopy} from './final-copy';
import {styles,type FinalStyle} from './final-model';
import {VehicleForm,TextField} from './fields';
import {focusReviewEditor} from './review-navigation';
import {FormDetails} from './form-details';
import {Evidence} from './evidence';
import {SignaturePad} from './signature-pad';
import {CompletenessPanel} from './completeness-panel';
import {UsageGuide} from './usage-guide';
import {newLocalId,saveLocalDocument} from './storage';
import {LocalDocuments,documentCopy} from './local-documents';
import type {Signature} from '../../server/pdf-renderer';

type History={id:string,reportId:string,url:string,label:string,pdf:Blob,title:string,createdAt:string,expiresAt:number,saved?:boolean};
type Prepared={key:string,bytes:Uint8Array,url:string,digest:string,lang:Lang,version:number};
export function SameDevice({report,lang,onChange,onBack,onSave,active,saved}:{report:Report,lang:Lang,onSave:()=>Promise<boolean>,active:boolean,saved:boolean,onChange:(r:Report)=>void,onBack:()=>void}){
 const [documentReviewed,setDocumentReviewed]=useState<ReviewedEntry>();const [guided,setGuided]=useState(true);const [side,setSide]=useState<0|1>(report.start?.ownerSide==='B'?1:0),[style,setStyle]=useState<FinalStyle>('keyboard'),[pdfLang,setPdfLang]=useState<Lang>(lang);
 const [completed,setCompleted]=useState<[string,string]>(['','']),[review,setReview]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const [prepared,setPrepared]=useState<Prepared|null>(null),[history,setHistory]=useState<History[]>([]);
 const [signatures,setSignatures]=useState<[Signature|null,Signature|null]>([null,null]),[signature,setSignature]=useState(''),[kind,setKind]=useState<'drawn'|'imported'>('drawn'),[consent,setConsent]=useState(false),[viewed,setViewed]=useState(false);
 const language=report.readingLanguages[side],t=dictionaries[language],c=deviceCopy[language],f=finalCopy[language];
 const [storeConsent,setStoreConsent]=useState(''),[stored,setStored]=useState(0);const dc=documentCopy[language];
 const key=useMemo(()=>reportContentKey(report)+'|'+style+'|'+pdfLang,[report,style,pdfLang]),latest=useRef(key);useLayoutEffect(()=>{latest.current=key},[key]);const current=useRef(report);useLayoutEffect(()=>{current.current=report},[report]);
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{if(heading.current?.getClientRects().length){heading.current.scrollIntoView({behavior:'smooth',block:'start'});heading.current.focus({preventScroll:true})}},[side,review]);
 const alive=useRef(true),urls=useRef<string[]>([]),version=useRef(0);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;urls.current.forEach(URL.revokeObjectURL)}},[]);
 const [previousKey,setPreviousKey]=useState(key);if(previousKey!==key){setPreviousKey(key);setPrepared(null);setSignatures([null,null]);setSignature('');setConsent(false);setViewed(false);setReview(false);setMessage('');setStoreConsent('')}
 
 const [previousSide,setPreviousSide]=useState(side);if(previousSide!==side){setPreviousSide(side);setSignature('');setConsent(false);setViewed(false)}
 const [previousReportId,setPreviousReportId]=useState(report.id);if(previousReportId!==report.id){setPreviousReportId(report.id);setCompleted(['','']);setSide(report.start?.ownerSide==='B'?1:0)}
 useEffect(()=>{if(!history.some(h=>!h.saved)&&!(signatures.some(Boolean)&&!signatures.every(Boolean)))return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue=''};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[history,signatures]);
 const keys=useMemo(()=>[deviceCompletionKey(report,0),deviceCompletionKey(report,1)],[report]),done=keys.map((k,i)=>completed[i]===k);
 const [previousReport,setPreviousReport]=useState(report);if(previousReport!==report){setPreviousReport(report);setCompleted(previous=>{const a=previous[0]===keys[0]?previous[0]:'',b=previous[1]===keys[1]?previous[1]:'';return a===previous[0]&&b===previous[1]?previous:[a,b]})}
 const ready=report.count==='2'&&complete(report)&&!!report.otherObjectsDamage&&!!report.otherVehiclesDamage&&report.vehicles.every(v=>v.standardConfirmed&&(v.standardCircumstances?.length||v.observations.trim()));
 function ownReady(){return deviceSideReady(report,side)}
 function finishPart(){if(busy||!ownReady()){setMessage(c.missing);return;}setCompleted(d=>side===0?[keys[0],d[1]]:[d[0],keys[1]]);if(side===0)setSide(1);else requestAnimationFrame(()=>document.getElementById('device-document')?.scrollIntoView({behavior:'smooth'}));}
 function editPart(){setGuided(false);setReview(false);focusReviewEditor(1,side,true);setCompleted(d=>side===0?['',d[1]]:[d[0],'']);}

 function editVehicle(v:Report['vehicles'][number]){const vehicles=[...report.vehicles] as Report['vehicles'];vehicles[side]=v;onChange({...report,vehicles})}
 function blob(bytes:Uint8Array){if(history.reduce((n,h)=>n+h.pdf.size,0)+bytes.byteLength>64*1024*1024)throw new Error('memory_limit');const url=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:'application/pdf'}));urls.current.push(url);return url}
 async function prepare(){if(busy||history.length>=19||!report.id||!ready||!done.every(Boolean))return;setBusy(true);setMessage('');const snapshot=key;try{const {renderPdf}=await import('../../server/pdf-renderer');const bytes=await renderPdf({report,style,lang:pdfLang,revision:++version.current,digest:deviceCopy[pdfLang].local,createdAt:new Date().toISOString(),sketch:null});const digest=bytesToHex(sha256(bytes));if(!alive.current||latest.current!==snapshot)return;const url=blob(bytes);setPrepared({key:snapshot,bytes,url,digest,lang:pdfLang,version:version.current});setHistory(h=>[...h,entry(bytes,url,`v${version.current} · ${finalCopy[pdfLang].unsigned}`)]);setSignatures([null,null]);setSide(0);setReview(true);setSignature('');setConsent(false);setViewed(false);}catch(e){if(alive.current)setMessage(e instanceof Error&&e.message==='memory_limit'?dc.limit:c.error)}finally{if(alive.current)setBusy(false)}}
 async function sign(){if(busy||!prepared||prepared.key!==key||!signature||!consent||!viewed||signatures[side])return;setBusy(true);setMessage('');const snapshot=key,next=[...signatures] as [Signature|null,Signature|null];next[side]={data:signature,kind,at:new Date().toISOString(),by:'local-'+(side===0?'A':'B')};try{if(next[0]&&next[1]){const {stampPdf}=await import('../../server/pdf-renderer');const bytes=await stampPdf(prepared.bytes,[next[0],next[1]],prepared.lang,prepared.digest,deviceCopy[prepared.lang].local);if(!alive.current||latest.current!==snapshot)return;const url=blob(bytes);setHistory(h=>[...h,entry(bytes,url,`v${prepared.version} · ${c.download}`)]);}if(alive.current&&latest.current===snapshot){setSignatures(next);setSignature('');setConsent(false);setViewed(false);if(side===0)setSide(1)}}catch(e){if(alive.current)setMessage(e instanceof Error&&e.message==='memory_limit'?dc.limit:c.error)}finally{if(alive.current)setBusy(false)}}
 function entry(bytes:Uint8Array,url:string,label:string):History{return {id:newLocalId(),reportId:report.id,url,label,pdf:new Blob([new Uint8Array(bytes)],{type:'application/pdf'}),title:report.place,expiresAt:retentionDeadline(report.localCreatedAt||report.updated||new Date().toISOString()),createdAt:new Date().toISOString()}}
 async function save(){if(busy)return;setBusy(true);setMessage('');try{const ok=await onSave();if(alive.current)setMessage(ok?'':c.error)}finally{if(alive.current)setBusy(false)}}
 async function storePdf(h:History){if(storeConsent!==h.id||busy)return;setBusy(true);try{await saveLocalDocument({id:h.id,reportId:h.reportId,label:h.label,title:h.title,createdAt:h.createdAt,expiresAt:h.expiresAt,size:h.pdf.size},h.pdf);if(alive.current){setHistory(rows=>rows.map(row=>row.id===h.id?{...row,saved:true}:row));setStored(n=>n+1);setStoreConsent('');setMessage(dc.saved)}}catch{if(alive.current)setMessage(dc.error)}finally{if(alive.current)setBusy(false)}}
 const reportHistory=history.filter(h=>h.reportId===report.id),otherHistory=history.filter(h=>h.reportId!==report.id);
 function release(h:History){if(!h.saved||h.url===prepared?.url)return;URL.revokeObjectURL(h.url);urls.current=urls.current.filter(u=>u!==h.url);setHistory(rows=>rows.filter(row=>row.id!==h.id))}

 return <section className="form-panel same-device" lang={language}>
  <RefusalPanel report={report} lang={language} side={side===0?'A':'B'}/><h2 ref={heading} tabIndex={-1}>{c.title}</h2><p>{c.hint}</p><p className="notice">{dc.notice}</p>
  <div className="device-actions"><Button type="button" variant="outline" disabled={busy} onClick={onBack}>{c.back}</Button><Button type="button" variant="outline" disabled={busy} onClick={()=>void save()}>{c.save}</Button></div>
  <details><summary>{dictionaries[language].guide}</summary><UsageGuide lang={language}/></details>
  <SaveStatus lang={language} saved={saved} dirty={!saved}/><p>{c.handoff} <strong>{side===0?'A':'B'}</strong></p>
  <div className="device-actions" role="group" aria-label={c.title}>{([0,1] as const).map(i=><Button type="button" key={i} disabled={busy} variant="outline" aria-pressed={side===i} onClick={()=>setSide(i)}>{i===0?'A':'B'} · {signatures[i]?'✓ '+f.signature:done[i]?c.done:c.pending}</Button>)}</div>
  <label className="field"><span>{t.lang} · {side===0?'A':'B'}</span><NativeSelect value={language} disabled={busy} onChange={e=>{const readingLanguages=[...report.readingLanguages] as Report['readingLanguages'];readingLanguages[side]=e.target.value as Lang;onChange({...report,readingLanguages})}}>{(['fr','en','de','nl'] as const).map(l=><NativeSelectOption key={l} value={l}>{l.toUpperCase()}</NativeSelectOption>)}</NativeSelect></label>
  <div className="device-actions"><Button type="button" variant="outline" disabled={busy} onClick={editPart}>{c.edit}</Button>{prepared&&<Button type="button" disabled={busy} onClick={()=>setReview(true)}>{c.review}</Button>}</div>
  {!review&&<><p role="status" className="quick-completion">{done.every(Boolean)?quickFlowCopy[language].both:done[side]?quickFlowCopy[language].saved:''}</p><details className="device-entry" open={!done[side]}><summary>{c.edit} · {side===0?'A':'B'}</summary><fieldset data-review-vehicle={side} disabled={busy}><EntryMode key={'entry-'+report.id+side} report={report} side={side} lang={language} guided={guided} disabled={busy} onChange={onChange} onGuided={reviewed=>{setDocumentReviewed(reviewed);setGuided(true)}} onClassic={()=>setGuided(false)}/>{guided?<Questionnaire documentReviewed={documentReviewed} key={'questions-'+report.id+side} report={report} lang={language} side={side} common={side===0} finishLabel={c.finish} onChange={onChange} onDone={finishPart}/>:<><VehicleForm importScope={report.id} value={report.vehicles[side]} index={side} t={t} onChange={editVehicle}/><FormDetails value={report.vehicles[side]} lang={language} onChange={editVehicle}/><TextField label={t.observations} value={report.vehicles[side].observations} onChange={observations=>editVehicle({...report.vehicles[side],observations})}/><Button type="button" disabled={!ownReady()} onClick={finishPart}>{c.finish}</Button></>}</fieldset></details><details className="device-evidence"><summary>{quickFlowCopy[language].photos}</summary><fieldset disabled={busy}><Evidence key={'evidence-'+report.id+side} r={report} t={t} side={side===0?'A':'B'} change={onChange}/></fieldset></details></>}
  <p>{c.correction}</p><CompletenessPanel final r={report} lang={language} onGo={(n,vehicle)=>{if(n===0)onBack();else {setGuided(false);if(vehicle!==undefined)setSide(vehicle===0?0:1);setReview(false);focusReviewEditor(n,vehicle??side,n===1)}}}/>
  {!ready&&<p className="notice">{c.missing}</p>}
  <div id="device-document" className="final-styles" role="group" aria-label={f.format}>{styles.map(s=><Button type="button" key={s} variant="outline" disabled={busy} aria-pressed={style===s} onClick={()=>setStyle(s)}>{s==='keyboard'?f.keyboard:s==='blue-pen'?f.blue:f.black}</Button>)}</div>
  <label className="field"><span>{f.language}</span><NativeSelect value={pdfLang} disabled={busy} onChange={e=>setPdfLang(e.target.value as Lang)}>{(['fr','en','de','nl'] as const).map(l=><NativeSelectOption value={l} key={l}>{l.toUpperCase()}</NativeSelectOption>)}</NativeSelect></label>
  <Button type="button" disabled={busy||history.length>=19||!ready||!done.every(Boolean)} onClick={()=>void prepare()}>{c.prepare}</Button>
  {review&&prepared&&prepared.key===key&&<section className="final-panel"><h3>{c.review} · {side===0?'A':'B'}</h3><a className="pdf-link" href={prepared.url} target="_blank" rel="noopener" onClick={()=>setViewed(true)}>{c.open}</a>{!signatures[side]?<><SignaturePad key={prepared.digest+side} lang={language} disabled={busy} onChange={(data,kind)=>{setSignature(data);setKind(kind);setConsent(false)}}/><label className="signature-consent"><Checkbox checked={consent} disabled={busy||!viewed} onCheckedChange={v=>setConsent(v===true)}/><span>{c.consent}</span></label><Button type="button" disabled={busy||!viewed||!consent||!signature} onClick={()=>void sign()}>{c.sign}</Button></>:<p role="status">✓ {f.signature} · {side===0?'A':'B'}</p>}</section>}
  {history.length>=19&&<p className="notice">{dc.limit}</p>}
  {reportHistory.length>0&&<section><h3>{c.history}</h3>{reportHistory.map(h=><article key={h.id}><a className="pdf-link" href={h.url} download={`Accordia-${h.id}.pdf`}>{h.label}</a>{h.saved?<><p>{dc.saved}</p><Button type="button" variant="ghost" disabled={h.url===prepared?.url} onClick={()=>release(h)}>{({fr:'Fermer cette copie en mémoire',en:'Close this in-memory copy',de:'Diese offene Kopie schließen',nl:'Deze geopende kopie sluiten'})[language]}</Button></>:<><label className="signature-consent"><Checkbox checked={storeConsent===h.id} onCheckedChange={v=>setStoreConsent(v===true?h.id:'')}/><span>{dc.consent}</span></label><Button type="button" variant="outline" disabled={busy||storeConsent!==h.id} onClick={()=>void storePdf(h)}>{dc.save}</Button></>}</article>)}</section>}
  {otherHistory.length>0&&<details><summary>{({fr:'PDF des autres constats ouverts sur cette page',en:'PDFs from other reports open on this page',de:'PDFs anderer Berichte auf dieser Seite',nl:'PDF’s van andere dossiers op deze pagina'})[language]}</summary>{otherHistory.map(h=><article key={h.id}><p>{h.title} · {h.reportId} · {h.label}</p><a className="pdf-link" href={h.url} download={`Accordia-${h.id}.pdf`}>{h.label}</a>{h.saved?<Button type="button" variant="ghost" onClick={()=>release(h)}>{({fr:'Fermer cette copie en mémoire',en:'Close this in-memory copy',de:'Diese offene Kopie schließen',nl:'Deze geopende kopie sluiten'})[language]}</Button>:<><label className="signature-consent"><Checkbox checked={storeConsent===h.id} onCheckedChange={v=>setStoreConsent(v===true?h.id:'')}/><span>{dc.consent}</span></label><Button type="button" disabled={busy||storeConsent!==h.id} onClick={()=>void storePdf(h)}>{dc.save}</Button></>}</article>)}</details>}
  {active&&<LocalDocuments reportId={report.id} lang={language} refresh={stored}/>}

  {message&&<p role="status">{message}</p>}
 </section>
}
