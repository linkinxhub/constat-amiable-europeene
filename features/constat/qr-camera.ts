type Stream={getTracks:()=>{stop:()=>void}[]};
// Owns camera lifetime, including permission prompts that finish after cancellation.
export function createQrCamera({open,attach,decode,onValue,onError,schedule=(fn:()=>void)=>setTimeout(fn,250),cancel=(id:ReturnType<typeof setTimeout>)=>clearTimeout(id)}:{open:(isCurrent:()=>boolean)=>Promise<Stream>;attach:(stream:Stream)=>Promise<void>;decode:()=>string|null;onValue:(value:string)=>boolean;onError:(error:unknown)=>void;schedule?:(fn:()=>void)=>ReturnType<typeof setTimeout>;cancel?:(id:ReturnType<typeof setTimeout>)=>void}){
 let generation=0,stream:Stream|null=null,timer:ReturnType<typeof setTimeout>|undefined;
 const release=(s:Stream)=>s.getTracks().forEach(track=>track.stop());
 function stop(){generation++;if(timer!==undefined){cancel(timer);timer=undefined}if(stream){release(stream);stream=null}}
 async function start(){stop();const run=generation;let last='';
  try{const opened=await open(()=>run===generation);if(run!==generation){release(opened);return}stream=opened;await attach(opened);if(run!==generation)return;
   const tick=()=>{if(run!==generation)return;try{const value=decode();if(value&&value!==last){last=value;if(onValue(value)){stop();return}}timer=schedule(tick)}catch(error){stop();onError(error)}};tick();
  }catch(error){if(run!==generation)return;stop();onError(error)}
 }
 return {start,stop};
}
