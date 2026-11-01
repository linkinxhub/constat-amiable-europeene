import {drawPdfAccessQr} from './pdf-access-qr.ts';
import {rgb,type PDFDocument,type PDFFont} from 'pdf-lib';
import {referenceImage} from './reference-image.ts';
import type {PdfMaterial} from './pdf-renderer.ts';
import {fullPlace} from '../features/constat/geocoding.ts';
export async function referencePage(doc:PDFDocument,m:PdfMaterial,font:PDFFont){
 const W=595.28,H=841.89,sx=W/1085,sy=H/1536,page=doc.insertPage(0,[W,H]);if(!m.translation)doc.removePage(1);
 const image=await doc.embedJpg(Uint8Array.from(atob(referenceImage),c=>c.charCodeAt(0)));page.drawImage(image,{x:0,y:0,width:W,height:H});
 drawPdfAccessQr(doc,page,font,m.onlineSessionId,m.lang);
 const color=m.style==='blue-pen'?rgb(.05,.18,.65):rgb(.05,.05,.05);const overflow:string[]=[];
 function fill(value:string|undefined,x:number,y:number,width:number,height=19,label=''){
  if(!value)return;const text=value.replace(/\s+/g,' ').trim();let size=8;
  const wrap=(size:number)=>{const rows:string[]=[];let row='';for(const word of text.split(' ')){const candidate=row?row+' '+word:word;if(font.widthOfTextAtSize(candidate,size)<=width*sx){row=candidate;continue;}if(row){rows.push(row);row='';}for(const ch of word){if(font.widthOfTextAtSize(row+ch,size)>width*sx&&row){rows.push(row);row='';}row+=ch;}}if(row)rows.push(row);return rows;};
  while(size>5.5&&wrap(size).length*(size+1)>height*sy)size-=.25;
  const rows=wrap(size),max=Math.max(1,Math.floor(height*sy/(size+1)));
  if(rows.length>max)overflow.push(label||text.slice(0,40));
  rows.slice(0,max).forEach((row,i)=>page.drawText(i===max-1&&rows.length>max?row.slice(0,-2)+' *':row,{x:x*sx,y:H-y*sy-size-i*(size+1),size,font,color}));
 }
 const r=m.report;fill(r.date,60,86,145);fill(r.time,224,86,60);fill(r.country,330,94,75);fill(fullPlace(r),460,69,156,32,'Lieu');
 const check=(x:number,y:number)=>fill('X',x,y,15,22);
 if(r.injured)check(r.injured==='yes'?782:690,85);
 if(r.otherVehiclesDamage)check(r.otherVehiclesDamage==='yes'?174:77,160);
 if(r.otherObjectsDamage)check(r.otherObjectsDamage==='yes'?337:249,160);
 fill(r.witnesses,405,136,640,46,'Témoins');
 for(const i of [0,1] as const){const dx=i===0?0:665,v=r.vehicles[i],e=v.extra||{};
 fill(v.policyholder,84+dx,264,300,19,'Assuré');fill(e.policyholderFirstName,94+dx,287,290);fill(e.policyholderAddress,96+dx,310,288);fill(e.policyholderPostcode,122+dx,333,79);fill(e.policyholderCountry,240+dx,333,142);fill(e.policyholderPhone,124+dx,356,259);
 fill(v.model,45+dx,449,162);fill(v.plate,45+dx,490,162);fill(e.registrationCountry,45+dx,530,162);fill(e.trailerPlate,226+dx,490,158);fill(e.trailerCountry,226+dx,530,158);
 fill(v.insurer,82+dx,588,300);fill(v.policy,130+dx,610,254);fill(e.greenCard,142+dx,632,242);fill(e.insuranceFrom,174+dx,674,95);fill(e.insuranceUntil,302+dx,674,82);fill(e.agency,84+dx,717,300);fill(e.agencyAddress,106+dx,739,277,37);fill(e.agencyPhone,120+dx,781,264);
 if(/^(oui|yes|ja)$/i.test(e.comprehensive||''))check(310+dx,822);else if(/^(non|no|nee|nein)$/i.test(e.comprehensive||''))check(201+dx,822);else fill(e.comprehensive,75+dx,806,110);
 fill(v.driver,90+dx,889,294);fill(e.driverFirstName,100+dx,912,284);fill(e.driverBirthDate,157+dx,934,227);fill(v.address,101+dx,956,283);fill(e.driverPostcode,65+dx,978,135);fill(e.driverCountry,238+dx,978,146);fill([e.driverPhone,v.email].filter(Boolean).join(' / '),125+dx,1001,259);fill(e.licenceNumber,162+dx,1023,222);fill(e.licenceCategory,144+dx,1046,240);fill(e.licenceUntil,182+dx,1069,202);
 const x=i===0?43:875;fill(e.impact,x,1156,168,24,'Point de choc');fill(v.damage,x,1338,173,54,'Dégâts');fill(v.observations,i===0?44:744,1426,i===0?308:305,67,'Observations');
 const ys=[292,314,358,389,440,477,521,565,624,667,698,730,761,792,818,876,920];for(const k of v.standardCircumstances||[])check(i===0?412:669,ys[k]);fill(String(v.standardCircumstances?.length||0),i===0?412:669,973,15);
 const sig=m.signatures?.[i];if(sig){const im=await doc.embedPng(sig.data),scale=Math.min(140*sx/im.width,45*sy/im.height);page.drawImage(im,{x:(i===0?391:570)*sx,y:H-1490*sy,width:im.width*scale,height:im.height*scale});}
 }
 if(!m.sketch)for(const stroke of r.strokes)for(let i=1;i<stroke.length;i++){const a=stroke[i-1],b=stroke[i];page.drawLine({start:{x:(237+a.x*.77)*sx,y:H-(1110+a.y*.88)*sy},end:{x:(237+b.x*.77)*sx,y:H-(1110+b.y*.88)*sy},thickness:.8,color});}
 if(m.sketch){for(const road of m.sketch.roads)for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i];page.drawLine({start:{x:(237+a.x*.77)*sx,y:H-(1110+a.y*.70)*sy},end:{x:(237+b.x*.77)*sx,y:H-(1110+b.y*.70)*sy},thickness:7,color:rgb(.75,.75,.75)});}for(const v of m.sketch.vehicles){
 const angle=v.angle*Math.PI/180,point=(x:number,y:number)=>({x:(237+(v.x+x*Math.cos(angle)-y*Math.sin(angle))*.77)*sx,y:H-(1110+(v.y+x*Math.sin(angle)+y*Math.cos(angle))*.70)*sy});
 const corners=[[-24,-13],[24,-13],[24,13],[-24,13],[-24,-13]];for(let j=1;j<corners.length;j++)page.drawLine({start:point(...corners[j-1] as [number,number]),end:point(...corners[j] as [number,number]),color:v.side==='A'?rgb(.05,.4,.6):rgb(.6,.35,0),thickness:1.5});
 // A short line at the front communicates orientation without inferring a trajectory.
 page.drawLine({start:point(17,-11),end:point(17,11),color,thickness:1});fill(v.side,237+v.x*.77-5,1110+v.y*.70-8,16,20);
 }}
 fill(m.signatures?.every(Boolean)?'Accordia — signatures apposées':'Accordia — document non signé',400,1503,490,20);
 if(overflow.length)fill('* Suite intégrale en annexes : '+[...new Set(overflow)].join(', '),39,1519,995,16);
 return page;
}
