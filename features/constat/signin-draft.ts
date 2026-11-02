// Check the same pointer used by Workspace restoration before leaving the page.
export async function prepareDraftSignIn(save:()=>Promise<boolean>,storage:Pick<Storage,'getItem'>,id:string){
 try{if(!await save())return false;const pointer=JSON.parse(storage.getItem('accordia-active-draft')||'null');return !!id&&pointer?.id===id}catch{return false}
}
