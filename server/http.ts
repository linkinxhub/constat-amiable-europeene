import {MAX_PAYLOAD,ReportError} from './report-service.ts';
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Cookie'}});}
export function writeGuard(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)throw new ReportError(403,'origin');
 if(req.headers.get('sec-fetch-site')==='cross-site')throw new ReportError(403,'origin');
 if(req.headers.get('x-accordia-request')!=='1')throw new ReportError(403,'origin');
 if(req.headers.get('content-type')?.split(';')[0].trim()!=='application/json')throw new ReportError(415,'invalid');
}
export async function readJson(req:Request,limit=MAX_PAYLOAD){
 if(Number(req.headers.get('content-length'))>limit)throw new ReportError(413,'too_large');
 const reader=req.body?.getReader();if(!reader)throw new ReportError(400,'invalid');
 let size=0;const chunks:Uint8Array[]=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new ReportError(413,'too_large');}chunks.push(value);}}finally{reader.releaseLock();}
 const joined=new Uint8Array(size);let offset=0;for(const part of chunks){joined.set(part,offset);offset+=part.byteLength;}
 try{return JSON.parse(new TextDecoder().decode(joined));}catch{throw new ReportError(400,'invalid');}
}
export function failure(error:unknown){if(error instanceof ReportError)return json({error:error.code},error.status);console.error('Accordia storage request failed');return json({error:'unavailable'},503);}
