export const PRIVATE_REQUEST_TIMEOUT_MS=20000;
export class PrivateRequestError extends Error{}
// Bound both response headers and JSON-body reads. Never retry an uncertain write.
export async function privateRequest(path:string,options:RequestInit={},signal?:AbortSignal,timeoutMs=PRIVATE_REQUEST_TIMEOUT_MS):Promise<unknown>{
 if(signal?.aborted)throw new PrivateRequestError('cancelled');
 const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
 let cancel:()=>void=()=>{};
 const cancelled=new Promise<never>((_,reject)=>{cancel=()=>{reject(new PrivateRequestError('cancelled'));controller.abort()};if(signal?.aborted)cancel();else signal?.addEventListener('abort',cancel,{once:true})});
 const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{reject(new PrivateRequestError('request_timeout'));controller.abort()},timeoutMs)});
 try{
  if(signal?.aborted)throw new PrivateRequestError('cancelled');
  const response=await Promise.race([fetch(path,{...options,credentials:'same-origin',cache:'no-store',redirect:'error',signal:controller.signal}),deadline,cancelled]);
  const data:unknown=await Promise.race([response.json(),deadline,cancelled]);
  if(!response.ok){const code=data&&typeof data==='object'&&'error' in data&&typeof data.error==='string'?data.error:'unavailable';throw new PrivateRequestError(code)}
  return data;
 }finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel)}
}
