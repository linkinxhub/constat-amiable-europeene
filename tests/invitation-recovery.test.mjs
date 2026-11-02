import test from 'node:test';import assert from 'node:assert/strict';
import {tokenFromFragment,rememberInvitation,pendingInvitation,forgetInvitation,recoverInvitation,INVITATION_TTL} from '../features/constat/pending-invitation.ts';
import {invitationPath} from '../features/constat/join-model.ts';
import {sharingCopy} from '../features/constat/sharing-copy.ts';
import {componentHarness} from './lifecycle-harness.mjs';
const id='f3434051-0f14-49e0-be25-67f1e387ca13',token='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaabbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',origin='https://accordia.example',link=origin+'/session/'+id+'#invite='+token;
const storage=()=>{const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)}};
test('pending invitation survives a sign-in return without fragment, is scoped, expires and clears safely',()=>{
 const s=storage();assert.ok(rememberInvitation(s,id,token,100));assert.equal(pendingInvitation(s,id,101),token);assert.equal(pendingInvitation(s,'another',101),'');assert.equal(pendingInvitation(s,id,100+INVITATION_TTL),'');assert.equal(s.getItem('accordia-invite-'+id),null);
 s.setItem('accordia-invite-'+id,token);assert.equal(pendingInvitation(s,id,200),token);assert.equal(JSON.parse(s.getItem('accordia-invite-'+id)).token,token);forgetInvitation(s,id);assert.equal(pendingInvitation(s,id),'');
 for(const raw of ['{bad',JSON.stringify({token,at:Infinity}),JSON.stringify({token,at:1000})]){s.setItem('accordia-invite-'+id,raw);assert.equal(pendingInvitation(s,id,999),'')}
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}};assert.equal(rememberInvitation(blocked,id,token),false);assert.equal(pendingInvitation(blocked,id),'');assert.doesNotThrow(()=>forgetInvitation(blocked,id));
});
test('recovery accepts only the complete same-site same-report invitation and never query or foreign tokens',()=>{
 assert.equal(recoverInvitation(link,origin,id),token);assert.equal(tokenFromFragment('#invite='+token),token);assert.equal(invitationPath(link,origin),'/session/'+id+'#invite='+token);
 for(const value of [origin+'/session/'+id,link.replace(origin,'https://evil.invalid'),link.replace('#invite=','?invite='),link+'&invite='+token,link+'&other=1',link.replace(token,'x'.repeat(101)),'javascript:alert(1)'])assert.throws(()=>recoverInvitation(value,origin,id));
 assert.throws(()=>recoverInvitation(link,origin,'other_report_12345678'),/different_invitation/);assert.equal(tokenFromFragment('#invite=short'),'');assert.equal(tokenFromFragment('#invite='+token+'&invite='+token),'');
});
test('real recovery form validates before saving, never fetches or navigates, and translates errors',()=>{
 const before={location:globalThis.location,sessionStorage:globalThis.sessionStorage};globalThis.location={origin};globalThis.sessionStorage=storage();
 try{for(const lang of ['fr','en','de','nl']){let recovered='';const h=componentHarness('features/constat/invitation-recovery.tsx','InvitationRecovery',{'./pending-invitation':{recoverInvitation,rememberInvitation},'./sharing-copy':{sharingCopy}}),props={sessionId:id,lang,disabled:false,onToken:value=>recovered=value};
 try{h.render(props);const input=()=>h.nodes(n=>n.type==='input')[0],submit=()=>h.nodes(n=>n.type==='form')[0].props.onSubmit({preventDefault(){}});input().props.onChange({target:{value:link.replace(origin,'https://evil.invalid')}});h.render(props);submit();h.render(props);assert.equal(recovered,'');assert.equal(h.nodes(n=>n.props.role==='alert')[0].props.children,sharingCopy[lang].invalid);input().props.onChange({target:{value:link}});h.render(props);submit();h.render(props);assert.equal(recovered,token);assert.equal(input().props.value,'');assert.equal(pendingInvitation(globalThis.sessionStorage,id),token);h.render({...props,disabled:true});assert.equal(input().props.disabled,true);assert.ok(sharingCopy[lang].guide.length>300)}finally{h.unmount()}}
 }finally{Object.assign(globalThis,before)}
});
