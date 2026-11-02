import * as pendingInvitation from '../features/constat/pending-invitation.ts';
import {sharingCopy} from '../features/constat/sharing-copy.ts';
import {experienceCopy} from '../features/constat/experience-copy.ts';
import test from 'node:test';import assert from 'node:assert/strict';
import {componentHarness} from './lifecycle-harness.mjs';
import {pdfFixture} from './pdf-fixture.mjs';
import {finalCopy} from '../features/constat/final-copy.ts';
import {policyCopy} from '../features/constat/policy-copy.ts';
import {deviceCopy} from '../features/constat/device-copy.ts';
import {quickFlowCopy} from '../features/constat/quick-flow-copy.ts';
import {dictionaries} from '../features/constat/i18n.ts';
import * as deviceModel from '../features/constat/same-device-model.ts';
import {complete} from '../features/constat/model.ts';
import {styles} from '../features/constat/final-model.ts';
import {missingFields} from '../features/constat/completeness.ts';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const base={'./review-navigation':{focusReviewEditor(){}},'./quick-flow-copy':{quickFlowCopy},'./final-copy':{finalCopy},'./flow-steps':{FlowSteps:'FlowSteps'},'./usage-guide':{usageCopy:{fr:['','edit']},UsageGuide:'UsageGuide'},'./final-model':{styles},'./completeness':{missingFields}};
const button=(h,label)=>h.nodes(n=>n.type==='Button'&&n.props.children===label)[0];
test('local PDF rejects a generation that finishes after source data changed, and invalidates its previous link immediately',async()=>{
 let resolve,generated=0;const pending=new Promise(r=>resolve=r),original=URL.createObjectURL;URL.createObjectURL=()=>{generated++;return 'blob:TEST-FICTIF'};
 const h=componentHarness('features/constat/local-pdf.tsx','LocalPdf',{...base,'../../server/pdf-renderer':{renderPdf:()=>pending}}),report=pdfFixture(),props={report,lang:'fr',style:'keyboard',onStyle(){},onEdit(){}};
 try{h.render(props);button(h,finalCopy.fr.prepare).props.onClick();h.render({...props,report:{...report,place:'CHANGED'}});resolve(new Uint8Array([1]));await tick();h.render({...props,report:{...report,place:'CHANGED'}});assert.equal(generated,0);assert.equal(h.nodes(n=>n.type==='a'&&n.props.href?.startsWith('blob:')).length,0)}finally{h.unmount();URL.createObjectURL=original}
});
test('refusal confirmation resets before a changed declaration can be generated; late PDFs are discarded',async()=>{
 let resolve,generated=0;const pending=new Promise(r=>resolve=r),original=URL.createObjectURL;URL.createObjectURL=()=>{generated++;return 'blob:TEST-FICTIF'};
 const h=componentHarness('features/constat/refusal-panel.tsx','RefusalPanel',{'./policy-copy':{policyCopy},'./storage':{newLocalId:()=> 'TEST-FICTIF'},'./fields':{TextField:'TextField'},'@/components/ui/checkbox':{Checkbox:'Checkbox'},'@/components/ui/native-select':{NativeSelect:'Select',NativeSelectOption:'Option'},'../../server/pdf-renderer':{renderPdf:()=>pending}}),props={report:pdfFixture(),lang:'fr'};
 try{h.render(props);h.nodes(n=>n.type==='Checkbox')[0].props.onCheckedChange(true);h.render(props);assert.equal(button(h,policyCopy.fr.generate).props.disabled,false);button(h,policyCopy.fr.generate).props.onClick();const changed={...props,report:{...props.report,place:'CHANGED'}};h.render(changed);resolve(new Uint8Array([1]));await tick();h.render(changed);assert.equal(generated,0);assert.equal(h.nodes(n=>n.type==='Checkbox')[0].props.checked,false);assert.equal(button(h,policyCopy.fr.generate).props.disabled,true)}finally{h.unmount();URL.createObjectURL=original}
});
test('shared-device completion never resurrects after editing and reverting facts or switching reports',()=>{
 const h=componentHarness('features/constat/same-device.tsx','SameDevice',{...base,'./save-status':{SaveStatus:'SaveStatus'},'./entry-mode':{EntryMode:'EntryMode'},'./questionnaire':{Questionnaire:'Questionnaire'},'./retention':{retentionDeadline:()=>0},'./refusal-panel':{RefusalPanel:'RefusalPanel'},'@noble/hashes/sha2.js':{sha256:()=>new Uint8Array()},'@noble/hashes/utils.js':{bytesToHex:()=>''},'@/components/ui/checkbox':{Checkbox:'Checkbox'},'@/components/ui/native-select':{NativeSelect:'Select',NativeSelectOption:'Option'},'./i18n':{dictionaries},'./model':{complete},'./same-device-model':deviceModel,'./device-copy':{deviceCopy},'./fields':{VehicleForm:'VehicleForm',TextField:'TextField'},'./form-details':{FormDetails:'FormDetails'},'./evidence':{Evidence:'Evidence'},'./signature-pad':{SignaturePad:'SignaturePad'},'./completeness-panel':{CompletenessPanel:'CompletenessPanel'},'./storage':{newLocalId:()=> 'TEST-FICTIF',saveLocalDocument:async()=>{}},'./local-documents':{LocalDocuments:'LocalDocuments',documentCopy:{fr:{}}}});
 const previousFrame=globalThis.requestAnimationFrame;globalThis.requestAnimationFrame=()=>0;
 const report=pdfFixture(),props={report,lang:'fr',active:true,saved:true,onChange(){},onBack(){},onSave:async()=>true};
 try{h.render(props);h.nodes(n=>n.type==='Questionnaire')[0].props.onDone();h.render(props);assert.equal(h.nodes(n=>n.type==='Questionnaire')[0].props.side,1);h.nodes(n=>n.type==='Questionnaire')[0].props.onDone();h.render(props);assert.equal(button(h,deviceCopy.fr.prepare).props.disabled,false);
 const changed={...report,vehicles:[{...report.vehicles[0],plate:'CHANGED'},report.vehicles[1]]};h.render({...props,report:changed});assert.equal(button(h,deviceCopy.fr.prepare).props.disabled,true);h.render(props);assert.equal(button(h,deviceCopy.fr.prepare).props.disabled,true);
 h.render({...props,report:{...report,id:'TEST-OTHER-REPORT',start:{ownerSide:'B'}}});assert.equal(h.nodes(n=>n.type==='Questionnaire')[0].props.side,1);assert.equal(button(h,deviceCopy.fr.prepare).props.disabled,true);
 }finally{h.unmount();globalThis.requestAnimationFrame=previousFrame}
});
test('Join restores a stored language after hydration while an explicit URL language wins; invalid storage remains safe',()=>{
 const original={document:globalThis.document,localStorage:globalThis.localStorage};
 globalThis.document={documentElement:{lang:''}};
 const joinModules={'./qr-scanner':{QrScanner:'QrScanner'},'./pending-invitation':pendingInvitation,'./sharing-copy':{sharingCopy},'./browser-ready':{useBrowserReady:()=>true},'./experience-copy':{experienceCopy},'./join-model':{invitationPath:()=>''},'../product/site-header':{SiteHeader:'SiteHeader',SiteFooter:'SiteFooter'}};
 try{for(const [stored,explicit,expected] of [['en',undefined,'en'],['de','fr','fr'],['unsupported',undefined,'fr'],[null,undefined,'fr']]){
  globalThis.localStorage={getItem(){return stored}};
  const h=componentHarness('features/constat/join-panel.tsx','JoinPanel',joinModules);
  try{h.render({initialLanguage:explicit});assert.equal(h.nodes(n=>n.type==='SiteHeader')[0].props.lang,expected);assert.equal(globalThis.document.documentElement.lang,expected)}finally{h.unmount()}
 }}finally{Object.assign(globalThis,original)}
});
