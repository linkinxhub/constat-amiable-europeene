export const PHOTO_BYTES=1024*1024;
export const REPORT_BYTES=10*1024*1024;
export const MAX_PHOTO_PIXELS=4_000_000;
export const MAX_REPORT_PIXELS=8_000_000;
export function dataBytes(data:string){const raw=data.slice(data.indexOf(',')+1);return Math.floor(raw.length*3/4)-(raw.endsWith('==')?2:raw.endsWith('=')?1:0);}
