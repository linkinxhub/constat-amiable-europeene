import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {componentHarness} from './lifecycle-harness.mjs';
import {participationModes} from '../features/constat/participation-model.ts';
import {onboardingCopy} from '../features/constat/onboarding-copy.ts';

test('real constat route accepts only the same-device presentation preset, without granting an identity',async()=>{
 const js=ts.transpileModule(readFileSync('app/constat/page.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const result={exports:{}};
 const modules={'@/features/constat/workspace':{default:'Workspace'},'../chatgpt-auth':{getChatGPTUser:async()=>null,chatGPTSignInPath:()=>'/signin-with-chatgpt'},'react/jsx-runtime':{jsx:(type,props)=>({type,props})}};
 new Function('require','exports',js)(key=>modules[key],result.exports);
 for(const entry of ['same-device','two-devices','admin','https://evil.test',undefined]){
  const page=await result.exports.default({searchParams:Promise.resolve({entry})});
  assert.equal(page.props.initialParticipationMode,entry==='same-device'?'same-device':undefined);
  assert.equal(page.props.account,null);
 }
});
test('same-phone preselection still needs confirmation and preserves the actual selected mode in four languages',()=>{
 for(const lang of ['fr','en','de','nl']){
  const accepted=[];
  const h=componentHarness('features/constat/participation-mode.tsx','ParticipationModePicker',{'./onboarding-copy':{onboardingCopy},'./participation-model':{participationModes}});
  const props={lang,value:'same-device',disabled:false,onContinue:mode=>accepted.push(mode)};
  h.render(props);
  assert.equal(accepted.length,0);
  assert.equal(h.nodes(n=>n.type==='input'&&n.props.checked)[0].props.value,'same-device');
  h.nodes(n=>n.type==='Button')[0].props.onClick();
  assert.deepEqual(accepted,['same-device']);
  h.unmount();
 }
});
