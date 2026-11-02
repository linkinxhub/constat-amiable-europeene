import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const tests=readdirSync(new URL('../tests/',import.meta.url)).filter(name=>name.endsWith('.test.mjs')).sort().map(name=>'tests/'+name);
const steps=[
 ['TypeScript',['node_modules/typescript/bin/tsc','--noEmit']],
 ['ESLint',['node_modules/eslint/bin/eslint.js','.','--ignore-pattern','dist','--ignore-pattern','.next']],
 ['Build',['scripts/run-framework.mjs','build']],
 ['Tests after build',['--experimental-strip-types','--test',...tests]],
];
for(const [label,args] of steps){
 process.stdout.write('\n'+label+'\n');
 const result=spawnSync(process.execPath,args,{cwd:root,env:process.env,stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status??1);
}
process.stdout.write('\nPlatform checks passed. Review ESLint warnings and the separate dependency audit before release.\n');
