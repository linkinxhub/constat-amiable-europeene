'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {useBrowserReady} from './browser-ready';
import {dossierShareLink} from './share-link';
import {continuityCopy} from './continuity-copy';
import type {Lang} from './i18n';
export function ShareLinkActions({path,lang}:{path:string;lang:Lang}){
 const c=continuityCopy[lang],ready=useBrowserReady(),[message,setMessage]=useState<keyof typeof continuityCopy.fr|''>(''),[busy,setBusy]=useState(false),working=useRef(false),mounted=useRef(true),latest=useRef(path);
 useLayoutEffect(()=>{latest.current=path},[path]);useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
 const [previous,setPrevious]=useState(path);if(previous!==path){setPrevious(path);setMessage('')}
 let link='';try{if(ready)link=dossierShareLink(path,location.origin)}catch{}
 async function act(share:boolean){if(!link||working.current)return;working.current=true;setBusy(true);const snapshot=path;try{if(share&&navigator.share){await navigator.share({title:'Accordia',url:link});if(mounted.current&&latest.current===snapshot)setMessage('shareOpened')}else{await navigator.clipboard.writeText(link);if(mounted.current&&latest.current===snapshot)setMessage('copied')}}catch(e){if(mounted.current&&latest.current===snapshot)setMessage(e instanceof Error&&e.name==='AbortError'?'shareCancelled':'copyFallback')}finally{working.current=false;if(mounted.current)setBusy(false)}}
 return <div className="share-link-actions"><p>{c.shareHint}</p><label className="field"><span>{c.copy}</span><input readOnly value={link} onFocus={e=>e.currentTarget.select()}/></label><div className="draft-data-buttons"><Button type="button" variant="outline" disabled={busy||!link} onClick={()=>void act(true)}>{c.share}</Button><Button type="button" variant="outline" disabled={busy||!link} onClick={()=>void act(false)}>{c.copy}</Button></div>{message&&<p role="status">{c[message]}</p>}</div>
}
