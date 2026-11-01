import {z} from 'zod';
import type {Report,Vehicle} from './model.ts';
export function expressEntryAllowed(data:unknown){const p=z.object({available:z.boolean(),mode:z.string()}).safeParse(data);return p.success&&p.data.available&&p.data.mode==='admin_preview';}
export function applyOwnEntry(report:Report,side:0|1,vehicle:Vehicle):Report{const vehicles=[...report.vehicles] as Report['vehicles'];vehicles[side]=vehicle;return {...report,vehicles};}
