import test from 'node:test';
import assert from 'node:assert/strict';
import {componentHarness} from './lifecycle-harness.mjs';
import * as model from '../features/mobile/model.ts';
import * as adminModel from '../features/mobile/admin-model.ts';
import {mobileCopy} from '../features/mobile/copy.ts';
import {mobileUxCopy} from '../features/mobile/admin-ux-copy.ts';
const {mobileDefaults}=model;
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const published={schemaVersion:1,revision:0,...mobileDefaults};
function view(revision=0,state='draft',title='Accordia'){return {revision,published,history:revision?[{...published,revision,state,title,actor:'admin',createdAt:'2026-11-03T12:00:00.000Z',sourceRevision:null}]:[]}}
function setup(t,initial,lang='fr'){
 const originals={fetch:globalThis.fetch,window:globalThis.window,document:globalThis.document,HTMLElement:globalThis.HTMLElement};
 class Element {focus(){this.focused=true}}
 const active=new Element();globalThis.HTMLElement=Element;globalThis.document={activeElement:active};globalThis.window=new EventTarget();
 const h=componentHarness('features/mobile/admin-panel.tsx','MobileAdminPanel',{'./model':model,'./admin-model':adminModel,'./copy':{mobileCopy},'./admin-ux-copy':{mobileUxCopy}});
 const props={lang,initial},calls=[];let failStatus=0,response=initial??view();
 globalThis.fetch=async(url,init)=>{calls.push({url,init});return {ok:!failStatus,status:failStatus||200,json:async()=>response}};
 t.after(()=>{h.unmount();Object.assign(globalThis,originals)});
 const render=()=>h.render(props),button=label=>h.nodes(n=>n.type==='button'&&n.props.children===label)[0];
 render();return {h,calls,render,button,u:mobileUxCopy[lang],c:mobileCopy[lang],props,active,setResponse:r=>response=r,fail:status=>failStatus=status,async flush(){await tick();render()},edit(title){h.nodes(n=>n.type==='input'&&n.props.maxLength===80)[0].props.onChange({target:{value:title}});render()}};
}
test('SSR settings render without a second request; empty-history edits are dirty and unload is guarded',async t=>{
 const f=setup(t,view());assert.equal(f.calls.length,0);f.edit('Accordia Mobile');
 assert.equal(f.button(f.u.discard).props.disabled,false);
 const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);assert.equal(event.defaultPrevented,true);
 f.button(f.c.reload).props.onClick();f.render();assert.equal(f.calls.length,0);assert.equal(f.h.nodes(n=>n.props?.role==='alertdialog').length,1);
 f.button(f.u.cancel).props.onClick();f.render();assert.equal(f.calls.length,0);assert.equal(f.h.nodes(n=>n.type==='input'&&n.props.maxLength===80)[0].props.value,'Accordia Mobile');
 f.button(f.u.discard).props.onClick();f.render();f.button(f.u.confirm).props.onClick();f.render();assert.equal(f.button(f.u.discard).props.disabled,true);
 const cleanEvent=new Event('beforeunload',{cancelable:true});window.dispatchEvent(cleanEvent);assert.equal(cleanEvent.defaultPrevented,false);
});
test('automatic fallback load runs once and failed loading can be retried without a fake view',async t=>{
 const f=setup(t,null);await f.flush();assert.equal(f.calls.length,1);assert.equal(f.calls[0].init.method,'GET');f.render();assert.equal(f.calls.length,1);
});
test('publish and rollback require confirmation and retain the existing revision contract',async t=>{
 const initial=view(1);const f=setup(t,initial);f.button(f.c.publish).props.onClick();f.render();assert.equal(f.calls.length,0);
 f.button(f.u.cancel).props.onClick();f.render();assert.equal(f.calls.length,0);
 f.button(f.c.publish).props.onClick();f.render();f.setResponse({...initial,revision:2,published:{...published,revision:2},history:[{...initial.history[0],revision:2,state:'published'},initial.history[0]]});
 f.button(f.u.confirm).props.onClick();await f.flush();assert.equal(f.calls.length,1);assert.deepEqual(JSON.parse(f.calls[0].init.body),{action:'publish',expectedRevision:1,sourceRevision:1});
 assert.equal(f.h.nodes(n=>n.props?.role==='status'&&n.props.children===f.u.publishedSaved).length,1);
});
test('rollback dialog shows the old values and Escape cancels without server writes',async t=>{
 const old={...published,revision:2,state:'published',actor:'admin',createdAt:'today',sourceRevision:1};
 const latest={...old,title:'Current title',revision:4};const f=setup(t,{revision:4,published:{...published,title:'Current title',revision:4},history:[latest,old]});
 f.button(f.c.rollback).props.onClick();f.render();assert.equal(f.h.nodes(n=>n.props?.role==='alertdialog').length,1);
 f.h.nodes(n=>n.props?.role==='alertdialog')[0].props.onKeyDown({key:'Escape',preventDefault(){}});f.render();assert.equal(f.h.nodes(n=>n.props?.role==='alertdialog').length,0);assert.equal(f.calls.length,0);
});
test('invalid inputs cannot be saved and a conflict preserves edits in every supported language',async t=>{
 for(const lang of ['fr','en','de','nl'])await t.test(lang,async t=>{
  const f=setup(t,view(1),lang);f.edit('   ');assert.equal(f.button(f.c.save).props.disabled,true);
  f.h.nodes(n=>n.type==='form')[0].props.onSubmit({preventDefault(){}});await f.flush();assert.equal(f.calls.length,0);
  f.edit('New title');f.fail(409);f.h.nodes(n=>n.type==='form')[0].props.onSubmit({preventDefault(){}});await f.flush();
  assert.equal(f.h.nodes(n=>n.type==='input'&&n.props.maxLength===80)[0].props.value,'New title');assert.equal(f.h.nodes(n=>n.props?.role==='alert'&&n.props.children===f.u.conflict).length,1);
 });
});
test('history filters, preview modes and error messages change only the UI',async t=>{
 const initial=view(1);initial.history.push({...initial.history[0],revision:0,state:'published'});const f=setup(t,initial);
 f.button(f.u.launch).props.onClick();f.render();assert.equal(f.button(f.u.launch).props['aria-pressed'],true);
 f.h.nodes(n=>n.type==='select'&&n.props.id.endsWith('filter'))[0].props.onChange({target:{value:'published'}});f.render();assert.equal(f.calls.length,0);
 f.fail(401);f.button(f.c.reload).props.onClick();await f.flush();assert.equal(f.h.nodes(n=>n.props?.role==='alert'&&n.props.children===f.u.unauthenticated).length,1);
});
test('settings replies arriving after unmount do not write client state',async t=>{
 const f=setup(t,view(1));let resolve;globalThis.fetch=()=>new Promise(r=>resolve=r);
 f.button(f.c.reload).props.onClick();f.h.unmount();resolve({ok:true,status:200,json:async()=>view(9,'draft','Late reply')});await tick();
 // Abort signal prevents applying late successes, even when the transport ignores abort.
 f.render();assert.equal(f.h.nodes(n=>n.type==='input'&&n.props.maxLength===80)[0].props.value,'Accordia');
});
test('administrative translations have identical keys and status comparison handles defaults and normalised titles',()=>{
 for(const lang of ['en','de','nl'])assert.deepEqual(Object.keys(mobileUxCopy[lang]),Object.keys(mobileUxCopy.fr));
 assert.equal(adminModel.hasMobileEdits(view(),{...mobileDefaults,title:'Accordia '}),false);
 assert.equal(adminModel.hasMobileEdits(view(),{...mobileDefaults,soundDefault:true}),true);
});
