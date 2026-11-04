import type {Tutorial} from '../constat/tutorial';
let pending:Promise<typeof Tutorial>|undefined;
export function loadTutorial(){return pending??=import('../constat/tutorial').then(m=>m.Tutorial).catch(error=>{pending=undefined;throw error})}
