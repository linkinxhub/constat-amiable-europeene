'use client';
import {useEffect,useRef,useState} from 'react';
import type {RefObject} from 'react';
import type {Lang} from '../constat/i18n';
import {canShareStoryVideo,prepareStoryVideo,shareStoryVideo,storyVideo} from './story-video-share';
import {storyVideoCopy} from './story-video-copy';
export function StoryVideoShare({lang,videoRef,onPlaybackStart}:{lang:Lang;videoRef?:RefObject<HTMLVideoElement|null>;onPlaybackStart?:()=>void}){
 const ownVideo=useRef<HTMLVideoElement|null>(null),media=videoRef||ownVideo;
 const c=storyVideoCopy[lang],file=useRef<File|null>(null),request=useRef<AbortController|null>(null),busy=useRef(false),mounted=useRef(true);
 const [state,setState]=useState<'idle'|'loading'|'ready'|'sharing'|'fallback'|'error'|'done'>('idle');
 useEffect(()=>{mounted.current=true;const element=media.current;return()=>{mounted.current=false;request.current?.abort();element?.pause()}},[media]);
 async function share(){
  if(busy.current)return;busy.current=true;
  try{
   if(file.current){setState('sharing');const result=await shareStoryVideo(file.current);if(mounted.current)setState(result==='shared'?'done':result==='unsupported'?'fallback':'ready')}
   else{
    // Avoid a download on unsupported browsers. The explicit MP4 link stays usable.
    if(typeof navigator.share!=='function'||typeof navigator.canShare!=='function'){setState('fallback');return}
    setState('loading');request.current=new AbortController();
    const timeout=setTimeout(()=>request.current?.abort(),30000);let prepared:File;
    try{prepared=await prepareStoryVideo(request.current.signal)}finally{clearTimeout(timeout)}
    if(!mounted.current)return;
    if(!canShareStoryVideo(prepared)){setState('fallback');return}
    file.current=prepared;setState('ready');
   }
  }catch{if(mounted.current)setState('error')}
  finally{busy.current=false}
 }
 const pending=state==='loading'||state==='sharing';
 return <div className="story-video-share"><p>{c.note}</p><p className="muted">{c.audioHint}</p><video ref={media} onPlay={e=>{if(!e.currentTarget.paused)onPlaybackStart?.()}} controls playsInline preload="none" poster="/video/accordia-bd-poster.webp" width={1280} height={720} aria-label={c.note} style={{width:"100%",height:"auto",aspectRatio:"16 / 9",borderRadius:"16px",background:"#e7f1f3"}} src={storyVideo.src}/><div><button type="button" onClick={share} disabled={pending}>{pending?c.preparing:state==='ready'||state==='done'?c.choose:c.share}</button><a href={storyVideo.src} download={storyVideo.filename}>{c.download}</a></div><p role="status" aria-live="polite">{state==='ready'?c.ready:state==='fallback'?c.fallback:state==='error'?c.error:state==='done'?c.done:''}</p></div>
}
