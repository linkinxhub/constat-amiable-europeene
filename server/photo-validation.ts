import {PDFDocument} from 'pdf-lib';
import jpeg from 'jpeg-js';
import type {Report} from '../features/constat/model.ts';
import {MAX_PHOTO_PIXELS,MAX_REPORT_PIXELS} from '../features/constat/photo-limits.ts';

const bad=()=>{throw new Error('invalid_image')};
const ascii=(b:Uint8Array,start:number,n:number)=>String.fromCharCode(...b.slice(start,start+n));
export function photoHeader(data:string){
 const match=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(data);if(!match) return bad();
 const raw=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0)),v=new DataView(raw.buffer);let width=0,height=0;
 if(match[1]==='png'){
  if(raw.length<45||ascii(raw,1,3)!=='PNG'||raw[0]!==137||v.getUint32(12)!==0x49484452||v.getUint32(8)!==13)return bad();width=v.getUint32(16);height=v.getUint32(20);
 }else if(match[1]==='jpeg'){
  if(raw.length<4||v.getUint16(0)!==0xffd8||v.getUint16(raw.length-2)!==0xffd9)return bad();
  for(let i=2;i+4<raw.length;){if(raw[i++]!==255)return bad();while(raw[i]===255)i++;const marker=raw[i++];if(marker===0xda)break;const length=v.getUint16(i);if(length<2||i+length>raw.length)return bad();if([0xc0,0xc1,0xc2].includes(marker)){height=v.getUint16(i+3);width=v.getUint16(i+5);break;}i+=length;}
 }else{
  if(raw.length<30||ascii(raw,0,4)!=='RIFF'||ascii(raw,8,4)!=='WEBP'||v.getUint32(4,true)+8!==raw.length)return bad();
  let found=false;for(let i=12;i+8<=raw.length;){const tag=ascii(raw,i,4),size=v.getUint32(i+4,true),p=i+8;if(p+size>raw.length)return bad();
   if(tag==='ANIM'||tag==='ANMF')return bad();
   if(tag==='VP8X'&&size>=10){width=1+raw[p+4]+(raw[p+5]<<8)+(raw[p+6]<<16);height=1+raw[p+7]+(raw[p+8]<<8)+(raw[p+9]<<16);}
   if(tag==='VP8 '&&size>=10){if(ascii(raw,p+3,3)!=='\x9d\x01\x2a')return bad();width=v.getUint16(p+6,true)&0x3fff;height=v.getUint16(p+8,true)&0x3fff;found=true;}
   if(tag==='VP8L'&&size>=5){if(raw[p]!==47)return bad();const bits=v.getUint32(p+1,true);width=(bits&0x3fff)+1;height=((bits>>>14)&0x3fff)+1;found=true;}
   i=p+size+(size%2);
  }if(!found)return bad();
 }
 if(width<1||height<1||width*height>MAX_PHOTO_PIXELS)return bad();return {raw,format:match[1],width,height};
}
async function validatePng(raw:Uint8Array,width:number,height:number){
 const view=new DataView(raw.buffer);const chunks:Uint8Array[]=[];let end=false;
 for(let i=8;i+12<=raw.length;){const n=view.getUint32(i),tag=ascii(raw,i+4,4);if(i+n+12>raw.length)return bad();if(['acTL','fcTL','fdAT'].includes(tag))return bad();if(tag==='IDAT')chunks.push(raw.slice(i+8,i+8+n));if(tag==='IEND'){end=n===0&&i+12===raw.length;break;}i+=n+12;}
 if(!end||!chunks.length)return bad();
 // Bound decompressed IDAT before handing the image to the PDF decoder.
 const stream=new ReadableStream<BufferSource>({start(c){for(const x of chunks)c.enqueue(new Uint8Array(x).buffer);c.close();}}).pipeThrough(new DecompressionStream('deflate'));
 const reader=stream.getReader();let size=0;try{while(true){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>(width*8+16)*(height+16)){await reader.cancel();return bad();}}}finally{reader.releaseLock();}
 const doc=await PDFDocument.create();await doc.embedPng(raw);
}
export async function validatePhotos(photos:Report['photos']){
 let total=0;for(const photo of photos){const info=photoHeader(photo.data);total+=info.width*info.height;if(total>MAX_REPORT_PIXELS)return bad();
 if(info.format==='png')await validatePng(info.raw,info.width,info.height);
 else if(info.format==='jpeg')jpeg.decode(info.raw,{useTArray:true,tolerantDecoding:false,maxResolutionInMP:4,maxMemoryUsageInMB:64});
 // WebP stays an original attachment. A client PNG preview is never trusted as evidence.
 if(photo.preview){const p=photoHeader(photo.preview);if(p.format!=='png')return bad();await validatePng(p.raw,p.width,p.height);}
 }
}

export async function validateSignature(data:string){const p=photoHeader(data);if(p.format!=='png'||p.width<20||p.height<10||p.width>1600||p.height>800)return bad();await validatePng(p.raw,p.width,p.height);}
