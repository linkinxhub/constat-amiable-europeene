import {z} from 'zod';
const facts=z.array(z.string().trim().min(1).max(500)).max(8);
export const synthesisSchema=z.object({language:z.enum(['fr','en','de','nl']),declaredA:facts,declaredB:facts,agreements:facts,disagreements:facts,missing:facts}).strict();
export type Synthesis=z.infer<typeof synthesisSchema>;
export const synthesisResponseSchema={type:'object',properties:{language:{type:'string',enum:['fr','en','de','nl']},...Object.fromEntries(['declaredA','declaredB','agreements','disagreements','missing'].map(k=>[k,{type:'array',items:{type:'string'}}]))},required:['language','declaredA','declaredB','agreements','disagreements','missing'],additionalProperties:false};
