import {z} from 'zod';
import type {Vehicle} from './model';
export const DOCUMENT_BYTES=3*1024*1024;
export const DOCUMENT_HOURLY_LIMIT=5;
export const DOCUMENT_ACCEPT='application/pdf,image/jpeg,image/png,image/webp';
export const documentKinds=['vehicle','identity','licence','insurance','trailer','policyholder_identity'] as const;
export const documentFields=['driver','address','plate','model','insurer','policy','policyholder','policyholderFirstName','policyholderAddress','policyholderPostcode','policyholderCountry','policyholderPhone','registrationCountry','trailerPlate','trailerCountry','greenCard','insuranceFrom','insuranceUntil','agency','agencyAddress','agencyPhone','driverFirstName','driverBirthDate','driverPostcode','driverCountry','licenceNumber','licenceCategory','licenceUntil'] as const;
export type DocumentField=typeof documentFields[number];
export const kindFields:Record<typeof documentKinds[number],readonly DocumentField[]>={trailer:['trailerPlate','trailerCountry'],policyholder_identity:['policyholder','policyholderFirstName','policyholderAddress','policyholderPostcode','policyholderCountry'],vehicle:['plate','model','registrationCountry'],identity:['driver','address','driverFirstName','driverBirthDate','driverPostcode','driverCountry'],licence:['driver','address','driverFirstName','driverBirthDate','driverPostcode','driverCountry','licenceNumber','licenceCategory','licenceUntil'],insurance:['insurer','policy','policyholder','policyholderFirstName','policyholderAddress','policyholderPostcode','policyholderCountry','policyholderPhone','greenCard','insuranceFrom','insuranceUntil','agency','agencyAddress','agencyPhone','plate']};
export const extractionResult=z.object({fields:z.array(z.object({field:z.enum(documentFields),value:z.string().trim().min(1).max(400),confidence:z.enum(['high','uncertain'])}).strict()).max(documentFields.length)}).strict().refine(r=>new Set(r.fields.map(f=>f.field)).size===r.fields.length);
export type Extraction=z.infer<typeof extractionResult>;
const base=new Set(['driver','address','plate','model','insurer','policy','policyholder']);
export function documentValue(v:Vehicle,key:DocumentField):string{return base.has(key)?String(v[key as keyof Vehicle]||''):String(v.extra?.[key as keyof NonNullable<Vehicle['extra']>]||'')}
export function applyDocumentFields(current:Vehicle,snapshot:Vehicle,fields:Extraction['fields']):Vehicle{
 const safe=extractionResult.parse({fields}).fields;
 if(safe.some(f=>documentValue(current,f.field)!==documentValue(snapshot,f.field)))throw new Error('document_conflict');
 const next={...current,extra:{...current.extra}};
 for(const f of safe){if(base.has(f.field))(next as unknown as Record<string,unknown>)[f.field]=f.value;else (next.extra as Record<string,string>)[f.field]=f.value;}
 return next;
}
