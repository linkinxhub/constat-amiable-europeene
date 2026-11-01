import {fresh,type Report} from './model.ts';

// Hiding a second vehicle in the editor must also exclude its personal details
// and attributed photos from the outgoing document, without touching the draft.
export function reportForDocument(report:Report):Report {
 if(report.count!=='1')return report;
 return {...report,vehicles:[report.vehicles[0],fresh().vehicles[1]],photos:report.photos.filter(photo=>photo.side!=='B')};
}
