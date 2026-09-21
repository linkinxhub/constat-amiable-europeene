'use client';
import {lookupAddress,type AddressResult} from './geocoding';
import {useRef,useState,useEffect} from 'react';
import {Button} from '@/components/ui/button';import type {Report} from './model';import type {Lang} from './i18n';
const copy={fr:['Relever ma position GPS','Recherche de la position…','Position indisponible. Vérifiez les autorisations ou saisissez le lieu.','Position actuelle du téléphone : vérifiez qu’elle correspond au lieu de l’accident.','Précision estimée'],en:['Get my GPS position','Locating…','Position unavailable. Check permissions or enter the location.','Current phone position: check that it matches the accident location.','Estimated accuracy'],de:['GPS-Position erfassen','Position wird gesucht…','Position nicht verfügbar. Berechtigungen prüfen oder Ort eingeben.','Aktueller Telefonstandort: Bitte mit dem Unfallort abgleichen.','Geschätzte Genauigkeit'],nl:['Mijn GPS-positie ophalen','Locatie zoeken…','Positie niet beschikbaar. Controleer machtigingen of vul de plaats in.','Huidige telefoonlocatie: controleer of dit de ongevalslocatie is.','Geschatte nauwkeurigheid']};
const consentCopy={fr:'J’autorise l’envoi de cette position à Photon/Komoot pour rechercher l’adresse.',en:'I allow this position to be sent to Photon/Komoot to find the address.',de:'Ich erlaube die Übermittlung dieser Position an Photon/Komoot zur Adresssuche.',nl:'Ik geef toestemming om deze positie naar Photon/Komoot te sturen om het adres te zoeken.'};
const addressCopy={
 fr:['Recherche du lieu et de la ville…','Adresse proposée : vérifiez le lieu et la ville avant de confirmer.','GPS relevé, mais adresse indisponible. Saisissez le lieu et la ville.','Ce bouton transmet les coordonnées à Photon (Komoot/OpenStreetMap) pour proposer une adresse.'],
 en:['Finding place and city…','Suggested address: check the place and city before confirming.','GPS captured, but address unavailable. Enter the place and city.','This button sends coordinates to Photon (Komoot/OpenStreetMap) to suggest an address.'],
 de:['Ort und Stadt werden gesucht…','Adressvorschlag: Ort und Stadt vor der Bestätigung prüfen.','GPS erfasst, Adresse nicht verfügbar. Ort und Stadt eingeben.','Diese Schaltfläche sendet Koordinaten an Photon (Komoot/OpenStreetMap) für einen Adressvorschlag.'],
 nl:['Plaats en gemeente zoeken…','Voorgesteld adres: controleer plaats en gemeente vóór bevestiging.','GPS vastgelegd, adres niet beschikbaar. Vul plaats en gemeente in.','Deze knop stuurt coördinaten naar Photon (Komoot/OpenStreetMap) voor een adresvoorstel.']};
export function Location({value,lang,place,city,onChange,onAddress}:{value:Report['location'],lang:Lang,place:string,city?:string,onChange:(v:NonNullable<Report['location']>)=>void,onAddress:(address:AddressResult,capturedAt:string,before:AddressResult)=>void}){
 const [consent,setConsent]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(false),[status,setStatus]=useState<number|null>(null);
 const alive=useRef(true),running=useRef(false),controller=useRef<AbortController|null>(null);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;controller.current?.abort()}},[]);
 const c=copy[lang],a=addressCopy[lang];
 async function locate(){
  if(running.current)return;
  setError(false);setStatus(null);
  if(!navigator.geolocation){setError(true);return;}
  running.current=true;setBusy(true);const before={place,city:city||''};
  navigator.geolocation.getCurrentPosition(async p=>{
   if(!alive.current)return;
   const position={latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy,capturedAt:new Date(p.timestamp).toISOString()};
   onChange(position);if(!consent){running.current=false;setBusy(false);return;}setStatus(0);
   const abort=new AbortController();controller.current=abort;const timeout=setTimeout(()=>abort.abort(),10000);
   try{const address=await lookupAddress(position.latitude,position.longitude,lang,abort.signal);if(alive.current){onAddress(address,position.capturedAt,before);setStatus(1)}}
   catch{if(alive.current)setStatus(2)}
   finally{clearTimeout(timeout);running.current=false;if(alive.current)setBusy(false)}
  },()=>{running.current=false;if(alive.current){setBusy(false);setError(true)}},{enableHighAccuracy:true,timeout:20000,maximumAge:0});
 }
 return <section className="location-panel"><label className="session-choice"><input type="checkbox" checked={consent} disabled={busy} onChange={e=>setConsent(e.target.checked)}/>{consentCopy[lang]}</label><Button type="button" variant="outline" disabled={busy} onClick={()=>void locate()}>{busy?c[1]:c[0]}</Button><p className="muted">{c[3]} {consent&&a[3]}</p>{value&&<p><strong>{value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}</strong><br/>{c[4]} ± {Math.round(value.accuracy)} m · {new Date(value.capturedAt).toLocaleString(lang)}</p>}{status!==null&&<p role="status">{a[status]} <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a></p>}{error&&<p role="alert">{c[2]}</p>}</section>
}
