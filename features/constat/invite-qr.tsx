'use client';
import {useEffect,useState} from 'react';
import type {Lang} from './i18n';
import {deviceCopy} from './device-copy';
export function InviteQr({link,lang}:{link:string,lang:Lang}){
 const [src,setSrc]=useState(''),[error,setError]=useState(false),[open,setOpen]=useState(true);const c=deviceCopy[lang];
 const [previous,setPrevious]=useState({link,open});if(previous.link!==link||previous.open!==open){setPrevious({link,open});setSrc('');setError(false)}
 useEffect(()=>{let active=true;if(open)void import('qrcode').then(q=>q.toDataURL(link,{errorCorrectionLevel:'M',margin:4,width:320})).then(url=>{if(active)setSrc(url)}).catch(()=>{if(active)setError(true)});return()=>{active=false}},[link,open]);
 return <details open={open} onToggle={e=>setOpen(e.currentTarget.open)}><summary>{c.qr}</summary><p>{c.qrHint}</p>{src&&<img src={src} alt={c.qr} width={320} height={320} style={{maxWidth:'100%',height:'auto'}}/>}{error&&<p role="alert">{c.qrError}</p>}</details>
}
