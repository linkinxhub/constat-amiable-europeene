import test from 'node:test';import assert from 'node:assert/strict';
import {componentHarness} from './lifecycle-harness.mjs';
import {synthesisCopy} from '../features/constat/synthesis-copy.ts';import {sessionCopy} from '../features/constat/session-copy.ts';import {startCopy} from '../features/constat/start-copy.ts';import {aiBudgetCopy} from '../features/constat/ai-budget-copy.ts';
const tick=()=>new Promise(r=>setImmediate(r));
const content={language:'fr',declaredA:['A says right'],declaredB:['B says straight'],agreements:[],disagreements:['Different directions'],missing:['Impact position unknown']};
const proposal={id:'fixture-id',revision:1,approvedA:true,approvedB:false,content};
const button=(h,label)=>h.nodes(n=>n.type==='Button'&&n.props.children===label)[0];
test('real summary review renders all facts as text in four languages, with stale/dirty approval blocked',()=>{
 for(const lang of ['fr','en','de','nl']){let approvals=0,rejections=0;const h=componentHarness('features/constat/synthesis-review.tsx','SynthesisReview',{'./synthesis-copy':{synthesisCopy},'./session-copy':{sessionCopy}}),props={summary:{...proposal,content:{...content,declaredA:['<script>untrusted</script>']}},revision:1,lang,disabled:false,onApprove(){approvals++},onReject(){rejections++}};
 try{h.render(props);assert.equal(h.nodes(n=>n.type==='h3').length,5);assert.equal(h.nodes(n=>n.type==='li'&&n.props.children==='<script>untrusted</script>').length,1);button(h,synthesisCopy[lang].approve).props.onClick();button(h,synthesisCopy[lang].reject).props.onClick();assert.equal(approvals,1);assert.equal(rejections,1);h.render({...props,revision:2});assert.equal(button(h,synthesisCopy[lang].approve).props.disabled,true);assert.equal(h.nodes(n=>n.props.role==='alert').length,1);h.render({...props,disabled:true});assert.equal(button(h,synthesisCopy[lang].approve).props.disabled,true)}finally{h.unmount()}}
});
test('real AI panel uses distinct consent and exact summary id, gates sketch and automatic stages',async()=>{
 const original=globalThis.fetch;let remote={configured:true,consents:{consent_a:1,consent_b:1,summary_consent_a:1,summary_consent_b:1,auto_summary_revision:1,auto_sketch_revision:0},summary:proposal,proposal:null};const sent=[];
 globalThis.fetch=async(_url,init)=>{if(init?.method==='POST'){sent.push(JSON.parse(init.body));return Response.json({ok:true})}return Response.json(remote)};
 const h=componentHarness('features/constat/sketch-panel.tsx','AiPanel',{'./synthesis-review':{SynthesisReview:'SynthesisReview'},'./synthesis-copy':{synthesisCopy},'./session-copy':{sessionCopy},'./start-copy':{startCopy},'./ai-budget-copy':{aiBudgetCopy}}),props={sessionId:'fixture-session',revision:1,lang:'fr',disabled:false,participantsDone:true,auto:false,canAuto:true};
 try{h.render(props);await tick();h.render(props);assert.equal(button(h,sessionCopy.fr.generate).props.disabled,true);button(h,synthesisCopy.fr.consent).props.onClick();await tick();h.render(props);assert.equal(sent[0].action,'summaryConsent');h.nodes(n=>n.type==='SynthesisReview')[0].props.onApprove();await tick();h.render(props);assert.equal(sent[1].key,proposal.id);assert.equal(sent[1].action,'summaryApprove');
 remote={...remote,summary:{...proposal,approvedB:true}};button(h,synthesisCopy.fr.consent).props.onClick();await tick();h.render(props);assert.equal(button(h,sessionCopy.fr.generate).props.disabled,false);h.render({...props,auto:true});await tick();h.render({...props,auto:true});assert.equal(sent.at(-1).action,'auto');h.render({...props,auto:true,disabled:true});assert.equal(button(h,sessionCopy.fr.generate).props.disabled,true);
 }finally{h.unmount();globalThis.fetch=original}
});
