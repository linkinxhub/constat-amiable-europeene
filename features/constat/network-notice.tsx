'use client';
import {useSyncExternalStore} from 'react';
import type {Lang} from './i18n';
import {continuityCopy} from './continuity-copy';
function subscribe(listener:()=>void){window.addEventListener('online',listener);window.addEventListener('offline',listener);return()=>{window.removeEventListener('online',listener);window.removeEventListener('offline',listener)}}
export function NetworkNotice({lang}:{lang:Lang}){const online=useSyncExternalStore(subscribe,()=>typeof navigator==='undefined'||navigator.onLine!==false,()=>true),c=continuityCopy[lang];return online?null:<aside className="notice network-notice no-print" role="status"><strong>{c.offline}</strong><p>{c.offlineHint}</p></aside>}
