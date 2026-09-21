// Two calendar months, clamped to the last day of the target month, in UTC.
export function retentionDeadline(createdAt:string){const d=new Date(createdAt);if(!Number.isFinite(d.getTime()))throw new Error('invalid_created_at');const day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+2);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.getTime();}
export function retentionWarning(expiresAt:number,now=Date.now()){return expiresAt-now<=7*86400000;}
