import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {ESLint} from 'eslint';
import {componentHarness} from './lifecycle-harness.mjs';
import {ACCOUNT_STORAGE_MIB,ACCOUNT_STORAGE_BYTES} from '../features/constat/storage-limits.ts';
import {BUDGET} from '../server/report-service.ts';
import {accidentStoryCopy} from '../features/marketing/accident-story-copy.ts';
import {storyNarrationCopy} from '../features/marketing/story-narration-copy.ts';
import {frenchNarration} from '../features/marketing/recorded-narration.ts';
import {storyVideoCopy} from '../features/marketing/story-video-copy.ts';
import {storyVideo} from '../features/marketing/story-video-share.ts';
function loadTs(path){const out={};new Function('require','exports',ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(id=>loadTs(new URL(id+'.ts','file://'+process.cwd()+'/'+path).pathname),out);return out;}
test('normal ESLint ignores generated state while continuing to inspect application sources',async()=>{
 const lint=new ESLint();for(const path of ['.sites-runtime/cache/fixture.js','.wrangler/state/fixture.js','dist/server/index.js'])assert.equal(await lint.isPathIgnored(path),true,path);
 for(const path of ['server/report-service.ts','features/constat/cloud-panel.tsx','tests/reliability-lot-a.test.mjs'])assert.equal(await lint.isPathIgnored(path),false,path);
});
test('all four quota messages agree with the actual server byte budget',()=>{
 const {cloudCopy}=loadTs('features/constat/cloud-copy.ts');assert.equal(ACCOUNT_STORAGE_MIB,128);assert.equal(BUDGET,ACCOUNT_STORAGE_BYTES);assert.equal(BUDGET,128*1024*1024);
 for(const lang of ['fr','en','de','nl']){assert.match(cloudCopy[lang].quota,new RegExp('\\b'+BUDGET/(1024*1024)+' (Mio|MiB)\\b'));assert.ok(!cloudCopy[lang].quota.includes('1210'));}
});
test('actual story coordinates narration/video in both directions, including replay and stop',()=>{
 const old=Object.fromEntries(['window','document','Audio','SpeechSynthesisUtterance'].map(k=>[k,globalThis[k]]));
 globalThis.window={speechSynthesis:{}};globalThis.Audio=class{};globalThis.SpeechSynthesisUtterance=class{};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
 try{for(const lang of ['fr','en','de','nl']){
  let started=0,stopped=0,videoPauses=0;
  const factory=()=>({start(){started++},stop(){stopped++},pause(){},resume(){}});
  const h=componentHarness('features/marketing/accident-story.tsx','AccidentStory',{
   './recorded-narration':{frenchNarration,createRecordedNarration:factory},'./story-narration':{createNarration:factory,browserNarration:()=>({})},'./story-video-actions':{StoryVideoShare:'Video'},'../constat/browser-ready':{useBrowserReady:()=>true},'./story-narration-copy':{storyNarrationCopy},'./motion-preference':{useReducedMotion:()=>true},'./accident-story-copy':{accidentStoryCopy},'lucide-react':Object.fromEntries(['Pause','Play','RotateCcw','ArrowUpRight','ShieldCheck','Volume2','VolumeX'].map(k=>[k,k]))});
  const p={lang};h.render(p);const media=()=>h.nodes(n=>n.type==='Video')[0];media().props.videoRef.current={pause(){videoPauses++}};
  const narration=()=>h.nodes(n=>n.type==='button'&&n.props['aria-pressed']!==undefined)[0];
  narration().props.onClick();h.render(p);assert.equal(started,1);assert.equal(videoPauses,1);assert.equal(narration().props['aria-pressed'],true);
  const beforeStop=stopped;media().props.onPlaybackStart();h.render(p);assert.equal(stopped,beforeStop+1);assert.equal(narration().props['aria-pressed'],false);
  narration().props.onClick();h.render(p);assert.equal(started,2);assert.equal(videoPauses,2);
  narration().props.onClick();h.render(p);assert.equal(narration().props['aria-pressed'],false);h.unmount();assert.ok(stopped>=4);
 }}finally{for(const [k,v] of Object.entries(old))if(v===undefined)delete globalThis[k];else globalThis[k]=v}
});
test('video reserves the real 16:9 frame, uses a real poster and ignores a stale paused play event',()=>{
 let starts=0,pauses=0;const ref={current:{pause(){pauses++}}};
 const h=componentHarness('features/marketing/story-video-actions.tsx','StoryVideoShare',{'./story-video-copy':{storyVideoCopy},'./story-video-share':{storyVideo}});
 try{for(const lang of ['fr','en','de','nl']){h.render({lang,videoRef:ref,onPlaybackStart:()=>starts++});const video=h.nodes(n=>n.type==='video')[0];assert.equal(video.props.width,1280);assert.equal(video.props.height,720);assert.equal(video.props.style.aspectRatio,'16 / 9');assert.ok(readFileSync('public'+video.props.poster).length>1000);assert.equal(video.props.preload,'none');assert.ok(!video.props.autoPlay);video.props.onPlay({currentTarget:{paused:true}});assert.equal(starts,['fr','en','de','nl'].indexOf(lang));video.props.onPlay({currentTarget:{paused:false}});assert.ok(h.nodes(n=>n.type==='p'&&n.props.children===storyVideoCopy[lang].audioHint).length);}}
 finally{h.unmount();assert.equal(pauses,1)}
});
