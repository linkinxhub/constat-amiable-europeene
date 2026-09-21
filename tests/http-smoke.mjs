// Starts the built Worker locally; no authenticated identity is injected.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const worker=spawn(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','dev','--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/state','--ip','127.0.0.1','--port','8787','--inspector-port','0'],{stdio:['ignore','pipe','pipe']});
try{
await new Promise((resolve,reject)=>{let output='';const timeout=setTimeout(()=>{reject(new Error('Built Worker did not become ready'));},30000);worker.on('exit',code=>{clearTimeout(timeout);reject(new Error('Worker exited '+code));});worker.stdout.on('data',chunk=>{output+=chunk.toString();if(output.includes('Ready on http://127.0.0.1:8787')){clearTimeout(timeout);resolve();}});worker.stderr.on('data',()=>{});});
const origin='http://127.0.0.1:8787';
for(const [path,method] of [['/api/reports','GET'],['/api/reports/test_report_12345678','GET'],['/api/reports/test_report_12345678','PUT'],['/api/account','GET']]){
 const response=await fetch(origin+path,{method,signal:AbortSignal.timeout(5000),headers:method==='PUT'?{'Content-Type':'application/json','Origin':origin,'X-Accordia-Request':'1'}:undefined,body:method==='PUT'?'{}':undefined});
 assert.equal(response.status,401,path+' '+method);assert.equal((await response.json()).error,'unauthenticated');assert.match(response.headers.get('cache-control'),/no-store/);console.log(method+' '+path+' rejects unauthenticated access');
}

} finally {worker.kill('SIGTERM');}
