'use client';
import type {Vehicle} from './model';
import type {Lang} from './i18n';
import {vehicleKinds,hasTrailer,trailerRecorded,type VehicleKind} from './vehicle-kind';
import {vehicleKindCopy} from './vehicle-kind-copy';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {Input} from '@/components/ui/input';
export function VehicleKindFields({value,lang,onChange}:{value:Vehicle;lang:Lang;onChange:(v:Vehicle)=>void}){
 const c=vehicleKindCopy[lang],trailer=hasTrailer(value),retained=!!value.kind&&!trailer&&trailerRecorded(value);
 return <section className="vehicle-kind-fields"><label className="field"><span>{c.title}</span><NativeSelect aria-label={c.title} value={value.kind||''} onChange={e=>onChange({...value,kind:e.target.value?e.target.value as VehicleKind:undefined})}><NativeSelectOption value="">{c.choose}</NativeSelectOption>{vehicleKinds.map(k=><NativeSelectOption key={k} value={k}>{c.types[k]}</NativeSelectOption>)}</NativeSelect></label><p className="muted">{c.hint}</p>{value.kind?.startsWith('truck')&&<details className="simple-details"><summary>{c.truckHelp}</summary><p className="notice">{c.truck}</p></details>}{retained&&<p className="notice">{c.retained}</p>}{(trailer||retained)&&<div className="field-grid">{(['trailerPlate','trailerCountry'] as const).map(k=><label className="field" key={k}><span>{c[k]}{trailer&&k==='trailerPlate'?' *':''}</span><Input aria-label={c[k]} required={trailer&&k==='trailerPlate'} maxLength={4000} value={value.extra?.[k]||''} onChange={e=>onChange({...value,extra:{...value.extra,[k]:e.target.value}})}/></label>)}</div>}</section>
}
