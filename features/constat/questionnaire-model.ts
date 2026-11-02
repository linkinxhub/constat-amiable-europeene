import {vehicleKindIssue} from './vehicle-kind.ts';
import {validDateTime} from './completeness.ts';
import {z} from 'zod';
import type {Report,Vehicle} from './model.ts';
import {detailGroups} from './detail-groups.ts';
export const questionGroups:readonly (readonly (keyof Vehicle)[])[]=[['driver','email','address'],['policyholder'],['plate','model'],['insurer','policy'],['damage','observations']];
export type QuestionPage={id:string;kind:'safety'|'time'|'place'|'common'|'base'|'extra'|'circumstances'|'witnesses'|'options'|'vehicleType';side?:0|1;group?:number;offset?:number};
export function questionnairePages(count:Report['count'],side?:0|1,common=true,selections?:Record<string,boolean>):QuestionPage[]{
 const pages:QuestionPage[]=common?[{id:'safety',kind:'safety'},{id:'time',kind:'time'},{id:'place',kind:'place'},{id:'common',kind:'common'}]:[];
 const sides: (0|1)[]=side!==undefined?[side]:count==='2'?[0,1]:[0];
 for(const s of sides){
  pages.push({id:`${s}-vehicle-type`,kind:'vehicleType',side:s});
  for(let group=0;group<questionGroups.length;group++)pages.push({id:`${s}-base-${group}`,kind:'base',side:s,group});
  if(selections)pages.push({id:`${s}-options`,kind:'options',side:s});
  detailGroups.forEach((fields,group)=>{if(selections&&!selections[`${s}-${group}`])return;for(let offset=0;offset<fields.length;offset+=3)pages.push({id:`${s}-extra-${group}-${offset}`,kind:'extra',side:s,group,offset})});
  pages.push({id:`${s}-circumstances`,kind:'circumstances',side:s});
 }
 if(common)pages.push({id:'witnesses',kind:'witnesses'});
 return pages;
}

export function questionnaireCursor(pages:QuestionPage[],saved:string|null){return pages.some(p=>p.id===saved)?saved!:pages[0].id;}

// Reuse report rules; optional details never become compulsory here.
export function questionnaireIssues(report:Report,page:QuestionPage,chooseCount=true):string[]{
 if(page.kind==='vehicleType'){const issue=vehicleKindIssue(report.vehicles[page.side!]);return issue?[issue]:[];}
 if(page.kind==='safety')return [...(report.injured!=='no'?['injured']:[]),...(chooseCount&&!report.count?['count']:[])];
 if(page.kind==='time')return validDateTime(report)?[]:['date','time'];
 if(page.kind==='place')return report.place.trim().length>=3?[]:['place'];
 if(page.kind==='common')return [...(!report.otherVehiclesDamage?['thirdVehicles']:[]),...(!report.otherObjectsDamage?['thirdObjects']:[])];
 if(page.kind==='base'){
 const v=report.vehicles[page.side!];return questionGroups[page.group!].filter(k=>['driver','policyholder','plate','model','insurer','policy'].includes(k)?!(v[k] as string).trim():k==='email'&&!!v.email&&!z.string().email().safeParse(v.email).success);
 }
 if(page.kind==='circumstances'){const v=report.vehicles[page.side!];return v.standardConfirmed&&(v.standardCircumstances?.length||v.observations.trim())?[]:['confirmStandard'];}
 return [];
}

export function populatedOptions(report:Report):Record<string,boolean>{return Object.fromEntries(report.vehicles.flatMap((v,s)=>detailGroups.map((fields,g)=>[`${s}-${g}`,fields.some(k=>!!v.extra?.[k]?.trim())])));}
export function safeOptions(data:unknown):Record<string,boolean>{if(!data||typeof data!=='object'||Array.isArray(data))return {};return Object.fromEntries(Object.entries(data).filter(([k,v])=>/^[01]-[0-4]$/.test(k)&&typeof v==='boolean')) as Record<string,boolean>;}
