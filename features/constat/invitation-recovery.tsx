'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import type {Lang} from './i18n';
import {recoverInvitation,rememberInvitation} from './pending-invitation';
import {sharingCopy} from './sharing-copy';
export function InvitationRecovery({sessionId,lang,disabled,onToken}:{sessionId:string,lang:Lang,disabled:boolean,onToken:(token:string)=>void}){
 const [value,setValue]=useState(''),[issue,setIssue]=useState(''),[recovered,setRecovered]=useState(false),c=sharingCopy[lang];
 return <form className="invitation-recovery" onSubmit={e=>{e.preventDefault();try{const token=recoverInvitation(value,location.origin,sessionId);try{rememberInvitation(sessionStorage,sessionId,token)}catch{};onToken(token);setValue('');setIssue('');setRecovered(true)}catch(e){setRecovered(false);setIssue(e instanceof Error&&e.message==='different_invitation'?'different':'invalid')}}}><label className="field"><span>{c.label}</span><input type="text" value={value} disabled={disabled} maxLength={600} autoComplete="off" autoCapitalize="none" spellCheck={false} aria-invalid={!!issue} onChange={e=>{setValue(e.target.value);setIssue('');setRecovered(false)}}/></label><Button disabled={disabled||!value.trim()} type="submit" variant="outline">{c.recover}</Button>{issue&&<p role="alert">{issue==='different'?c.different:c.invalid}</p>}{recovered&&<p role="status">{c.ready}</p>}</form>
}
