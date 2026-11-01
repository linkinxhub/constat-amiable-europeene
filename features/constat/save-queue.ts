// Serialize writes so a slower older snapshot can never overwrite a newer one.
export function saveQueue<T,R>(write:(value:T)=>Promise<R>){let tail:Promise<unknown>=Promise.resolve();return (value:T)=>{const result=tail.then(()=>write(value));tail=result.catch(()=>{});return result}}
