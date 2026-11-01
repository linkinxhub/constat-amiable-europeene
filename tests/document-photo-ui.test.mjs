import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {z} from 'zod';
import {fresh} from '../features/constat/model.ts';
import {dictionaries} from '../features/constat/i18n.ts';
import {extraLabels} from '../features/constat/final-copy.ts';
import {documentCopy} from '../features/constat/document-copy.ts';
import {documentPhotoCopy} from '../features/constat/document-photo-copy.ts';
import * as batch from '../features/constat/document-batch.ts';
import * as model from '../features/constat/document-model.ts';
import {validDocumentSource} from '../features/constat/document-photo.ts';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const p=documentPhotoCopy.fr,c=documentCopy.fr;
const file=name=>({name,type:'image/jpeg',size:100});
const result=(field,value)=>({fields:[{field,value,confidence:'high'}]});
function harness(onChange,prepare=async()=> 'data:image/jpeg;base64,TEST'){
 const slots=[],effects=[];let cursor=0;
 const hooks={useRef(value){const i=cursor++;return slots[i]??={current:value}},useState(value){const i=cursor++;if(!(i in slots))slots[i]=value;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v}]},useEffect(fn,deps){const i=cursor++,old=slots[i];if(!old||deps.some((v,j)=>v!==old.deps[j])){slots[i]={deps};effects.push(()=>{old?.cleanup?.();slots[i].cleanup=fn()})}}};
 hooks.useLayoutEffect=hooks.useEffect;
 const jsx=(type,props,key)=>({type,props,key});
 const modules={react:hooks,zod:{z},'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},'@/components/ui/button':{Button:'Button'},'./document-coverage':{DocumentCoverage:'Coverage',coverageCopy:{fr:{}}},'./document-copy':{documentCopy},'./document-photo-copy':{documentPhotoCopy},'./document-batch':batch,'./document-photo':{prepareDocument:prepare,validDocumentSource},'./document-model':model,'./i18n':{dictionaries},'./final-copy':{extraLabels}};
 const js=ts.transpileModule(readFileSync('features/constat/document-import.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const evaluated={exports:{}};new Function('require','exports',js)(id=>{assert.ok(modules[id],id);return modules[id]},evaluated.exports);
 let tree;function all(node,predicate,out=[]){if(!node||typeof node!=='object')return out;if(predicate(node))out.push(node);for(const child of [node.props?.children].flat(Infinity))all(child,predicate,out);return out}
 return {render(v){cursor=0;tree=evaluated.exports.DocumentImport({value:v,onChange,lang:'fr',side:'A'});while(effects.length)effects.shift()();return tree},nodes(predicate){return all(tree,predicate)},fileInput(){return all(tree,n=>n.type==='input'&&n.props.multiple)[0]},button(text){return all(tree,n=>n.type==='Button'&&[n.props.children].flat().join('')===text)[0]},checkbox(index){return all(tree,n=>n.type==='input'&&n.props.type==='checkbox')[index]},unmount(){for(const slot of slots)slot?.cleanup?.()}};
}
async function setup(response,prepare){
 const original=globalThis.fetch,requests=[],changes=[];
 globalThis.fetch=async(url,options={})=>{if(!options.method)return Response.json({available:true,mode:'admin_preview'});const payload=JSON.parse(options.body);requests.push(payload);return response(payload,requests.length)};
 const h=harness(v=>changes.push(v),prepare),v=fresh().vehicles[0];h.render(v);await tick();h.render(v);
 return {h,v,requests,changes,restore(){h.unmount();globalThis.fetch=original}};
}
function add(h,v,n){h.fileInput().props.onChange({target:{files:Array.from({length:n},(_,i)=>file('TEST-'+i+'.jpg')),value:'x'}});h.render(v)}
function start(h,v){h.checkbox(0).props.onChange({target:{checked:true}});h.render(v);h.button(p.analyze).props.onClick()}
test('actual import handler reads sequentially, stops on failure and resumes without repeating successes',async()=>{
 let fail=true;const s=await setup((_,n)=>n===2&&fail?Response.json({error:'document_quota'},{status:429}):Response.json(result(n===1?'plate':'model','TEST-'+n)));
 try{add(s.h,s.v,3);assert.equal(s.requests.length,0);start(s.h,s.v);await tick();s.h.render(s.v);assert.equal(s.requests.length,2);assert.ok(s.h.nodes(n=>n.type==='h4'&&Array.isArray(n.props.children)&&n.props.children.includes(p.review)).length);
  fail=false;start(s.h,s.v);await tick();s.h.render(s.v);assert.equal(s.requests.length,4);assert.equal(s.requests.every(r=>r.side==='A'&&r.consent===true),true);assert.equal(s.changes.length,0);
 }finally{s.restore()}
});
test('actual import handler rejects an excessive batch atomically and preserves existing queue',async()=>{
 const s=await setup(()=>Response.json(result('plate','TEST')));
 try{add(s.h,s.v,1);add(s.h,s.v,5);assert.equal(s.h.nodes(n=>n.type==='li').length,1);assert.equal(s.requests.length,0);assert.ok(s.h.nodes(n=>n.props?.role==='status'&&n.props.children===p.invalid).length)}finally{s.restore()}
});
test('actual apply handler refuses concurrent changes and keeps the source vehicle intact',async()=>{
 const s=await setup(()=>Response.json(result('plate','TEST-PLATE')));
 try{add(s.h,s.v,1);start(s.h,s.v);await tick();s.h.render({...s.v,plate:'MANUAL-CORRECTION'});
  s.h.checkbox(0).props.onChange({target:{checked:true}});s.h.render({...s.v,plate:'MANUAL-CORRECTION'});
  const apply=s.h.nodes(n=>n.type==='Button'&&Array.isArray(n.props.children)&&n.props.children[0]===c.apply)[0];assert.equal(apply.props.disabled,false);apply.props.onClick();s.h.render(s.v);
  assert.equal(s.changes.length,0);assert.equal(s.v.plate,'');assert.ok(s.h.nodes(n=>n.props?.role==='status'&&n.props.children===c.conflict).length);
 }finally{s.restore()}
});
test('actual apply handler inserts reviewed values only, preserves damage and clears sensitive queue',async()=>{
 const s=await setup(()=>Response.json(result('plate','TEST-PLATE')));
 try{s.v.damage='DECLARED DAMAGE';add(s.h,s.v,1);start(s.h,s.v);await tick();s.h.render(s.v);s.h.checkbox(0).props.onChange({target:{checked:true}});s.h.render(s.v);
  s.h.nodes(n=>n.type==='Button'&&Array.isArray(n.props.children)&&n.props.children[0]===c.apply)[0].props.onClick();s.h.render(s.v);
  assert.equal(s.changes[0].plate,'TEST-PLATE');assert.equal(s.changes[0].damage,'DECLARED DAMAGE');assert.equal(s.v.plate,'');assert.equal(s.h.nodes(n=>n.type==='li').length,0);
 }finally{s.restore()}
});
test('closing during a provider response discards late results and prevents sending remaining pieces',async()=>{
 let resolve;const pending=new Promise(r=>resolve=r),s=await setup(()=>pending);
 try{add(s.h,s.v,2);start(s.h,s.v);await tick();assert.equal(s.requests.length,1);s.h.unmount();resolve(Response.json(result('plate','LATE')));await tick();assert.equal(s.requests.length,1);assert.equal(s.changes.length,0)}finally{s.restore()}
});
test('cancelling before preprocessing completes prevents any provider request',async()=>{
 let resolve;const pending=new Promise(r=>resolve=r),s=await setup(()=>Response.json(result('plate','UNUSED')),()=>pending);
 try{add(s.h,s.v,2);start(s.h,s.v);s.h.render(s.v);s.h.button(c.cancel).props.onClick();resolve('data:image/jpeg;base64,TEST');await tick();s.h.render(s.v);assert.equal(s.requests.length,0);assert.equal(s.changes.length,0);assert.equal(s.h.button(p.analyze).props.disabled,true)}finally{s.restore()}
});
test('applying a partial batch retains unread pieces for a later explicit retry',async()=>{
 const s=await setup((_,n)=>n===1?Response.json(result('plate','TEST-PLATE')):Response.json({error:'document_quota'},{status:429}));
 try{add(s.h,s.v,3);start(s.h,s.v);await tick();s.h.render(s.v);assert.equal(s.requests.length,2);
  s.h.checkbox(1).props.onChange({target:{checked:true}});s.h.render(s.v);
  s.h.nodes(n=>n.type==='Button'&&Array.isArray(n.props.children)&&n.props.children[0]===c.apply)[0].props.onClick();s.h.render(s.changes[0]);
  assert.equal(s.changes[0].plate,'TEST-PLATE');assert.equal(s.h.nodes(n=>n.type==='li').length,2);assert.equal(s.requests.length,2);
 }finally{s.restore()}
});
test('contradictory documents require an explicit value choice before the review can apply',async()=>{
 const s=await setup((_,n)=>Response.json(result('plate','TEST-'+n)));
 try{add(s.h,s.v,2);start(s.h,s.v);await tick();s.h.render(s.v);
  let apply=s.h.nodes(n=>n.type==='Button'&&Array.isArray(n.props.children)&&n.props.children[0]===c.apply)[0];assert.equal(apply.props.disabled,true);
  const select=s.h.nodes(n=>n.type==='select'&&n.props.value==='')[0];assert.ok(select);select.props.onChange({target:{value:'1'}});s.h.render(s.v);
  s.h.checkbox(0).props.onChange({target:{checked:true}});s.h.render(s.v);
  apply=s.h.nodes(n=>n.type==='Button'&&Array.isArray(n.props.children)&&n.props.children[0]===c.apply)[0];assert.equal(apply.props.disabled,false);apply.props.onClick();assert.equal(s.changes[0].plate,'TEST-2');
 }finally{s.restore()}
});
test('a preprocessing failure sends nothing and preserves all selected files',async()=>{
 const s=await setup(()=>Response.json(result('plate','UNUSED')),async()=>{throw new Error('document_invalid')});
 try{add(s.h,s.v,2);start(s.h,s.v);await tick();s.h.render(s.v);assert.equal(s.requests.length,0);assert.equal(s.h.nodes(n=>n.type==='li').length,2);assert.ok(s.h.nodes(n=>n.props?.role==='status'&&n.props.children===p.invalid).length)}finally{s.restore()}
});
