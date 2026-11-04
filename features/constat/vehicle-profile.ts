import {z} from 'zod';
import {vehicleKinds} from './vehicle-kind.ts';
import type {Vehicle} from './model.ts';
const value=z.string().max(1000);
export const profileExtraKeys=['registrationCountry','trailerPlate','trailerCountry','greenCard','insuranceFrom','insuranceUntil','agency','agencyAddress','agencyPhone','comprehensive'] as const;
export const profileKeys=['kind','plate','model','insurer','policy'] as const;
export const profileVehicleSchema=z.object({kind:z.enum(vehicleKinds).optional(),plate:value,model:value,insurer:value,policy:value,extra:z.object(Object.fromEntries(profileExtraKeys.map(k=>[k,value.optional()])) as Record<typeof profileExtraKeys[number],z.ZodOptional<typeof value>>).strict().optional()}).strict();
export const profileInput=z.object({label:z.string().trim().min(1).max(80),vehicle:profileVehicleSchema}).strict();
export type ProfileVehicle=z.infer<typeof profileVehicleSchema>;
export const profileSchema=profileInput.extend({id:z.string().uuid(),createdAt:z.string().datetime()});
export type VehicleProfile=z.infer<typeof profileSchema>;
export function profileFromVehicle(vehicle:Vehicle):ProfileVehicle{
 const extra=Object.fromEntries(profileExtraKeys.filter(k=>vehicle.extra?.[k]!==undefined).map(k=>[k,vehicle.extra![k]]));
 return profileVehicleSchema.parse({kind:vehicle.kind,plate:vehicle.plate,model:vehicle.model,insurer:vehicle.insurer,policy:vehicle.policy,extra});
}
// No driver, policyholder, signatures, accident facts or completion flags are reusable.
export function applyVehicleProfile(current:Vehicle,profile:ProfileVehicle,replace=false):Vehicle{
 const source=profileVehicleSchema.parse(profile),next={...current,extra:{...current.extra}};
 for(const key of profileKeys){const v=source[key];if(v&&(!current[key]||replace))Object.assign(next,{[key]:v})}
 for(const key of profileExtraKeys){const v=source.extra?.[key];if(v&&(!current.extra?.[key]||replace))next.extra[key]=v}
 return next;
}
