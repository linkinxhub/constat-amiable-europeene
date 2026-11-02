// Compiled Worker in Miniflare, no identity headers or external services.
import {readdirSync} from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {resolve} from 'node:path';
import {presentationCopy} from '../features/product/presentation-copy.ts';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));const {Miniflare}=wr('miniflare');
const mf=new Miniflare({modules:[{type:'ESModule',path:resolve('dist/server/index.js')},...readdirSync('dist/server',{recursive:true}).filter(p=>p.endsWith('.js')&&p!=='index.js').map(p=>({type:'ESModule',path:resolve('dist/server',p)}))],modulesRoot:resolve('dist/server'),modulesRules:[{type:'ESModule',include:['**/*.js','**/*.mjs'],fallthrough:true}],compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],cf:false});
try{
for(const lang of ['fr','en','de','nl']){
 const response=await mf.dispatchFetch('http://localhost/pricing?lang='+lang);
 assert.equal(response.status,200);const html=await response.text();
 assert.ok(html.includes(({fr:'Quelles pièces utiliser',en:'Which documents can I use',de:'Welche Dokumente kann ich verwenden',nl:'Welke documenten kan ik gebruiken'})[lang]));
 assert.ok(html.includes(({fr:'remorque',en:'Trailer',de:'Anhängers',nl:'aanhangwagen'})[lang]));
 assert.equal((html.match(/data-plan-index="\d"/g)||[]).length,6,lang+' six preserved plans');
 assert.ok(html.indexOf('id="personal-plans"')<html.indexOf('id="fleet-plans"'));
 assert.ok(html.indexOf('id="fleet-plans"')<html.indexOf('id="included-services"'));
 assert.ok(html.includes('/constat?lang='+lang));assert.ok(html.includes('/account?lang='+lang+'#offers'));
 assert.ok(html.includes(presentationCopy[lang].available));
 for(const page of ['/account','/join','/']){
  const other=await mf.dispatchFetch('http://localhost'+page+'?lang='+lang);assert.equal(other.status,200);
  const text=await other.text();assert.ok(text.includes('lang="'+lang+'"'),page+' language');
  assert.ok(text.includes('/pricing?lang='+lang),page+' pricing link');
  if(page==='/account'||page==='/')assert.equal((text.match(/data-plan-index="\d"/g)||[]).length,3,page+' consistent individual plans');
 }
}
for(const path of ['/','/constat','/account','/join']){
 const response=await mf.dispatchFetch('http://localhost'+path);assert.equal(response.status,200,path);assert.ok((await response.text()).includes('Accordia'));
}
console.log('Public pages render successfully; document coverage appears in all four pricing languages');
}finally{await mf.dispose()}
