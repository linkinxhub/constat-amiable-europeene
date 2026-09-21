import type {Report} from './model.ts';
import {standardCircumstances} from './final-model.ts';
export function sketchEvidence(r:Report,side:'A'|'B'){
 return {language:r.readingLanguages[side==='A'?0:1],vehicles:r.vehicles.map((v,i)=>({side:i===0?'A':'B',damage:v.damage,observations:v.observations,impact:v.extra?.impact||'',standardConfirmed:!!v.standardConfirmed,standardCircumstances:(v.standardCircumstances||[]).map(k=>({number:k+1,description:standardCircumstances.en[k]})),legacyCircumstances:v.circumstances})),legacyLegend:['parked/stopped','leaving parking','entering a road','changing lane','turning right','turning left','reversing','other']};
}
