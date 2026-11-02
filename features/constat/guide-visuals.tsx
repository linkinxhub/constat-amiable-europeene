'use client';
import type {ParticipationMode} from './participation-model';
import {useEffect,useState} from 'react';
import {Camera,FileText,CheckCircle2,QrCode,Smartphone,ClipboardCheck,ArrowRight,Play,Pause} from 'lucide-react';
import {Button} from '@/components/ui/button';
import type {Lang} from './i18n';
import {guideVisualCopy} from './guide-visual-copy';
import {qrScanCopy} from './qr-scan-copy';
import {documentFirstCopy} from './document-first-copy';
import {reviewEntryCopy} from './review-entry-copy';
export function GuideVisuals({lang,mode}:{lang:Lang;mode?:ParticipationMode}){
 const [selectedTopic,setTopic]=useState(0),[playing,setPlaying]=useState(false),[reduced,setReduced]=useState(false);const topic=mode&&mode!=='two-devices'&&selectedTopic===0?1:selectedTopic;const c=guideVisualCopy[lang];
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const change=()=>{setReduced(media.matches);if(media.matches)setPlaying(false)};change();media.addEventListener('change',change);const pause=()=>{if(document.hidden)setPlaying(false)};document.addEventListener('visibilitychange',pause);return()=>{media.removeEventListener('change',change);document.removeEventListener('visibilitychange',pause)}},[]);
 const texts=[qrScanCopy[lang].guide,documentFirstCopy[lang].guide,reviewEntryCopy[lang].guide];const icons=topic===0?[QrCode,Smartphone,CheckCircle2]:topic===1?[Camera,FileText,ClipboardCheck]:[FileText,ClipboardCheck,CheckCircle2];
 return <section className={'guide-visuals '+(playing&&!reduced?'is-playing':'')} aria-label={c.title}><h2>{c.title}</h2><p className="muted">{c.demo}</p><div className="guide-topic-buttons" role="group" aria-label={c.title}>{c.topics.map((title,i)=>i===0&&mode&&mode!=='two-devices'?null:<Button type="button" variant="outline" key={title} aria-pressed={topic===i} onClick={()=>setTopic(i)}>{title}</Button>)}</div><div className="guide-drawing" key={topic}>{icons.map((Icon,i)=><figure className={'guide-picture guide-picture-'+i} key={i}><div className="guide-picture-art" aria-hidden="true"><span className="guide-phone"><Icon size={42}/>{topic===0&&i===0&&<span className="guide-scan-line"/>}{topic===1&&i===1&&<span className="guide-paper-lines"><i/><i/><i/></span>}</span>{i<2&&<ArrowRight className="guide-picture-arrow"/>}</div><figcaption><b>{i+1}</b> {c.captions[topic][i]}</figcaption></figure>)}</div><p className="notice">{c.limits[topic]}</p><Button type="button" variant="outline" disabled={reduced} aria-pressed={playing&&!reduced} onClick={()=>setPlaying(v=>!v)}>{playing&&!reduced?<Pause size={16}/>:<Play size={16}/>} {playing&&!reduced?c.pause:c.play}</Button>{reduced&&<p className="muted">{c.motion}</p>}<details className="guide-visual-explanation"><summary>{c.full}</summary><p>{texts[topic]}</p></details></section>;
}
