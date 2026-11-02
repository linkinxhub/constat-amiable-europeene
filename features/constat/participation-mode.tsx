'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import type {Lang} from './i18n';
import {onboardingCopy} from './onboarding-copy';
import {participationModes,type ParticipationMode} from './participation-model';

export function ModePhones({mode}:{mode:ParticipationMode}){
 return <span className={'mode-phones '+mode} aria-hidden="true">{(mode==='two-devices'?['A','B']:['A']).map(letter=><span className={'mode-phone phone-'+letter} key={letter}><i/>{mode==='same-device'?<span className="phone-both"><b>A</b><b>B</b></span>:<b>{letter}</b>}</span>)}</span>;
}
export function ParticipationModePicker({lang,value,disabled,onContinue}:{lang:Lang,value?:ParticipationMode,disabled:boolean,onContinue:(mode:ParticipationMode)=>void}){
 const [choice,setChoice]=useState<ParticipationMode|undefined>(value),c=onboardingCopy[lang];
 return <section className="participation-picker" aria-labelledby="participation-title"><h2 id="participation-title">{c.mode}</h2><p>{c.hint}</p>
  <fieldset disabled={disabled}><legend className="sr-only">{c.mode}</legend><div className="participation-cards">{participationModes.map(mode=><label key={mode} className={'participation-card '+(choice===mode?'is-selected':'')}><input type="radio" name="participation-mode" value={mode} checked={choice===mode} onChange={()=>setChoice(mode)}/><ModePhones mode={mode}/><strong>{mode==='same-device'?c.same:mode==='two-devices'?c.remote:c.solo}</strong><span>{mode==='same-device'?c.sameHint:mode==='two-devices'?c.remoteHint:c.soloHint}</span></label>)}</div></fieldset>
  <p className="muted">{c.keep}</p><Button type="button" disabled={disabled||!choice} onClick={()=>choice&&onContinue(choice)}>{c.continue}</Button>
 </section>;
}
