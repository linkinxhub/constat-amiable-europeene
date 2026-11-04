'use client';
import {useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
import type {Lang} from '../constat/i18n';
import type {Tutorial} from '../constat/tutorial';
import {loadTutorial} from './tutorial-loader';
const copy={fr:['Chargement du tutoriel…','Le tutoriel n’a pas pu être chargé. La page reste utilisable.','Réessayer'],en:['Loading tutorial…','The tutorial could not load. You can still use this page.','Try again'],de:['Anleitung wird geladen…','Die Anleitung konnte nicht geladen werden. Die Seite bleibt nutzbar.','Erneut versuchen'],nl:['Handleiding laden…','De handleiding kon niet laden. U kunt deze pagina blijven gebruiken.','Opnieuw proberen']};
export function DeferredTutorial({lang}:{lang:Lang}){
 const [Component,setComponent]=useState<typeof Tutorial|null>(null),[error,setError]=useState(false),[attempt,setAttempt]=useState(0),c=copy[lang];
 useEffect(()=>{let active=true;loadTutorial().then(value=>{if(active)setComponent(()=>value)}).catch(()=>{if(active)setError(true)});return()=>{active=false}},[attempt]);
 return Component?<Component lang={lang}/>:error?<div role="status"><p>{c[1]}</p><Button type="button" variant="outline" onClick={()=>{setError(false);setAttempt(a=>a+1)}}>{c[2]}</Button></div>:<p role="status">{c[0]}</p>;
}
