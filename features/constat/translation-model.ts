import {z} from 'zod';
import type {Report} from './model';
export const translationFields=['A_damage','A_observations','A_impact','B_damage','B_observations','B_impact'] as const;
const text=z.string().max(6000).refine(s=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s));
export const translationSchema=z.object({A_damage:text,A_observations:text,A_impact:text,B_damage:text,B_observations:text,B_impact:text}).strict();
export type Translation=z.infer<typeof translationSchema>;
export function translationSource(r:Report):Translation{return {A_damage:r.vehicles[0].damage,A_observations:r.vehicles[0].observations,A_impact:r.vehicles[0].extra?.impact||'',B_damage:r.vehicles[1].damage,B_observations:r.vehicles[1].observations,B_impact:r.vehicles[1].extra?.impact||''};}
export function translatedReport(r:Report,t:Translation):Report{return {...r,vehicles:r.vehicles.map((v,i)=>({...v,damage:t[i===0?'A_damage':'B_damage'],observations:t[i===0?'A_observations':'B_observations'],extra:{...v.extra,impact:t[i===0?'A_impact':'B_impact']}})) as Report['vehicles']};}
