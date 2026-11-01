'use client';
import {useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import type {Lang} from './i18n';
import {invitationPath} from './join-model';
import {qrScanCopy} from './qr-scan-copy';
import {createQrCamera} from './qr-camera';
export function QrScanner({lang,onLink}:{lang:Lang;onLink:(value:string)=>void}){
 const c=qrScanCopy[lang],video=useRef<HTMLVideoElement>(null),camera=useRef<ReturnType<typeof createQrCamera>|null>(null),alive=useRef(true),starting=useRef(false);
 const [active,setActive]=useState(false),[status,setStatus]=useState<keyof typeof c|null>(null);
 function stop(){camera.current?.stop();camera.current=null;if(video.current)video.current.srcObject=null;starting.current=false;setActive(false)}
 useEffect(()=>{alive.current=true;const el=video.current;const pause=()=>{if(document.hidden){stop();setStatus(null)}};const leave=()=>{stop();setStatus(null)};document.addEventListener('visibilitychange',pause);window.addEventListener('pagehide',leave);return()=>{alive.current=false;camera.current?.stop();if(el)el.srcObject=null;document.removeEventListener('visibilitychange',pause);window.removeEventListener('pagehide',leave)}},[]);
 async function start(){if(starting.current)return;starting.current=true;if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){starting.current=false;setStatus('unavailable');return}setActive(true);setStatus('opening');
  const canvas=document.createElement('canvas'),context=canvas.getContext('2d',{willReadFrequently:true});
  if(!context){stop();setStatus('failed');return}
  // Decoder is loaded only on explicit camera action; no CDN or image upload.
  let decode:typeof import('jsqr').default;
  const session=createQrCamera({open:async isCurrent=>{decode=(await import('jsqr')).default;if(!isCurrent())throw new Error('cancelled');return navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}})},attach:async stream=>{const el=video.current;if(!el)throw new Error('video_missing');el.srcObject=stream as MediaStream;await el.play();if(alive.current&&camera.current===session)setStatus('aim')},decode:()=>{const el=video.current;if(!el||el.readyState<2||!el.videoWidth)return null;const scale=Math.min(1,720/Math.max(el.videoWidth,el.videoHeight));canvas.width=Math.max(1,Math.round(el.videoWidth*scale));canvas.height=Math.max(1,Math.round(el.videoHeight*scale));context.drawImage(el,0,0,canvas.width,canvas.height);const frame=context.getImageData(0,0,canvas.width,canvas.height);return decode(frame.data,frame.width,frame.height,{inversionAttempts:'attemptBoth'})?.data||null},onValue:value=>{try{invitationPath(value,location.origin)}catch{setStatus('invalid');return false}onLink(value);setStatus('ready');setActive(false);starting.current=false;if(video.current)video.current.srcObject=null;return true},onError:error=>{if(!alive.current)return;stop();setStatus(error instanceof DOMException&&['NotAllowedError','SecurityError'].includes(error.name)?'denied':error instanceof DOMException&&error.name==='NotFoundError'?'unavailable':'failed')}});
  camera.current=session;await session.start();
 }
 return <section className="qr-scanner" aria-label={c.start}><Button type="button" variant="outline" onClick={()=>void start()} disabled={active}>{c.start}</Button>{active&&<Button type="button" variant="outline" onClick={()=>{stop();setStatus(null)}}>{c.stop}</Button>}<video ref={video} hidden={!active} muted autoPlay playsInline aria-label={c.aim}/>{status&&<p role={['denied','unavailable','failed','invalid'].includes(status)?'alert':'status'}>{c[status]}</p>}<p className="muted">{c.privacy}</p></section>
}
