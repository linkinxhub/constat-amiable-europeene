'use client';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {eventZone} from './event-time';import {repairCopy} from './repair-copy';import type {Lang} from './i18n';import type {Report} from './model';
const zones=['UTC',...Intl.supportedValuesOf('timeZone')];
export function TimeZoneField({report,lang,onChange}:{report:Report,lang:Lang,onChange:(zone:string)=>void}){const current=eventZone(report);return <label className="field"><span>{repairCopy[lang].zone}</span><NativeSelect value={current} onChange={e=>onChange(e.target.value)}>{[...new Set([current,...zones])].map(z=><NativeSelectOption key={z} value={z}>{z}</NativeSelectOption>)}</NativeSelect></label>}
