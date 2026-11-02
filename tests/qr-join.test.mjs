import test from 'node:test';
import assert from 'node:assert/strict';
import {componentHarness} from './lifecycle-harness.mjs';
import {experienceCopy} from '../features/constat/experience-copy.ts';
import {sharingCopy} from '../features/constat/sharing-copy.ts';
import {invitationPath} from '../features/constat/join-model.ts';
import * as invitation from '../features/constat/pending-invitation.ts';
const modules={'./qr-scanner':{QrScanner:'QrScanner'},'./pending-invitation':invitation,'./sharing-copy':{sharingCopy},'./browser-ready':{useBrowserReady:()=>true},'./experience-copy':{experienceCopy},'./join-model':{invitationPath},'../product/site-header':{SiteHeader:'SiteHeader',SiteFooter:'SiteFooter'}};
test('scan fills the real join form, waits for explicit submit and retains strict navigation checks in four languages',()=>{
 const before={window:globalThis.window,document:globalThis.document,sessionStorage:globalThis.sessionStorage};const origin='https://accordia.example',valid=origin+'/session/test_session_12345678#invite='+'a'.repeat(64);let destination='',stored=0;
 globalThis.document={documentElement:{lang:''}};globalThis.window={location:{origin,assign:value=>destination=value}};globalThis.sessionStorage={setItem(){stored++}};
 try{for(const lang of ['fr','en','de','nl']){destination='';stored=0;const h=componentHarness('features/constat/join-panel.tsx','JoinPanel',modules);const props={initialLanguage:lang};h.render(props);h.nodes(n=>n.type==='QrScanner')[0].props.onLink(valid);h.render(props);assert.equal(h.nodes(n=>n.type==='input')[0].props.value,valid);assert.equal(destination,'');assert.equal(stored,0);const form=()=>h.nodes(n=>n.type==='form')[0];form().props.onSubmit({preventDefault(){}});assert.equal(destination,valid.slice(origin.length));assert.equal(stored,1);
 destination='';h.nodes(n=>n.type==='input')[0].props.onChange({target:{value:valid.replace(origin,'https://foreign.example')}});h.render(props);form().props.onSubmit({preventDefault(){}});h.render(props);assert.equal(destination,'');assert.equal(h.nodes(n=>n.props?.role==='alert').length,1);h.unmount();}}
 finally{for(const [key,value]of Object.entries(before))if(value===undefined)delete globalThis[key];else globalThis[key]=value}
});
