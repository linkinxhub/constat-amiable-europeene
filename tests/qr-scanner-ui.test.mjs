import test from 'node:test';
import assert from 'node:assert/strict';
import {componentHarness} from './lifecycle-harness.mjs';
import {qrScanCopy} from '../features/constat/qr-scan-copy.ts';
import {invitationPath} from '../features/constat/join-model.ts';
test('scanner never requests camera on mount; insecure browser shows translated fallback and keeps paste path available',()=>{
 const previous={window:globalThis.window,document:globalThis.document};let opened=0;const events=new Map();globalThis.window={isSecureContext:false,addEventListener:(k,fn)=>events.set(k,fn),removeEventListener:k=>events.delete(k)};globalThis.document={addEventListener:(k,fn)=>events.set(k,fn),removeEventListener:k=>events.delete(k)};
 try{for(const lang of ['fr','en','de','nl']){const h=componentHarness('features/constat/qr-scanner.tsx','QrScanner',{'./qr-scan-copy':{qrScanCopy},'./join-model':{invitationPath},'./qr-camera':{createQrCamera(){opened++;throw Error('must not open')}}});const props={lang,onLink(){throw Error('must not navigate')}};h.render(props);assert.equal(opened,0);h.nodes(n=>n.type==='Button'&&n.props.children===qrScanCopy[lang].start)[0].props.onClick();h.render(props);assert.equal(opened,0);assert.equal(h.nodes(n=>n.props?.role==='alert')[0].props.children,qrScanCopy[lang].unavailable);assert.equal(h.nodes(n=>n.type==='video')[0].props.hidden,true);h.unmount();assert.equal(events.size,0)}}finally{globalThis.window=previous.window;globalThis.document=previous.document}
});
