'use client';
import {useRef,useState} from 'react';
import type {ReactNode} from 'react';
import {Siren,Shirt,TriangleAlert,Phone,ShieldCheck} from 'lucide-react';
import {Button} from '@/components/ui/button';
import type {Lang} from './i18n';
import {onboardingCopy} from './onboarding-copy';

// Personal UI acknowledgement, deliberately not a medical statement, consent,
// signature, or saved claim about either driver. Never bypasses server checks.
export function SafetyGate({lang,scope,required=true,children}:{lang:Lang,scope:string,required?:boolean,children:ReactNode}) {
 const [acknowledged,setAcknowledged]=useState<string|null>(null),content=useRef<HTMLDivElement>(null),c=onboardingCopy[lang];
 const safe=acknowledged===scope;
 function proceed(){setAcknowledged(scope);requestAnimationFrame(()=>content.current?.focus())}
 return <div ref={content} tabIndex={-1} className="safety-gate">
  {required&&!safe?<section className="safety-onboarding" aria-labelledby="safety-title">
   <span className="safety-badge"><ShieldCheck aria-hidden="true"/> Accordia</span>
   <h2 id="safety-title">{c.safety}</h2><p className="onboarding-intro">{c.intro}</p>
   <ul className="safety-checklist">{[[Siren,c.lights],[Shirt,c.vest],[TriangleAlert,c.triangle]].map(([Icon,label],i)=>{const Symbol=Icon as typeof Siren;return <li key={i}><Symbol aria-hidden="true"/><span>{label as string}</span></li>})}</ul>
   <p className="safety-shelter">{c.shelter}</p><p className="muted">{c.caution}</p>
   <a className="emergency" href="tel:112"><Phone aria-hidden="true"/>{c.emergency}</a>
   <Button type="button" className="safety-continue" onClick={proceed}>{c.safe}<ShieldCheck aria-hidden="true"/></Button>
  </section>:required&&<Button type="button" variant="ghost" className="safety-reopen no-print" onClick={()=>{setAcknowledged(null);requestAnimationFrame(()=>content.current?.focus())}}>{c.reviewSafety}</Button>}
  <div hidden={required&&!safe}>{children}</div>
 </div>;
}
