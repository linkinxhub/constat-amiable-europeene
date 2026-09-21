export const countryZones:Record<string,string>={BE:'Europe/Brussels',FR:'Europe/Paris',DE:'Europe/Berlin',NL:'Europe/Amsterdam',ES:'Europe/Madrid',OTHER:'UTC'};
export function eventZone(r:{timeZone?:string,country?:string}){return r.timeZone||countryZones[r.country||'']||'UTC';}
export function knownZone(zone:string){try{new Intl.DateTimeFormat('en',{timeZone:zone}).format();return true;}catch{return false;}}
// Resolve local wall time independently of the browser/server timezone. Reject DST gaps.
export function eventInstant(r:{date:string,time:string,timeZone?:string,country?:string}){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!/^\d{2}:\d{2}$/.test(r.time))return NaN;
 const [year,month,day]=r.date.split('-').map(Number),[hour,minute]=r.time.split(':').map(Number);
 if(year<1900||month<1||month>12||day<1||day>31||hour>23||minute>59)return NaN;
 const wall=Date.UTC(year,month-1,day,hour,minute),check=new Date(wall);
 if(check.getUTCMonth()!==month-1||check.getUTCDate()!==day)return NaN;
 try{const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:eventZone(r),year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 const parts=(n:number)=>Object.fromEntries(fmt.formatToParts(n).map(p=>[p.type,p.value]));
 let utc=wall;for(let i=0;i<3;i++){const p=parts(utc);utc+=wall-Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute);}
 const p=parts(utc);return +p.year===year&&+p.month===month&&+p.day===day&&+p.hour===hour&&+p.minute===minute?utc:NaN;
 }catch{return NaN;}
}
