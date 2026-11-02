import type {Vehicle} from './model.ts';
export const vehicleKinds=['car','van','truck','truck-trailer','car-trailer','other'] as const;
export type VehicleKind=typeof vehicleKinds[number];
export function hasTrailer(v:Vehicle){return v.kind==='truck-trailer'||v.kind==='car-trailer'}
export function trailerRecorded(v:Vehicle){return !!(v.extra?.trailerPlate?.trim()||v.extra?.trailerCountry?.trim())}
export function vehicleKindValid(v:Vehicle){return !hasTrailer(v)||!!v.extra?.trailerPlate?.trim()}
// Historical values remain editable even after a change to a type without trailer.
export function visibleVehicleExtras(v:Vehicle,fields:readonly string[]){return fields.filter(k=>!v.kind||!['trailerPlate','trailerCountry'].includes(k))}

export function applicableVehicleExtras<T extends string>(v:Vehicle,fields:readonly T[]){const extra=v.extra as Record<string,string>|undefined;return fields.filter(k=>!v.kind||hasTrailer(v)||!['trailerPlate','trailerCountry'].includes(k)||!!extra?.[k]?.trim())}
