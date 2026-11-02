'use client';
import {VehicleKindFields} from './vehicle-kind-fields';
import {visibleVehicleExtras} from './vehicle-kind';
import {vehicleKindCopy} from './vehicle-kind-copy';
import {remainingDocumentPages,reviewedField,type ReviewedEntry} from './document-first-model';
import {documentFirstCopy} from './document-first-copy';
import {useBrowserReady} from './browser-ready';
import {quickFlowCopy} from './quick-flow-copy';
import {damageSuggestions} from './damage-suggestions';
import {useLayoutEffect,useEffect,useRef,useState} from 'react';
import {experienceCopy} from './experience-copy';
import {FlowSteps} from './flow-steps';
import {DocumentImport} from './document-import';
import {Button} from '@/components/ui/button';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import type {Report,Vehicle} from './model';
import {dictionaries,type Lang} from './i18n';
import {questionnairePages,questionGroups,questionnaireCursor,questionnaireIssues,populatedOptions,safeOptions} from './questionnaire-model';
import {questionnaireCopy} from './questionnaire-copy';
import {detailGroups} from './detail-groups';
import {extraLabels,finalCopy} from './final-copy';
import {simpleCopy} from './simple-copy';
import {fieldPresets} from './presets';
import {Field,TextField,Choice} from './fields';
import {FormDetails} from './form-details';
import {TimeZoneField} from './time-zone-field';
import {Location} from './location';
import {ConfirmedLocation} from './confirmed-location';
import {cityLabel,mergeAddress} from './geocoding';
export function Questionnaire({report,lang,onChange,onDone,side,common=true,sessionId,finishLabel,documentReviewed}:{documentReviewed?:ReviewedEntry,finishLabel?:string,report:Report,lang:Lang,onChange:(r:Report)=>void,onDone:()=>void,side?:0|1,common?:boolean,sessionId?:string}){
 const x=experienceCopy[lang],c=questionnaireCopy[lang],t=dictionaries[lang],f=finalCopy[lang];
 const [selections,setSelections]=useState<Record<string,boolean>>(()=>populatedOptions(report));
 const [showAll,setShowAll]=useState(false);const reviewed=showAll?undefined:documentReviewed;
 const pages=remainingDocumentPages(questionnairePages(report.count,side,common,selections),report,reviewed),[pageId,setPageId]=useState(pages[0].id);
 const [showIssues,setShowIssues]=useState(false),[cursorLoaded,setCursorLoaded]=useState(false);
 const cursorKey='accordia-questionnaire:'+report.id+':'+(side??'all')+':'+common;
 const browserReady=useBrowserReady(),[restoredKey,setRestoredKey]=useState('');if(browserReady&&restoredKey!==cursorKey){setRestoredKey(cursorKey);try{const raw=sessionStorage.getItem(cursorKey+':options');const restored={...populatedOptions(report),...safeOptions(raw?JSON.parse(raw):null)};setSelections(restored);setPageId(questionnaireCursor(questionnairePages(report.count,side,common,restored),sessionStorage.getItem(cursorKey)))}catch{};setCursorLoaded(true)}
 useEffect(()=>{if(cursorLoaded)try{sessionStorage.setItem(cursorKey,pageId);sessionStorage.setItem(cursorKey+':options',JSON.stringify(selections))}catch{}},[cursorKey,pageId,cursorLoaded,selections]);
 const index=Math.max(0,pages.findIndex(p=>p.id===pageId)),p=pages[index];
 const heading=useRef<HTMLHeadingElement>(null),current=useRef(report);useLayoutEffect(()=>{current.current=report},[report]);
 useEffect(()=>{heading.current?.focus()},[p.id]);
 const patch=(v:Partial<Report>)=>onChange({...current.current,...v});
 const vehicle=report.vehicles[p.side??0];
 function update(v:Vehicle){const vehicles=[...current.current.vehicles] as Report['vehicles'];vehicles[p.side??0]=v;patch({vehicles})}
 const issues=questionnaireIssues(report,p,side===undefined);
 function advance(){if(issues.length){setShowIssues(true);requestAnimationFrame(()=>{const root=heading.current?.closest('.questionnaire'),target=root?.querySelector<HTMLElement>('[aria-invalid="true"]')||root?.querySelector<HTMLElement>('[role="alert"]');target?.focus();target?.scrollIntoView({block:'center',behavior:'smooth'})});return;}setShowIssues(false);if(index===pages.length-1)onDone();else setPageId(pages[index+1].id)}
 const title=p.kind==='vehicleType'?vehicleKindCopy[lang].title:p.kind==='options'?x.optional:p.kind==='base'?quickFlowCopy[lang].groups[p.group!]:p.kind==='extra'?simpleCopy[lang].groups[p.group!]:p.kind==='circumstances'?t.circumstancesTitle:c[p.kind];
 return <section className="questionnaire" aria-label={c.title}><>{documentReviewed?.reportId===report.id&&(side===undefined||documentReviewed.side===side)&&<div className="notice"><p>{documentFirstCopy[lang].remaining}</p><Button type="button" variant="outline" aria-pressed={showAll} onClick={()=>setShowAll(v=>!v)}>{showAll?documentFirstCopy[lang].remainingButton:documentFirstCopy[lang].all}</Button></div>}</><FlowSteps lang={lang} phase={['safety','time','place','common'].includes(p.kind)?0:['base','extra','options','vehicleType'].includes(p.kind)?1:2}/><div className="questionnaire-position"><p className="questionnaire-progress">{c.title} · {c.free}</p><span>{c.position} {index+1} / {pages.length}</span><progress aria-label={c.position} value={index+1} max={pages.length}/></div><h2 ref={heading} tabIndex={-1}>{p.side!==undefined?`${t.vehicle} ${p.side===0?'A':'B'} · `:''}{title}</h2>
 {p.kind==='vehicleType'&&<VehicleKindFields value={vehicle} lang={lang} onChange={update}/> }
 {p.kind==='safety'&&<><Choice invalid={showIssues&&issues.includes('injured')} label={t.injured} value={report.injured} options={[["yes",t.yes],["no",t.no]]} onChange={injured=>patch({injured:injured as Report['injured']})}/>{report.injured==='yes'&&<p role="alert" className="error">{t.injuredNotice} <a href="tel:112">112</a></p>}{side===undefined&&<Choice invalid={showIssues&&issues.includes('count')} label={t.count} value={report.count} options={[["1","1"],["2","2"]]} onChange={count=>patch({count:count as Report['count'],start:count==='1'&&report.start?{...report.start,ownerSide:'A'}:report.start})}/>}</>}
 {p.kind==='time'&&<><Field invalid={showIssues&&issues.includes('date')} label={t.date} type="date" value={report.date} required onChange={date=>patch({date})}/><Field invalid={showIssues&&issues.includes('time')} label={t.time} type="time" value={report.time} required onChange={time=>patch({time})}/><TimeZoneField report={report} lang={lang} onChange={timeZone=>patch({timeZone})}/></>}
 {p.kind==='place'&&<><Location lang={lang} value={report.location} place={report.place} city={report.city} country={report.country} onChange={location=>patch({location,confirmedLocation:undefined})} onAddress={(a,stamp,before)=>onChange(mergeAddress(current.current,a,stamp,before))}/><ConfirmedLocation key={report.location?.capturedAt||report.id} report={report} lang={lang} onChange={confirmedLocation=>patch({confirmedLocation})}/><Field invalid={showIssues&&issues.includes('place')} label={t.place} value={report.place} required onChange={place=>patch({place})}/><Field label={cityLabel[lang]} value={report.city||''} onChange={city=>patch({city})}/><label className="field"><span>{t.country} *</span><NativeSelect value={report.country} onChange={e=>patch({country:e.target.value as Report['country']})}>{(['BE','FR','DE','NL','ES','OTHER'] as const).map((v,i)=><NativeSelectOption key={v} value={v}>{t.countries[i]}</NativeSelectOption>)}</NativeSelect></label></>}
 {p.kind==='common'&&<><Choice invalid={showIssues&&issues.includes('thirdVehicles')} label={f.thirdVehicles} value={report.otherVehiclesDamage||''} options={[["yes",t.yes],["no",t.no]]} onChange={v=>patch({otherVehiclesDamage:v as 'yes'|'no'})}/><Choice invalid={showIssues&&issues.includes('thirdObjects')} label={f.thirdObjects} value={report.otherObjectsDamage||''} options={[["yes",t.yes],["no",t.no]]} onChange={v=>patch({otherObjectsDamage:v as 'yes'|'no'})}/></>}
 {p.kind==='base'&&p.group===0&&<DocumentImport key={report.id+String(p.side)} value={vehicle} lang={lang} side={p.side===0?'A':'B'} sessionId={sessionId} onChange={update}/>}
 {p.kind==='base'&&questionGroups[p.group!].filter(k=>!reviewedField(report,reviewed,p.side!,k)).map(k=>(k==='damage'||k==='observations')?<TextField lang={lang} suggestions={k==='damage'?damageSuggestions[lang]:[]} key={k} label={t[k]} value={vehicle[k]} onChange={s=>update({...vehicle,[k]:s})}/>:<Field key={k} lang={lang} presets={fieldPresets(k,lang,vehicle.kind)} invalid={showIssues&&issues.includes(k)} label={vehicle.kind&&k==='plate'?vehicleKindCopy[lang].plate:vehicle.kind&&k==='model'?vehicleKindCopy[lang].model:t[k as 'driver']} value={vehicle[k] as string} type={k==='email'?'email':'text'} required={!['email','address'].includes(k)} onChange={s=>update({...vehicle,[k]:s})}/>)}
 {p.kind==='extra'&&(visibleVehicleExtras(vehicle,detailGroups[p.group!].slice(p.offset,p.offset!+3)) as typeof detailGroups[number]).filter(k=>!reviewedField(report,reviewed,p.side!,k,true)).map(k=><Field key={k} lang={lang} presets={fieldPresets(k,lang,vehicle.kind)} label={extraLabels[lang][k]+' ('+x.optionalField+')'} value={vehicle.extra?.[k]||''} type={['insuranceFrom','insuranceUntil','driverBirthDate','licenceUntil'].includes(k)?'date':'text'} onChange={s=>update({...vehicle,extra:{...vehicle.extra,[k]:s}})}/>)}
 {p.kind==='options'&&<><p>{x.optionalHint}</p>{detailGroups.map((_,g)=><label className="session-choice" key={g}><input type="checkbox" checked={!!selections[`${p.side}-${g}`]} onChange={e=>setSelections(old=>({...old,[`${p.side}-${g}`]:e.target.checked}))}/>{simpleCopy[lang].groups[g]}</label>)}</>}
 {p.kind==='circumstances' &&<FormDetails mode="circumstances" value={vehicle} lang={lang} onChange={update}/>}
 {p.kind==='witnesses'&&<TextField label={t.witnesses} value={report.witnesses} onChange={witnesses=>patch({witnesses})}/>}
 {showIssues&&issues.length>0&&<p tabIndex={-1} role="alert" className="error">{c.required} {issues.map(k=>String((vehicleKindCopy[lang] as unknown as Record<string,unknown>)[k]||(t as unknown as Record<string,unknown>)[k]||(f as unknown as Record<string,unknown>)[k]||k)).join(" · ")}</p>}<div className="form-actions"><Button type="button" variant="outline" disabled={index===0} onClick={()=>{setShowIssues(false);setPageId(pages[index-1].id)}}>{c.back}</Button><Button type="button" disabled={common&&report.injured==='yes'} onClick={advance}>{index===pages.length-1?(finishLabel||c.finish):c.next}</Button></div><details className="questionnaire-help"><summary>{x.details}</summary><p>{c.hint}</p><p>{c.review}</p><p>{c.save}</p></details></section>
}
