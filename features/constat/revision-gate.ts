// A poll started before a write must never undo that write, even at equal revision.
export function revisionGate(){
 let epoch=0,revision=0,writing=false;
 return {
  read:()=>epoch,
  accept(token:number,next:number){if(writing||token!==epoch||next<revision)return false;revision=next;return true},
  beginWrite(){writing=true;return ++epoch},
  commit(token:number,next:number){if(token!==epoch||next<revision)return false;revision=next;return true},
  endWrite(token:number){if(token===epoch)writing=false},
  reset(){epoch++;revision=0;writing=false},
 };
}
