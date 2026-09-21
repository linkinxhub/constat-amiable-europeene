import type {Report} from './model.ts';
const photoSizes=new WeakMap<Report['photos'],number>();
const encoder=new TextEncoder();
export function reportSize(report:Report){
 let bytes=photoSizes.get(report.photos);
 if(bytes===undefined){bytes=encoder.encode(JSON.stringify(report.photos)).length;photoSizes.set(report.photos,bytes);}
 return encoder.encode(JSON.stringify({...report,photos:[]})).length+bytes-2;
}
