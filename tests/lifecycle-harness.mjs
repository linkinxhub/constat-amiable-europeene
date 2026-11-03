import {readFileSync} from 'node:fs';
import ts from 'typescript';
import assert from 'node:assert/strict';
// Evaluate the real component, with deterministic hooks and only its external
// UI/storage/provider dependencies controlled. Guarded rerenders happen before
// layout/passive effects, matching the ordering relevant to these regressions.
export function componentHarness(path,exportName,dependencies={}){
 const slots=[],pendingLayout=new Map(),pendingEffects=new Map();let cursor=0,rendering=false,again=false,tree;
 const state=value=>{const i=cursor++;if(!(i in slots))slots[i]=typeof value==='function'?value():value;return [slots[i],next=>{const value=typeof next==='function'?next(slots[i]):next;if(!Object.is(value,slots[i])){slots[i]=value;if(rendering)again=true}}]};
 function effect(queue,fn,deps){const i=cursor++,old=slots[i];if(!old||!deps||deps.some((v,j)=>!Object.is(v,old.deps?.[j]))){slots[i]={...old,deps};queue.set(i,()=>{old?.cleanup?.();slots[i].cleanup=fn()})}}
 const hooks={useId(){return "test-id-"+cursor++},useState:state,useRef(value){const i=cursor++;return slots[i]??={current:value}},useEffect(fn,deps){effect(pendingEffects,fn,deps)},useLayoutEffect(fn,deps){effect(pendingLayout,fn,deps)},useMemo(fn,deps){const i=cursor++,old=slots[i];if(!old||deps.some((v,j)=>!Object.is(v,old.deps[j])))slots[i]={deps,value:fn()};return slots[i].value},useSyncExternalStore(){cursor++;return true}};
 const jsx=(type,props,key)=>({type,props,key}),modules={react:hooks,'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},'@/components/ui/button':{Button:'Button'},...dependencies};
 const js=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const evaluated={exports:{}};new Function('require','exports',js)(id=>{assert.ok(modules[id],'Missing test dependency '+id);return modules[id]},evaluated.exports);
 const walk=(node,predicate,out=[])=>{if(!node||typeof node!=='object')return out;if(predicate(node))out.push(node);for(const child of [node.props?.children].flat(Infinity))walk(child,predicate,out);return out};
 return {render(props){let count=0;do{assert.ok(count++<25,'Unexpected render loop');again=false;rendering=true;cursor=0;tree=evaluated.exports[exportName](props);rendering=false}while(again);for(const queue of [pendingLayout,pendingEffects]){const effects=[...queue.values()];queue.clear();effects.forEach(fn=>fn())}return tree},nodes(fn){return walk(tree,fn)},unmount(){for(const slot of slots)slot?.cleanup?.()}};
}
