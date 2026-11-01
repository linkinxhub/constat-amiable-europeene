import type {Lang} from './i18n';import {experienceCopy} from './experience-copy';
export function FlowSteps({lang,phase}:{lang:Lang,phase:number}){return <ol className="flow-steps" aria-label={experienceCopy[lang].stages[phase]}>{experienceCopy[lang].stages.map((s,i)=><li key={s} aria-current={phase===i?'step':undefined}><span>{i+1}</span>{s}</li>)}</ol>}
