import {visibleVehicleExtras} from './vehicle-kind.ts';
import type {Report,Vehicle} from './model.ts';
import {questionGroups,questionnaireIssues,type QuestionPage} from './questionnaire-model.ts';
import {detailGroups} from './detail-groups.ts';
// Navigation-only snapshot of the vehicle explicitly checked and applied by the user.
// Never an entitlement, completion stamp or permission to sign.
export type ReviewedEntry={reportId:string;side:0|1;vehicle:Vehicle};
export function reviewedField(report:Report,reviewed:ReviewedEntry|undefined,side:number,key:string,extra=false){
 if(!reviewed||reviewed.reportId!==report.id||reviewed.side!==side)return false;
 if(['damage','observations','impact'].includes(key))return false;
 const current=extra?report.vehicles[side]?.extra:report.vehicles[side],snapshot=extra?reviewed.vehicle.extra:reviewed.vehicle;
 const value=(current as Record<string,unknown>|undefined)?.[key],before=(snapshot as Record<string,unknown>|undefined)?.[key];
 // Invalid optional email must remain visible even if the user applied other fields.
 if(key==='email'&&questionnaireIssues(report,{id:'email',kind:'base',side:side as 0|1,group:0}).includes('email'))return false;
 return typeof value==='string'&&value.trim().length>0&&value===before;
}
export function remainingDocumentPages(pages:QuestionPage[],report:Report,reviewed?:ReviewedEntry){
 return pages.filter(page=>{
  if(page.kind==='base'&&page.group!<4)return !questionGroups[page.group!].every(k=>reviewedField(report,reviewed,page.side!,k));
  if(page.kind==='extra'){const fields=visibleVehicleExtras(report.vehicles[page.side!],detailGroups[page.group!].slice(page.offset,page.offset!+3));return fields.length>0&&!fields.every(k=>reviewedField(report,reviewed,page.side!,k,true));}
  return true;
 });
}
