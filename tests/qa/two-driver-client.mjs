import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const [folder,actor,operation,mode='manual',inputFile]=process.argv.slice(2);
if(!folder||!['A','B'].includes(actor)||!operation)throw new Error('Usage: node two-driver-client.mjs RUN A|B OP manual|documents [input.json]');
const run=resolve(folder),file=Date.now()+'-'+actor+'-'+crypto.randomUUID()+'.json';
const input=inputFile?JSON.parse(await readFile(resolve(inputFile),'utf8')):{};
await mkdir(join(run,'requests'),{recursive:true});
await writeFile(join(run,file+'.tmp'),JSON.stringify({actor,operation,mode,input}),{mode:0o600});
await rename(join(run,file+'.tmp'),join(run,'requests',file));
const start=Date.now();
for(;;){
 try{const result=await readFile(join(run,'responses',file),'utf8');console.log(result);break;}
 catch(error){if(error.code!=='ENOENT')throw error;if(Date.now()-start>60000)throw new Error('test_broker_timeout');await new Promise(resolve=>setTimeout(resolve,100));}
}
