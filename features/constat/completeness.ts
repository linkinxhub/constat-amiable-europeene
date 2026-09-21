import {eventInstant} from './event-time.ts';
import {z} from 'zod';
import type {Report} from './model';
export type MissingField={step:number;field:'dateProblem'|'place'|'injured'|'count'|'driver'|'policyholder'|'plate'|'model'|'insurer'|'policy'|'email'|'explain'|'thirdVehicles'|'thirdObjects'|'confirmStandard';vehicle?:number};
export function validDateTime(r:Pick<Report,'date'|'time'> & Partial<Pick<Report,'country'|'timeZone'>>,now=Date.now()){const instant=eventInstant(r);return Number.isFinite(instant)&&instant<=now;}
export function missingFields(r:Report):MissingField[]{
 const fields:MissingField[]=[];
 if(!validDateTime(r))fields.push({step:0,field:'dateProblem'});
 if(r.place.trim().length<3)fields.push({step:0,field:'place'});
 if(r.injured!=='no')fields.push({step:0,field:'injured'});
 if(!r.count)fields.push({step:0,field:'count'});
 for(let i=0;i<Number(r.count);i++){
  const v=r.vehicles[i];
  for(const field of ['driver','policyholder','plate','model','insurer','policy'] as const)if(!v[field].trim())fields.push({step:1,field,vehicle:i});
  if(v.email&&!z.string().email().safeParse(v.email).success)fields.push({step:1,field:'email',vehicle:i});
  if((!v.circumstances.length&&!(v.standardConfirmed&&v.standardCircumstances?.length)&&!v.observations.trim())||(v.circumstances.includes(7)&&!v.observations.trim()))fields.push({step:2,field:'explain',vehicle:i});
 }
 return fields;
}
export function mergeSavedDraft(current:Report,snapshot:Report,saved:Report):Report{return current===snapshot?saved:{...current,id:current.id||saved.id,updated:saved.updated,localCreatedAt:current.localCreatedAt||saved.localCreatedAt};}

export function finalMissingFields(r:Report):MissingField[]{const fields=missingFields(r);if(r.count!=='2'&&!fields.some(f=>f.field==='count'))fields.push({step:0,field:'count'});if(!r.otherVehiclesDamage)fields.push({step:0,field:'thirdVehicles'});if(!r.otherObjectsDamage)fields.push({step:0,field:'thirdObjects'});r.vehicles.forEach((v,i)=>{if(!v.standardConfirmed||v.standardCircumstances===undefined||(!v.standardCircumstances.length&&!v.observations.trim()))fields.push({step:2,field:'confirmStandard',vehicle:i});});return fields;}
