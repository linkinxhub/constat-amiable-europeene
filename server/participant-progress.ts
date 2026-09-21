import {vehiclesValid,situationValid,type Report} from '../features/constat/model.ts';
export function participantReady(r:Report,side:'A'|'B'){
 const v=r.vehicles[side==='A'?0:1];
 return vehiclesValid({...r,count:'1',vehicles:[v,v]})&&v.standardConfirmed===true&&
 (!!v.standardCircumstances?.length||!!v.observations.trim())&&
 (side==='B'||(situationValid(r)&&!!r.otherVehiclesDamage&&!!r.otherObjectsDamage));
}
export async function participantHash(r:Report,side:'A'|'B'){
 const {id,updated,vehicles,photos,readingLanguages,...common}=r;
 const value={common,vehicle:vehicles[side==='A'?0:1],photos:photos.filter(p=>p.side===side||!p.side),language:readingLanguages[side==='A'?0:1]};
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)));
 return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function progress(r:Report,stored:string|null|undefined,side:'A'|'B'){
 if(!stored)return {done:false,at:null};
 try{const value=JSON.parse(stored);return value.hash===await participantHash(r,side)?{done:true,at:String(value.at)}:{done:false,at:null};}catch{return {done:false,at:null}}
}
