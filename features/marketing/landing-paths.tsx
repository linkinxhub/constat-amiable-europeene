'use client';
import {useState} from 'react';
import {ArrowRight,Check,Smartphone,UsersRound,UserRound} from 'lucide-react';
import type {Lang} from '../constat/i18n';
import {onboardingCopy} from '../constat/onboarding-copy';
import {landingRefreshCopy} from './landing-refresh-copy';
export function LandingPaths({lang}:{lang:Lang}){
 const [selected,setSelected]=useState(0),c=landingRefreshCopy[lang],m=onboardingCopy[lang];
 const icons=[UserRound,UsersRound,Smartphone],hints=[m.soloHint,m.sameHint,m.remoteHint],titles=[m.solo,m.same,m.remote];
 return <section className="marketing-paths" id="paths" aria-labelledby="paths-heading"><header><p className="marketing-eyebrow">{c.pathPreview}</p><h2 id="paths-heading">{c.pathsTitle}</h2><p>{c.pathsIntro}</p></header><div className="marketing-path-grid">{c.pathLabels.map((label,i)=>{const Icon=icons[i];return <button type="button" key={label} aria-pressed={selected===i} onClick={()=>setSelected(i)}><Icon aria-hidden="true"/><span><strong>{label}</strong><small>{titles[i]}</small></span><span className="path-selection" aria-hidden="true">{selected===i?<Check/>:String(i+1).padStart(2,'0')}</span></button>})}</div><div className="marketing-path-detail" aria-live="polite"><div><h3>{titles[selected]}</h3><p>{hints[selected]}</p><ul>{c.pathFacts[selected].map(f=><li key={f}><Check aria-hidden="true"/>{f}</li>)}</ul></div><a className="landing-primary" href={'/constat?lang='+lang}>{c.pathAction}<ArrowRight aria-hidden="true"/></a></div><p className="marketing-path-hint">{c.pathHint}</p></section>
}
