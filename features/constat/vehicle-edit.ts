import type {Vehicle} from './model';
// Merge the user's changes relative to the rendered snapshot into the latest
// vehicle. Unchanged stale fields must not overwrite another pending edit.
export function mergeVehicleEdit(latest:Vehicle,snapshot:Vehicle,incoming:Vehicle):Vehicle{
 const next={...latest};
 for(const key of ['kind','driver','policyholder','plate','model','insurer','policy','email','address','damage','observations','standardConfirmed'] as const)if(incoming[key]!==snapshot[key])Object.assign(next,{[key]:incoming[key]});
 for(const key of ['circumstances','standardCircumstances'] as const){
  const desired=incoming[key];if(!desired||JSON.stringify(desired)===JSON.stringify(snapshot[key]))continue;
  const before=snapshot[key]||[],removed=before.filter(n=>!desired.includes(n)),added=desired.filter(n=>!before.includes(n));
  const merged=(latest[key]||[]).filter(n=>!removed.includes(n));for(const n of added)if(!merged.includes(n))merged.push(n);next[key]=merged;
  if(key==='standardCircumstances'&&incoming.standardConfirmed===false)next.standardConfirmed=false;
 }
 if(incoming.extra){const extra={...latest.extra};let changed=false;for(const key of Object.keys(incoming.extra) as (keyof NonNullable<Vehicle['extra']>)[])if(incoming.extra[key]!==snapshot.extra?.[key]){extra[key]=incoming.extra[key];changed=true}if(changed)next.extra=extra}
 return next;
}
