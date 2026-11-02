import {pricingCopy} from '../constat/pricing-copy.ts';
import {offerIds} from '../constat/offer-model.ts';
import type {Lang} from '../constat/i18n';
import {presentationCopy} from './presentation-copy.ts';
// A saved fleet preference is deliberately not a choice of a paid fleet tier.
export function offerOptions(lang:Lang){const c=presentationCopy[lang],plans=pricingCopy[lang].plans;return offerIds.map((id,i)=>({id,...(i<3?plans[i]:{name:c.fleetPreference,price:c.from+' '+plans[3].price,period:c.fleetPeriod,detail:c.fleetDetail,benefit:''}),status:i===0?c.available:i<3?pricingCopy[lang].planned:pricingCopy[lang].fleetStatus}));}
