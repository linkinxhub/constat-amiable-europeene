import {pdfTextLines} from './pdf-text.ts';
import {policyCopy} from '../features/constat/policy-copy.ts';
import {translatedReport,type Translation} from '../features/constat/translation-model.ts';
import {translationCopy} from '../features/constat/translation-copy.ts';
import {sketchCopy} from '../features/constat/sketch-copy.ts';
import {referencePage} from './reference-page.ts';
import {fullPlace} from '../features/constat/geocoding.ts';
import {repairCopy} from '../features/constat/repair-copy.ts';
import {eventZone} from '../features/constat/event-time.ts';
import {PDFDocument,StandardFonts,rgb,degrees,type PDFPage,type PDFFont} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {regular,hand} from './pdf-fonts.ts';
import type {Report} from '../features/constat/model.ts';
import type {Sketch} from '../features/constat/sketch-model.ts';
import {standardCircumstances,extraFields,type FinalStyle} from '../features/constat/final-model.ts';
import {finalCopy,extraLabels} from '../features/constat/final-copy.ts';
import {dictionaries,type Lang} from '../features/constat/i18n.ts';
export const PDF_RENDERER_VERSION='accordia-multilingual-v2';
export type Signature={data:string,kind:'drawn'|'imported',at:string,by:string};
export type PdfMaterial={unilateral?:{side:"A"|"B",reason:string},translation?:Translation,report:Report,revision:number,style:FinalStyle,lang:Lang,digest:string,createdAt:string,sketch:Sketch|null,signatures?:[Signature|null,Signature|null]};
const bytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export async function renderPdf(m:PdfMaterial){
 if(m.unilateral&&m.signatures?.some(Boolean))throw new Error('unilateral_cannot_use_signatures');
 const doc=await PDFDocument.create();doc.registerFontkit(fontkit);const font=await doc.embedFont(bytes(regular),{subset:true}),bold=await doc.embedFont(StandardFonts.HelveticaBold),writing=m.style==='keyboard'?font:await doc.embedFont(bytes(hand),{subset:true});
 const ink=m.style==='blue-pen'?rgb(.08,.22,.65):rgb(.08,.10,.14),line=rgb(.54,.59,.65),navy=rgb(.08,.16,.26),cyan=rgb(.03,.62,.76),gold=rgb(.91,.70,.17),t=dictionaries[m.lang],c=finalCopy[m.lang];
 doc.setKeywords(['accordia-reference-v1',PDF_RENDERER_VERSION]);doc.setTitle('Accordia - '+c.document);doc.setAuthor('Accordia');doc.setSubject(c.disclaimer);doc.setCreationDate(new Date(m.createdAt));doc.setModificationDate(new Date(m.createdAt));
 const W=595.28,H=841.89;let page=doc.addPage([W,H]);
 function chosen(text:string,f:PDFFont){const available=new Set(f.getCharacterSet());return [...text].every(ch=>available.has(ch.codePointAt(0)!))?f:font;}
 function clean(s:string){return s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/\t/g,' ');}
 function tx(s:string,x:number,top:number,size=8,f=font,color=navy,p=page){s=clean(s);p.drawText(s,{x,y:H-top-size,size,font:chosen(s,f),color});}
 function rect(x:number,top:number,w:number,h:number,fill=rgb(1,1,1),p=page){p.drawRectangle({x,y:H-top-h,width:w,height:h,color:fill,borderColor:line,borderWidth:.55});}
 function lines(s:string,max:number,size:number,f:PDFFont){return pdfTextLines(s,max,text=>chosen(text,f).widthOfTextAtSize(text,size));}
 function wrapped(s:string,x:number,top:number,width:number,size=8,f=font,maxLines=99,color=navy,p=page){const ls=lines(s,width,size,f);ls.slice(0,maxLines).forEach((l,i)=>tx(i===maxLines-1&&ls.length>maxLines?l.slice(0,-2)+' *':l,x,top+i*(size+2),size,f,color,p));return ls.length*(size+2);}
 function title(s:string,x:number,top:number,w:number,fill=rgb(.93,.95,.97)){rect(x,top,w,17,fill);wrapped(s,x+5,top+3,w-10,7.5,bold,1);}
 function box(s:string,x:number,top:number,w:number,h:number,fill=rgb(1,1,1)){rect(x,top,w,h,fill);title(s,x,top,w,fill);}
 function value(label:string,v:string|undefined,x:number,top:number,w:number,size=8.2){tx(label,x,top,6.1);wrapped(v||c.missing,x,top+8,w,size,writing,1,ink);}
 const complete=!!m.signatures?.every(Boolean);
 tx('ACCORDIA',24,20,13,bold);tx(c.document.toUpperCase(),24,39,14,bold);tx(m.translation?translationCopy[m.lang].pdfNotice:complete?c.ready:c.unsigned,24,59,7.2);tx(c.reference+': '+m.report.id.slice(0,34)+' · v'+m.revision,24,72,7);
 box('1. '+t.date+' / '+t.time,24,90,180,43);value('',m.report.date+'  '+m.report.time,30,107,168);
 box('2. '+t.place,204,90,247,43);wrapped(fullPlace(m.report)+' · '+m.report.country,210,109,235,8.5,writing,2,ink);
 box('3. '+t.injured,451,90,120,43);tx(m.report.injured==='yes'?t.yes:m.report.injured==='no'?t.no:c.missing,458,111,9,writing,ink);
 rect(24,133,547,33);wrapped('4. '+c.thirdVehicles+' '+(m.report.otherVehiclesDamage==='yes'?t.yes:m.report.otherVehiclesDamage==='no'?t.no:c.missing)+'  /  '+c.thirdObjects+' '+(m.report.otherObjectsDamage==='yes'?t.yes:m.report.otherObjectsDamage==='no'?t.no:c.missing),29,135,537,6,font,2);wrapped('5. '+t.witnesses+': '+(m.report.witnesses||c.missing),29,155,537,6,font,1);
 let r=m.translation?translatedReport(m.report,m.translation):m.report;
 function vehicle(i:0|1){const x=i===0?24:394,w=177,v=r.vehicles[i],e=v.extra||{},fill=i===0?rgb(.92,.98,1):rgb(1,.98,.90);title(t.vehicle.toUpperCase()+' '+(i===0?'A':'B'),x,166,w,i===0?cyan:gold);
 function row(label:string,v:string|undefined,y:number){const prefix=label+': ';const size=5.5;const labelWidth=Math.min(78,chosen(prefix,font).widthOfTextAtSize(prefix,size));wrapped(prefix,x+4,y,labelWidth,size,font,1);wrapped(v||c.missing,x+7+labelWidth,y-1,w-labelWidth-12,7.2,writing,1,ink);}
 const join=(...parts:(string|undefined)[])=>parts.filter(Boolean).join(' · '),l=extraLabels[m.lang];
 box('6. '+t.policyholder,x,183,w,69,fill);
 [[t.policyholder,v.policyholder],[l.policyholderFirstName,e.policyholderFirstName],[t.address,e.policyholderAddress],[l.policyholderPostcode,join(e.policyholderPostcode,e.policyholderCountry)],[l.policyholderPhone,e.policyholderPhone]].forEach(([k,v],j)=>row(k||'',v,204+j*9));
 box('7. '+t.vehicle,x,252,w,62,fill);
 [[t.model,v.model],[t.plate,join(v.plate,e.registrationCountry)],[l.trailerPlate,e.trailerPlate],[l.trailerCountry,e.trailerCountry]].forEach(([k,v],j)=>row(k||'',v,274+j*9));
 box('8. '+t.insurer,x,314,w,111,fill);
 [[t.insurer,v.insurer],[t.policy,v.policy],[l.greenCard,e.greenCard],[l.insuranceFrom,e.insuranceFrom],[l.insuranceUntil,e.insuranceUntil],[l.agency,e.agency],[l.agencyAddress,e.agencyAddress],[l.agencyPhone,e.agencyPhone],[l.comprehensive,e.comprehensive]].forEach(([k,v],j)=>row(k||'',v,336+j*9.4));
 box('9. '+t.driver,x,425,w,106,fill);
 [[t.driver,join(v.driver,e.driverFirstName)],[l.driverBirthDate,e.driverBirthDate],[t.address,v.address],[l.driverPostcode,join(e.driverPostcode,e.driverCountry)],[l.driverPhone,e.driverPhone],[t.email,v.email],[l.licenceNumber,e.licenceNumber],[l.licenceCategory,join(e.licenceCategory,e.licenceUntil)]].forEach(([k,v],j)=>row(k||'',v,447+j*10));
 }
 vehicle(0);vehicle(1);box('12. '+t.steps[2].toUpperCase(),201,166,193,365);tx('A',208,188,11,bold);tx('B',378,188,11,bold);
 standardCircumstances[m.lang].forEach((s,k)=>{const y=207+k*17.5;rect(207,y+2,7,7);rect(381,y+2,7,7);for(const i of [0,1] as const)if(r.vehicles[i].standardCircumstances?.includes(k))tx('X',i===0?207:381,y,8,writing,ink);wrapped((k+1)+'. '+s,220,y,155,6.6,font,2);});
 tx(String(r.vehicles[0].standardCircumstances?.length||0),208,512,9,writing,ink);wrapped(m.lang==='fr'?'Nombre de cases cochées':m.lang==='de'?'Anzahl markierter Kästchen':m.lang==='nl'?'Aantal aangevinkte vakjes':'Number of checked boxes',224,512,150,6.5,font,1);tx(String(r.vehicles[1].standardCircumstances?.length||0),378,512,9,writing,ink);
 for(const i of [0,1] as const){const x=i===0?24:454;box('10. '+extraLabels[m.lang].impact,x,539,117,75);wrapped(r.vehicles[i].extra?.impact||c.missing,x+5,560,107,8,writing,4,ink);box('11. '+t.damage,x,614,117,84);wrapped(r.vehicles[i].damage||c.missing,x+5,636,107,8,writing,5,ink);}
 box('13. '+(m.sketch?({fr:'Croquis proposé',en:'Proposed sketch',de:'Skizzenvorschlag',nl:'Schetsvoorstel'}[m.lang]):t.sketch),141,539,313,159);for(let x=151;x<447;x+=16)page.drawLine({start:{x,y:H-560},end:{x,y:H-690},color:rgb(.91,.93,.95),thickness:.3});
 for(let y=565;y<690;y+=16)page.drawLine({start:{x:148,y:H-y},end:{x:446,y:H-y},color:rgb(.91,.93,.95),thickness:.3});
 if(m.sketch){for(const road of m.sketch.roads)for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i];page.drawLine({start:{x:148+a.x*.37,y:H-561-a.y*.31},end:{x:148+b.x*.37,y:H-561-b.y*.31},thickness:8,color:rgb(.8,.83,.87)});}for(const v of m.sketch.vehicles){page.drawRectangle({x:148+v.x*.37,y:H-561-v.y*.31,width:14,height:8,rotate:degrees(-v.angle),color:v.side==='A'?cyan:gold});tx(v.side,148+v.x*.37,561+v.y*.31,7,bold);}tx('IA - '+c.full,148,688,5.2);}
 else if(r.strokes.length){for(const stroke of r.strokes)for(let i=1;i<stroke.length;i++){const a=stroke[i-1],b=stroke[i];page.drawLine({start:{x:148+a.x*.37,y:H-561-a.y*.39},end:{x:148+b.x*.37,y:H-561-b.y*.39},thickness:.9,color:ink});}}
 else tx(c.missing,151,584,9,font);
 for(const i of [0,1] as const){const x=i===0?24:394;box('14. '+t.observations+' '+(i===0?'A':'B'),x,705,177,109);wrapped(r.vehicles[i].observations||c.missing,x+5,725,167,8,writing,8,ink);}
 box('15. '+c.signature,201,705,193,109);
 for(const i of [0,1] as const){const x=205+i*94;tx(i===0?'A':'B',x,731,12,bold);const sig=m.signatures?.[i];if(sig){const im=await doc.embedPng(sig.data);const scale=Math.min(84/im.width,40/im.height);page.drawImage(im,{x,y:H-800,width:im.width*scale,height:im.height*scale});}else wrapped(m.translation?translationCopy[m.lang].signatureReference:c.waiting,x,766,86,7,font,3);}

 // Full readable values are always appended, so condensed form cells never erase data.
 r=m.report;
 page=doc.addPage([W,H]);let y=60;tx(c.annex,24,25,16,bold);
 function newPage(){page=doc.addPage([W,H]);tx(c.annex,24,25,13,bold);y=58;}
 function entry(label:string,v:string){const labels=lines(label,547,9,bold);if(y+labels.length*11+17>782)newPage();for(const l of labels){if(y>782)newPage();tx(l,24,y,9,bold);y+=11;}y+=4;for(const l of lines(v||c.missing,535,10,writing)){if(y>782)newPage();tx(l,30,y,10,writing,ink);y+=13;}y+=9;}
 if(m.unilateral){entry(policyCopy[m.lang].unsigned,m.unilateral.side);entry(policyCopy[m.lang].reason,m.unilateral.reason);entry(policyCopy[m.lang].refusal,policyCopy[m.lang].steps);}
 entry(t.date+' / '+t.time,r.date+' '+r.time+' · '+eventZone(r));entry(t.place,fullPlace(r));entry(t.country,r.country);entry(c.thirdVehicles,r.otherVehiclesDamage==='yes'?t.yes:r.otherVehiclesDamage==='no'?t.no:c.missing);entry(c.thirdObjects,r.otherObjectsDamage==='yes'?t.yes:r.otherObjectsDamage==='no'?t.no:c.missing);entry('5. '+t.witnesses,r.witnesses);if(r.confirmedLocation)entry(repairCopy[m.lang].gps,`${r.confirmedLocation.latitude}, ${r.confirmedLocation.longitude} | ${r.confirmedLocation.confirmedAt}`);if(r.location)entry('GPS',`${r.location.latitude}, ${r.location.longitude} | ± ${r.location.accuracy} m | ${r.location.capturedAt}`);
 for(const i of [0,1] as const){entry(t.vehicle+' '+(i===0?'A':'B'),r.vehicles[i].plate);const v=r.vehicles[i];for(const k of ['driver','policyholder','plate','model','insurer','policy','email','address','damage','observations'] as const)entry(t[k],v[k]);for(const k of extraFields)if(v.extra?.[k])entry(extraLabels[m.lang][k],v.extra?.[k]||'');entry(c.standard,(v.standardCircumstances||[]).map(k=>(k+1)+'. '+standardCircumstances[m.lang][k]).join('\n'));if(v.circumstances.length)entry(c.legacy,v.circumstances.map(k=>t.circumstances[k]).join('\n'));}
 if(m.translation){entry(translationCopy[m.lang].pdfNotice,translationCopy[m.lang].review);for(const i of [0,1] as const){const translated=translatedReport(r,m.translation).vehicles[i];entry(t.vehicle+' '+(i===0?'A':'B')+' — '+t.damage,translated.damage);entry(t.vehicle+' '+(i===0?'A':'B')+' — '+t.observations,translated.observations);entry(t.vehicle+' '+(i===0?'A':'B')+' — '+extraLabels[m.lang].impact,translated.extra?.impact||'');}}
 if(m.sketch?.uncertainties.length)entry('IA',m.sketch.uncertainties.join('\n'));
 entry(c.reference,m.digest);entry(c.note,c.correction);
 for(const i of [0,1] as const){const sig=m.signatures?.[i];if(sig){entry(c.signature+' '+(i===0?'A':'B'),c.signedAt+': '+sig.at+' | '+sig.kind);entry(c.consent,m.digest);}}
 if(m.sketch&&r.strokes.length){page=doc.addPage([W,H]);wrapped(sketchCopy[m.lang].manualAnnex,24,26,547,12,bold);for(const stroke of r.strokes)for(let i=1;i<stroke.length;i++){const a=stroke[i-1],b=stroke[i];page.drawLine({start:{x:24+a.x*.68,y:H-80-a.y*.68},end:{x:24+b.x*.68,y:H-80-b.y*.68},thickness:1,color:ink});}}
 for(let i=0;i<r.photos.length;i++){const photo=r.photos[i];page=doc.addPage([W,H]);tx(t.photos+' '+(i+1)+' · '+(photo.side||'-'),24,26,15,bold);wrapped(photo.name,24,50,547,9,font);const raw=photo.data.slice(photo.data.indexOf(',')+1);await doc.attach(bytes(raw),`photo-${i+1}-${photo.side||'unknown'}.${photo.data.startsWith('data:image/png')?'png':photo.data.startsWith('data:image/jpeg')?'jpg':'webp'}`,{mimeType:photo.data.slice(5,photo.data.indexOf(';')),description:photo.name});const source=photo.data;if(source.startsWith('data:image/webp')){wrapped(c.imageAttached,24,90,547,12);}else{const im=source.startsWith('data:image/png')?await doc.embedPng(source):await doc.embedJpg(source);const scale=Math.min(547/im.width,680/im.height);page.drawImage(im,{x:24+(547-im.width*scale)/2,y:80+(680-im.height*scale)/2,width:im.width*scale,height:im.height*scale});}}
 // Every page is part of the same signed digest. Originals are attached for complete preservation.
 await doc.attach(new TextEncoder().encode(JSON.stringify({report:r,revision:m.revision,style:m.style,lang:m.lang,sketch:m.sketch,translation:m.translation||null,unilateral:m.unilateral||null},null,2)),'accordia-original-data.json',{mimeType:'application/json',description:c.full});
 await referencePage(doc,m,writing);
 if(m.unilateral){doc.setKeywords(['accordia-reference-v1','accordia-unilateral']);const p=doc.getPage(0);p.drawRectangle({x:12,y:H-23,width:571,height:20,color:rgb(1,1,1)});p.drawText(policyCopy[m.lang].unsigned+' '+m.unilateral.side,{x:16,y:H-16,size:6.2,font,color:rgb(.65,.1,.1)});}

 for(const [i,p]of doc.getPages().entries()){if(i===0)continue;tx(c.disclaimer,24,819,6,font,navy,p);tx(`${i+1} / ${doc.getPageCount()}`,542,819,6,font,navy,p);}
 return doc.save();
}

