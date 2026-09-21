import {z} from 'zod';
const point=z.object({x:z.number().min(0).max(800),y:z.number().min(0).max(400)}).strict();
export const sketchSchema=z.object({roads:z.array(z.object({points:z.array(point).min(2).max(20)}).strict()).max(8),vehicles:z.array(z.object({side:z.enum(['A','B']),x:z.number().min(30).max(770),y:z.number().min(30).max(370),angle:z.number().min(0).max(360)}).strict()).max(2),uncertainties:z.array(z.string().max(500)).max(12)}).strict().refine(s=>new Set(s.vehicles.map(v=>v.side)).size===s.vehicles.length,'duplicate vehicle');
export type Sketch=z.infer<typeof sketchSchema>;
