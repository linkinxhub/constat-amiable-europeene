'use client';
import {documentStatusCopy} from './document-status-copy';
import {DocumentStatus} from './document-status-panel';
import {missingFields} from './completeness';
import {quickFlowCopy} from './quick-flow-copy';
import {FlowSteps} from './flow-steps';
import {usageCopy} from './usage-guide';
import {useLayoutEffect,useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {styles,type FinalStyle} from './final-model';
import {finalCopy} from './final-copy';
import type {Report} from './model';
import type {Lang} from './i18n';

export function LocalPdf({report,lang,style,onStyle,onEdit}:{report:Report,lang:Lang,style:FinalStyle,onStyle:(style:FinalStyle)=>void,onEdit:()=>void}){
 const [busy,setBusy]=useState(false),[url,setUrl]=useState(''),[error,setError]=useState(false);
 const mounted=useRef(true);useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
 const latest=useRef({report,lang,style});useLayoutEffect(()=>{latest.current={report,lang,style}},[report,lang,style]);
 const incomplete=missingFields(report).length>0;const c=finalCopy[lang],labels={keyboard:c.keyboard,'blue-pen':c.blue,'black-pen':c.black};
 const [previousSource,setPreviousSource]=useState({report,lang,style});if(previousSource.report!==report||previousSource.lang!==lang||previousSource.style!==style){setPreviousSource({report,lang,style});setUrl('');setError(false)}
 useEffect(()=>()=>{if(url)URL.revokeObjectURL(url)},[url]);
 async function generate(){
  if(busy)return;setBusy(true);setError(false);const snapshot=latest.current;
  try{
   const {renderPdf}=await import('../../server/pdf-renderer');
   const digest=finalCopy[snapshot.lang].unsigned;
   const data=await renderPdf({report:snapshot.report,style:snapshot.style,lang:snapshot.lang,revision:0,digest,createdAt:new Date().toISOString(),sketch:null});
   if(mounted.current&&latest.current.report===snapshot.report&&latest.current.lang===snapshot.lang&&latest.current.style===snapshot.style)setUrl(URL.createObjectURL(new Blob([new Uint8Array(data)],{type:'application/pdf'})));
  }catch{if(mounted.current&&latest.current.report===snapshot.report&&latest.current.lang===snapshot.lang&&latest.current.style===snapshot.style)setError(true)}finally{if(mounted.current)setBusy(false)}
 }
 return <section className="final-panel no-print"><FlowSteps lang={lang} phase={4}/><h2>{c.format}</h2><DocumentStatus lang={lang} prepared={!!url} unsigned/><Button type="button" variant="outline" onClick={onEdit}>{usageCopy[lang][1]}</Button><p>{({fr:"Votre modèle fourni est en français ; la langue choisie s’applique aux annexes.",en:"Your supplied template is French; the selected language applies to annexes.",de:"Ihre Vorlage ist französisch; die gewählte Sprache gilt für Anlagen.",nl:"Uw sjabloon is Frans; de gekozen taal geldt voor bijlagen."})[lang]}</p><p role="status" className={incomplete?'notice':'quick-completion'}>{incomplete?quickFlowCopy[lang].incomplete:quickFlowCopy[lang].ready}</p><p>{c.unsigned} · {c.full}</p><details className="pdf-appearance"><summary>{documentStatusCopy[lang].appearance} · {labels[style]}</summary><div className="final-styles" role="group" aria-label={c.format}>{styles.map(s=><Button type="button" key={s} variant="outline" disabled={busy} className={'style-card '+s} aria-pressed={style===s} onClick={()=>onStyle(s)}><span>Aa</span>{labels[s]}</Button>)}</div></details><p>{c.language}: {lang.toUpperCase()}</p><Button type="button" disabled={busy||report.injured==='yes'} onClick={()=>void generate()}>{busy?'…':c.prepare}</Button>{url&&<p><a className="pdf-link" href={url} target="_blank" rel="noopener">{c.preview}</a> <a className="pdf-link" href={url} download={'Accordia-'+(incomplete?'INCOMPLETE-':'')+style+'-'+lang+'.pdf'}>PDF ↓</a></p>}{error&&<p role="alert">{c.error}</p>}</section>
}
