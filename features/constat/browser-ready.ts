'use client';
import {useSyncExternalStore} from 'react';
const subscribe=()=>()=>{};
const clientSnapshot=()=>true;
const serverSnapshot=()=>false;
// Browser storage is read only after hydration. No timer or delayed state setter.
export function useBrowserReady(){return useSyncExternalStore(subscribe,clientSnapshot,serverSnapshot)}
