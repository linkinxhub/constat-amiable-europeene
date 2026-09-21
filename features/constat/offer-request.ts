import {z} from 'zod';
import {offerIds,type Offer} from './offer-model.ts';

// A timeout includes reading the response body, not only receiving headers.
export async function requestOffer(offer?:Offer, signal?:AbortSignal, timeoutMs=15000):Promise<Offer|null>{
  const controller=new AbortController();
  const abort=()=>controller.abort();
  signal?.addEventListener('abort',abort,{once:true});
  if(signal?.aborted)abort();
  const timer=setTimeout(abort,timeoutMs);
  try{
    const response=await fetch('/api/account/offer',{
      method:offer===undefined?'GET':'PUT',cache:'no-store',credentials:'same-origin',signal:controller.signal,
      ...(offer===undefined?{}:{headers:{'Content-Type':'application/json','X-Accordia-Request':'1'},body:JSON.stringify({offer})})
    });
    if(!response.ok)throw new Error('offer_unconfirmed');
    const value=z.object({offer:z.enum(offerIds).nullable()}).parse(await response.json()).offer;
    if(offer!==undefined&&value!==offer)throw new Error('offer_unconfirmed');
    return value;
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort)}
}
