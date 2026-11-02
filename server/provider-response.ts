import {ReportError} from './report-service.ts';
export async function providerText(response:Response,limit:number,code:string){
 if(!response.ok){await response.body?.cancel();throw new ReportError(503,code)}
 const reader=response.body?.getReader();if(!reader)throw new ReportError(503,code);
 const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new Error('limit')}chunks.push(value)}}catch{throw new ReportError(503,code)}finally{reader.releaseLock()}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}return new TextDecoder().decode(bytes);
}
