import {purgeExpired} from './retention-service.ts';
import type {Stores} from './report-service.ts';

const LEASE_MS=5*60_000;
const IDLE_MS=5*60_000;
const RETRY_MS=60_000;
type Row={lock_token:string|null;lock_until:number;next_attempt:number;last_started:number|null;last_finished:number|null;last_success:number|null;last_error:string|null;reports:number;objects:number;more:number};
export async function retentionStatus(stores:Stores){
 const row=await stores.db.prepare("SELECT * FROM retention_maintenance WHERE id='retention'").first<Row>();
 return {mode:'on_activity' as const,running:!!row?.lock_token&&(row.lock_until>Date.now()),nextAttemptAt:row?.next_attempt||0,lastStartedAt:row?.last_started??null,lastFinishedAt:row?.last_finished??null,lastSuccessAt:row?.last_success??null,error:row?.last_error||null,reports:row?.reports||0,objects:row?.objects||0,more:!!row?.more};
}
// The server triggers at most one bounded batch per minute while there is work.
// This is not a clock-based scheduler: without requests, no job is invoked.
export async function runRetentionMaintenance(stores:Stores,force=false){
 const now=Date.now(),token=crypto.randomUUID();
 const claim=await stores.db.prepare(`UPDATE retention_maintenance SET lock_token=?,lock_until=?,last_started=?,last_error=NULL WHERE id='retention' AND (lock_token IS NULL OR lock_until<=?) ${force?'':'AND next_attempt<=?'}`).bind(token,now+LEASE_MS,now,now,...(force?[]:[now])).run();
 if(claim.meta.changes!==1)return {ran:false};
 try{
  const result=await purgeExpired(stores);const finished=Date.now();
  const commit=await stores.db.prepare("UPDATE retention_maintenance SET lock_token=NULL,lock_until=0,last_finished=?,last_success=?,last_error=NULL,next_attempt=?,reports=?,objects=?,more=? WHERE id='retention' AND lock_token=?").bind(finished,finished,finished+(result.more?RETRY_MS:IDLE_MS),result.reports,result.objects,Number(result.more),token).run();
  return {ran:true,...result,recorded:commit.meta.changes===1};
 }catch{
  // Only a fixed error code is retained: no keys, report text or provider errors.
  const finished=Date.now();
  await stores.db.prepare("UPDATE retention_maintenance SET lock_token=NULL,lock_until=0,last_finished=?,last_error='cleanup_failed',next_attempt=?,reports=0,objects=0,more=1 WHERE id='retention' AND lock_token=?").bind(finished,finished+RETRY_MS,token).run();
  return {ran:true,error:'cleanup_failed' as const};
 }
}
// Maintenance failures must never hide a driver's report or discard their entry.
export async function tryRetentionMaintenance(stores:Stores){try{return await runRetentionMaintenance(stores);}catch{console.error('Accordia retention maintenance unavailable');return {ran:false,error:'unavailable' as const};}}
