import type {Report} from './model.ts';

export const participationModes = ['same-device','two-devices','solo'] as const;
export type ParticipationMode = typeof participationModes[number];

// One person completing a report does not imply only one vehicle was involved.
export function selectParticipation(report:Report,mode:ParticipationMode):Report {
 return {...report,count:mode==='solo'?report.count:'2',start:{ownerSide:report.start?.ownerSide||'A',photoOwner:report.start?.photoOwner||'both',autoSketch:report.start?.autoSketch||false,participationMode:mode}};
}
