'use client';
import {useBrowserReady} from './browser-ready';
import {SiteHeader,SiteFooter} from '../product/site-header';
import {useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
import {experienceCopy} from './experience-copy';
import {rememberInvitation,tokenFromFragment} from './pending-invitation';
import {sharingCopy} from './sharing-copy';
import {invitationPath} from './join-model';
import type {Lang} from './i18n';
export function JoinPanel({initialLanguage}:{initialLanguage?:Lang}){const [lang,setLang]=useState<Lang>(initialLanguage||'fr'),[link,setLink]=useState(''),[error,setError]=useState(false);const c=experienceCopy[lang];useEffect(()=>{document.documentElement.lang=lang},[lang]);const browserReady=useBrowserReady(),[initialized,setInitialized]=useState(false);if(browserReady&&!initialized){setInitialized(true);if(!initialLanguage)try{const l=localStorage.getItem('accordia-language');if(l&&l in experienceCopy)setLang(l as Lang)}catch{}}return <main className="public-page join-shell" lang={lang}><SiteHeader lang={lang} active="join" onLanguageChange={l=>{setLang(l);try{localStorage.setItem('accordia-language',l)}catch{}}}/><div className="join-page"><h1>{c.join}</h1><p>{c.joinHint}</p><form onSubmit={e=>{e.preventDefault();try{const path=invitationPath(link,window.location.origin);const id=path.split('#')[0].split('/').at(-1)!;try{rememberInvitation(sessionStorage,id,tokenFromFragment(path.slice(path.indexOf('#'))))}catch{};window.location.assign(path)}catch{setError(true)}}}><label className="field"><span>{c.link}</span><input type="text" value={link} autoComplete="off" autoCapitalize="none" spellCheck={false} required maxLength={600} aria-invalid={error} onChange={e=>{setLink(e.target.value);setError(false)}}/></label>{error&&<p role="alert" className="error">{c.invalid}</p>}<Button type="submit">{c.join}</Button></form><p>{c.access}</p><p>{sharingCopy[lang].signin}</p><a className="site-action site-action-secondary" href={"/constat?lang="+lang}>{c.start}</a></div><SiteFooter lang={lang}/></main>}
