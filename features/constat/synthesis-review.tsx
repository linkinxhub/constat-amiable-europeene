'use client';
import {Button} from '@/components/ui/button';
import type {Lang} from './i18n';
import type {Synthesis} from './synthesis-model';
import {synthesisCopy} from './synthesis-copy';
import {sessionCopy} from './session-copy';
export type SummaryProposal={id:string,revision:number,approvedA:boolean,approvedB:boolean,content:Synthesis};
export function SynthesisReview({summary,revision,lang,disabled,onApprove,onReject}:{summary:SummaryProposal,revision:number,lang:Lang,disabled:boolean,onApprove:()=>void,onReject:()=>void}){
 const t=synthesisCopy[lang],c=sessionCopy[lang],current=summary.revision===revision;
 return <div className="synthesis-review"><p>{t.language} : {summary.content.language.toUpperCase()}</p>{!current&&<p role="alert">{c.stale}</p>}{(['declaredA','declaredB','agreements','disagreements','missing'] as const).map((key,i)=><section key={key}><h3>{t.labels[i]}</h3>{summary.content[key].length?<ul lang={summary.content.language}>{summary.content[key].map((text,j)=><li key={j}>{text}</li>)}</ul>:<p>{t.empty}</p>}</section>)}<p>{t.correct}</p><Button disabled={disabled||!current} onClick={onApprove}>{t.approve}</Button><Button variant="outline" disabled={disabled||!current} onClick={onReject}>{t.reject}</Button><p>{c.approved} · A {summary.approvedA&&current?'✓':'—'} · B {summary.approvedB&&current?'✓':'—'}</p></div>
}