// Add signatures to the exact PDF that was offered for review; never re-render its declarations.
export async function stampPdf(source:Uint8Array,signatures:[Signature,Signature],lang:Lang,digest:string,localNotice?:string){
 const doc=await PDFDocument.load(source);doc.registerFontkit(fontkit);const font=await doc.embedFont(bytes(regular),{subset:true}),c=finalCopy[lang],H=841.89,p=doc.getPage(0);
 if(doc.getKeywords()?.includes('accordia-unilateral'))throw new Error('unilateral_cannot_use_signatures');
 const reference=doc.getKeywords()?.includes('accordia-reference-v1');
 if(!reference){p.drawRectangle({x:24,y:H-70,width:547,height:13,color:rgb(1,1,1)});p.drawText(c.ready,{x:24,y:H-67,size:7.2,font});}
 const v3=doc.getKeywords()?.includes('accordia-layout-v3');for(const [i,sig]of signatures.entries()){if(reference){const sx=595.28/1085,sy=H/1536,im=await doc.embedPng(sig.data),scale=Math.min(140*sx/im.width,45*sy/im.height);p.drawImage(im,{x:(i===0?391:570)*sx,y:H-1490*sy,width:im.width*scale,height:im.height*scale});continue;}const x=v3?205+i*94:24+i*273.5;const im=await doc.embedPng(sig.data),scale=Math.min((v3?84:240)/im.width,(v3?40:30)/im.height);p.drawRectangle({x:v3?x:x+1,y:H-813,width:v3?86:271,height:v3?58:36,color:rgb(1,1,1)});p.drawImage(im,{x:v3?x:x+15,y:H-(v3?800:809),width:im.width*scale,height:im.height*scale});}
 if(reference){p.drawRectangle({x:390*595.28/1085,y:H-1518*H/1536,width:330,height:10,color:rgb(1,1,1)});p.drawText(c.ready,{x:400*595.28/1085,y:H-1514*H/1536,size:6,font});}
 let audit=doc.addPage([595.28,H]),y=88;
 const auditTitle=()=>audit.drawText('Accordia - '+c.signature,{x:24,y:H-48,size:18,font});auditTitle();
 const block=(text:string,size=10)=>{for(const line of pdfTextLines(text,540,s=>font.widthOfTextAtSize(s,size))){if(y>782){audit=doc.addPage([595.28,H]);auditTitle();y=88;}audit.drawText(line,{x:24,y:H-y,size,font});y+=16;}y+=8;};
 block(c.reference+': '+digest,8);block(c.note);if(localNotice)block(localNotice);for(const [i,sig]of signatures.entries()){y+=18;block((i===0?'A':'B')+' - '+c.signedAt+': '+sig.at);block(sig.kind==='drawn'?c.draw:c.upload);block(c.consent,9);}
 for(const [i,page]of doc.getPages().entries()){if(reference&&i===0)continue;page.drawRectangle({x:534,y:H-830,width:45,height:15,color:rgb(1,1,1)});page.drawText(`${i+1} / ${doc.getPageCount()}`,{x:542,y:H-825,size:6,font});}
 return doc.save();
}
