import {MAX_PAYLOAD,ReportError} from './report-service.ts';
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Cookie'}});}
export function writeGuard(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)throw new ReportError(403,'origin');
 if(req.headers.get('sec-fetch-site')==='cross-site')throw new ReportError(403,'origin');
 if(req.headers.get('x-accordia-request')!=='1')throw new ReportError(403,'origin');
 if(req.headers.get('content-type')?.split(';')[0].trim()!=='application/json')throw new ReportError(415,'invalid');
}
export const JSON_BODY_TIMEOUT_MS=60000;
export async function readJson(req:Request,limit=MAX_PAYLOAD,timeoutMs=JSON_BODY_TIMEOUT_MS){
 if(Number(req.headers.get('content-length'))>limit)throw new ReportError(413,'too_large');
 const reader=req.body?.getReader();if(!reader)throw new ReportError(400,'invalid');
 let size=0;const chunks:Uint8Array[]=[];
 let timer:ReturnType<typeof setTimeout>|undefined;
 const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{reject(new ReportError(408,'body_timeout'));void reader.cancel().catch(()=>{})},timeoutMs)});
 try{while(true){const {done,value}=await Promise.race([reader.read(),deadline]);if(done)break;size+=value.byteLength;if(size>limit){void reader.cancel().catch(()=>{});throw new ReportError(413,'too_large');}chunks.push(value);}}finally{clearTimeout(timer);reader.releaseLock();}
 const joined=new Uint8Array(size);let offset=0;for(const part of chunks){joined.set(part,offset);offset+=part.byteLength;}
 try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(joined));}catch{throw new ReportError(400,'invalid');}
}
export function failure(error:unknown){if(error instanceof ReportError)return json({error:error.code},error.status);console.error('Accordia storage request failed');return json({error:'unavailable'},503);}
