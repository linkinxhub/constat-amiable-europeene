import type {Report} from './model.ts';

export const cityLabel={fr:'Ville / commune',en:'City / municipality',de:'Stadt / Gemeinde',nl:'Stad / gemeente'};
export type AddressResult={place:string;city:string;country?:Report['country']};
export function parseAddress(data:unknown):AddressResult {
 const p=(data as {features?:{properties?:Record<string,unknown>}[]})?.features?.[0]?.properties;
 if(!p)throw new Error('address_unavailable');
 const text=(key:string)=>typeof p[key]==='string'?(p[key] as string).trim().slice(0,500):'';
 const street=[text('street'),text('housenumber')].filter(Boolean).join(' ');
 const city=text('city')||text('town')||text('village')||text('municipality');
 const name=text('name');
 const place=[...new Set([name!==city?name:'',street].filter(Boolean))].join(' · ');
 if(!place&&!city)throw new Error('address_unavailable');
 const code=text('countrycode').toUpperCase();
 const country=code?(['BE','FR','DE','NL','ES'].includes(code)?code as Report['country']:'OTHER'):undefined;
 return {place,city,...(country?{country}:{})};
}

// Never replace edits made while GPS/address requests were in flight.
export function mergeAddress(current:Report,address:AddressResult,capturedAt:string,before:AddressResult):Report {
 if(current.location?.capturedAt!==capturedAt)return current;
 return {...current,place:current.place===before.place&&address.place?address.place:current.place,
 city:(current.city||'')===before.city&&address.city?address.city:current.city,
 country:current.country===before.country&&address.country?address.country:current.country};
}
export function fullPlace(r:Pick<Report,'place'|'city'>){return [r.place,r.city].filter(Boolean).join(' · ');}

export async function lookupAddress(latitude:number,longitude:number,lang:string,signal:AbortSignal):Promise<AddressResult>{
 if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)throw new Error('invalid_coordinates');
 const url=new URL('https://photon.komoot.io/reverse');
 url.searchParams.set('lat',String(latitude));url.searchParams.set('lon',String(longitude));url.searchParams.set('limit','1');
 if(['fr','en','de'].includes(lang))url.searchParams.set('lang',lang);
 const response=await fetch(url,{signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
 if(!response.ok)throw new Error('address_unavailable');
 return parseAddress(await response.json());
}
