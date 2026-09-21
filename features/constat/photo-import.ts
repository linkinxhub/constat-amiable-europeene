import {PHOTO_BYTES,MAX_PHOTO_PIXELS,MAX_REPORT_PIXELS,REPORT_BYTES} from './photo-limits.ts';
import type {Report} from './model';
export async function importPhoto(file:File):Promise<Report['photos'][number]>{
 if(file.size>PHOTO_BYTES||!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('invalid_image');
 const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file)});
 const im=await new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=data});
 if(im.naturalWidth*im.naturalHeight>MAX_PHOTO_PIXELS)throw new Error('invalid_image');
 let preview:string|undefined;if(file.type==='image/webp'){
  const canvas=document.createElement('canvas');let width=Math.min(im.naturalWidth,1200);
  do{canvas.width=width;canvas.height=Math.max(1,Math.round(im.naturalHeight*width/im.naturalWidth));canvas.getContext('2d')!.drawImage(im,0,0,canvas.width,canvas.height);preview=canvas.toDataURL('image/png');width=Math.floor(width*.7);}while(preview.length>200000&&width>=100);
  if(preview.length>200000)throw new Error('invalid_image');
 }
 return {name:file.name.slice(0,255),data,...(preview?{preview}:{}),width:im.naturalWidth,height:im.naturalHeight};
}
export function assertPhotoBudget(report:Report){if(report.photos.length>6||new TextEncoder().encode(JSON.stringify({report,expectedRevision:1000000})).length>REPORT_BYTES||report.photos.reduce((n,p)=>n+(p.width||0)*(p.height||0),0)>MAX_REPORT_PIXELS)throw new Error('too_large');}
export function mergeImportedPhotos(current:Report,added:Report['photos']){const next={...current,photos:[...current.photos,...added]};assertPhotoBudget(next);return next;}
