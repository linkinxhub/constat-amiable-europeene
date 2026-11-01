import {quickFlowCopy} from '../features/constat/quick-flow-copy.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {fresh} from '../features/constat/model.ts';
import {dictionaries} from '../features/constat/i18n.ts';
import {repairCopy} from '../features/constat/repair-copy.ts';
import {mergeImportedPhotos} from '../features/constat/photo-import.ts';

// Exercise the actual component's async event handler. Only its browser decoder
// and rendering/hooks are controlled here; no replacement is shipped to the app.
function harness(importer,onChange){
 const slots=[],effects=[];let cursor=0;
 const hooks={
  useRef(value){const i=cursor++;return slots[i]??=( {current:value} );},
  useState(value){const i=cursor++;if(!(i in slots))slots[i]=value;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},
  useEffect(fn,deps){const i=cursor++,old=slots[i];if(!old||deps.some((v,j)=>v!==old.deps[j])){slots[i]={deps,cleanup:old?.cleanup};effects.push(()=>{slots[i].cleanup?.();slots[i].cleanup=fn();});}}
 };
 const jsx=(type,props,key)=>({type,props,key});
 const modules={'./quick-flow-copy':{quickFlowCopy},react:hooks,'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},'lucide-react':{Camera:'Camera',Undo2:'Undo2'},'@/components/ui/button':{Button:'Button'},'@/components/ui/input':{Input:'Input'},'./photo-import':{importPhoto:importer,mergeImportedPhotos},'./repair-copy':{repairCopy},'./i18n':{dictionaries}};
 const js=ts.transpileModule(readFileSync(new URL('../features/constat/evidence.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const evaluated={exports:{}};new Function('require','exports',js)(id=>{assert.ok(modules[id],id);return modules[id];},evaluated.exports);
 function find(node){if(!node||typeof node!=='object')return null;if(node.type==='Input')return node;for(const child of [node.props?.children].flat(Infinity)){const match=find(child);if(match)return match;}return null;}
 return {render(report,side='A'){cursor=0;const tree=evaluated.exports.Evidence({r:report,t:dictionaries.fr,side,change:onChange});while(effects.length)effects.shift()();return find(tree);},unmount(){for(const s of slots)s?.cleanup?.();}};
}
const photo={name:'TEST-FICTIF.png',data:'data:image/png;base64,TEST',width:10,height:10};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('A08: delayed import merges current edits but never crosses report or side, even after returning',async()=>{
 for(const scenario of ['edit','report','return','side','unmount']){
  let resolve;const pending=new Promise(r=>{resolve=r;}),changed=[];
  const h=harness(()=>pending,r=>changed.push(r)),a={...fresh(),id:'TEST_REPORT_A'},b={...a,id:'TEST_REPORT_B'};
  const input=h.render(a);input.props.onChange({target:{files:[{name:photo.name}],value:''}});
  if(scenario==='edit')h.render({...a,place:'new common edit',photos:[{...photo,name:'already present',side:'B'}]});
  if(scenario==='report'||scenario==='return')h.render(b);
  if(scenario==='return')h.render(a);
  if(scenario==='side')h.render(a,'B');
  if(scenario==='unmount')h.unmount();
  resolve(photo);await pending;await tick();
  if(scenario==='edit'){assert.equal(changed.length,1);assert.equal(changed[0].place,'new common edit');assert.equal(changed[0].photos.length,2);assert.equal(changed[0].photos[1].side,'A');}
  else assert.equal(changed.length,0,scenario+' must discard stale image');
 }
});
