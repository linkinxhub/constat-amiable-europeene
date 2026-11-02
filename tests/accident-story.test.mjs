import {createRecordedNarration,frenchNarration} from '../features/marketing/recorded-narration.ts';
import test from 'node:test';import assert from 'node:assert/strict';
import {componentHarness} from './lifecycle-harness.mjs';
import {createNarration,browserNarration} from '../features/marketing/story-narration.ts';
import {storyNarrationCopy} from '../features/marketing/story-narration-copy.ts';
import {accidentStoryCopy} from '../features/marketing/accident-story-copy.ts';
function fixture(lang,reduced=false){
 const old=Object.fromEntries(['document','IntersectionObserver','setInterval','clearInterval'].map(k=>[k,globalThis[k]])),timers=new Map(),listeners=new Map();let notify,disconnected=false,next=0;
 globalThis.document={hidden:false,addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name,fn)=>{if(listeners.get(name)===fn)listeners.delete(name)}};
 globalThis.IntersectionObserver=class{constructor(fn){notify=fn}observe(){}disconnect(){disconnected=true}};
 globalThis.setInterval=fn=>{const id=++next;timers.set(id,fn);return id};globalThis.clearInterval=id=>timers.delete(id);
 const deps={'./recorded-narration':{createRecordedNarration,frenchNarration},'../constat/browser-ready':{useBrowserReady:()=>false},'./story-narration':{createNarration,browserNarration},'./story-narration-copy':{storyNarrationCopy},'./motion-preference':{useReducedMotion:()=>reduced},'./accident-story-copy':{accidentStoryCopy},'lucide-react':Object.fromEntries(['Pause','Play','RotateCcw','ArrowUpRight','ShieldCheck','Volume2','VolumeX'].map(k=>[k,k]))};
 const h=componentHarness('features/marketing/accident-story.tsx','AccidentStory',deps),props={lang};
 const render=()=>h.render(props),section=()=>h.nodes(n=>n.type==='section')[0];render();h.nodes(n=>n.type==='div'&&n.props.className==='story-art')[0].props.ref({});render();
 return {h,props,render,section,timers,enter(value,ratio=value?1:0){notify([{isIntersecting:value,intersectionRatio:ratio}]);render()},tick(n=1){for(let i=0;i<n;i++){for(const fn of [...timers.values()])fn();render()}},visibility(hidden){globalThis.document.hidden=hidden;listeners.get('visibilitychange')();render()},close(){h.unmount();assert.equal(timers.size,0);assert.equal(listeners.size,0);assert.equal(disconnected,true);for(const [k,v] of Object.entries(old))if(v===undefined)delete globalThis[k];else globalThis[k]=v}};
}
test('real scene runs once, pauses locally/offscreen/background/globally, replays and cleans up in four languages',()=>{
 for(const lang of ['fr','en','de','nl']){const f=fixture(lang),c=accidentStoryCopy[lang];try{
  assert.equal(f.timers.size,0);f.enter(true);assert.equal(f.section().props['data-phase'],0);f.tick(16);assert.equal(f.section().props['data-phase'],1);
  const control=()=>f.h.nodes(n=>n.type==='button')[0];control().props.onClick();f.render();assert.equal(f.timers.size,0);f.tick(32);assert.equal(f.section().props['data-phase'],1);assert.equal(control().props.children[1],c.resume);
  control().props.onClick();f.render();f.enter(false);assert.equal(f.timers.size,0);f.enter(true);f.visibility(true);assert.equal(f.timers.size,0);f.visibility(false);assert.equal(f.timers.size,1);
  f.props.paused=true;f.render();assert.equal(f.timers.size,0);assert.equal(control().props.disabled,true);f.props.paused=false;f.render();f.tick(16);assert.equal(f.section().props['data-phase'],2);f.tick(28);assert.equal(f.section().props['data-phase'],3);assert.equal(f.timers.size,0);assert.equal(control().props.children[1],c.replay);
  f.enter(false);f.enter(true);assert.equal(f.timers.size,0);control().props.onClick();f.render();assert.equal(f.section().props['data-phase'],0);assert.equal(f.timers.size,1);
  assert.deepEqual(f.h.nodes(n=>n.type==='a').map(n=>n.props.href),['/constat?lang='+lang,'#how']);assert.ok(f.h.nodes(n=>n.type==='div'&&n.props.className==='story-art'&&n.props['aria-hidden']==='true').length);
 }finally{f.close()}}
});
test('reduced-motion scene remains static without a timer, with the complete message and real start link',()=>{
 for(const lang of ['fr','en','de','nl']){const f=fixture(lang,true);try{f.enter(true);f.tick(80);assert.equal(f.timers.size,0);assert.equal(f.section().props['data-phase'],3);assert.equal(f.h.nodes(n=>n.type==='button').length,0);assert.equal(f.h.nodes(n=>n.type==='h2')[0].props.children,accidentStoryCopy[lang].question);assert.equal(f.h.nodes(n=>n.type==='strong').at(-1).props.children,accidentStoryCopy[lang].steps[3]);}finally{f.close()}}
});
test('automatic start requires a real 60 percent ratio; later playback pauses only when the illustration leaves view',()=>{const f=fixture('fr');try{for(const ratio of [0,.01,.59]){f.enter(ratio>0,ratio);assert.equal(f.section().props['data-running'],false);assert.equal(f.timers.size,0)}f.enter(true,.6);assert.equal(f.section().props['data-running'],true);f.enter(true,.59);assert.equal(f.section().props['data-running'],true);f.enter(false,0);assert.equal(f.section().props['data-running'],false);f.enter(true,.01);assert.equal(f.section().props['data-running'],true)}finally{f.close()}});
