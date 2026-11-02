import QRCode from 'qrcode';
import {rgb,PDFName,PDFString,type PDFDocument,type PDFPage,type PDFFont} from 'pdf-lib';
import {pdfAccess} from '../features/constat/pdf-access.ts';
import {pdfAccessCopy} from '../features/constat/pdf-access-copy.ts';
import type {Lang} from '../features/constat/i18n.ts';
export function drawPdfAccessQr(doc:PDFDocument,page:PDFPage,font:PDFFont,sessionId:string|undefined,lang:Lang){
 const access=pdfAccess(sessionId,lang),copy=pdfAccessCopy[lang];
 // Mask the complete barcode and printed digits in the reference image.
 const x=461,y=780,w=121,h=56;page.drawRectangle({x,y,width:w,height:h,color:rgb(1,1,1)});
 const qr=QRCode.create(access.url,{errorCorrectionLevel:'M'}),n=qr.modules.size,quiet=4,size=43,unit=size/(n+quiet*2),qx=500,qy=791;
 for(let row=0;row<n;row++)for(let col=0;col<n;col++)if(qr.modules.get(row,col))page.drawRectangle({x:qx+(col+quiet)*unit,y:qy+size-(row+quiet+1)*unit,width:unit+.005,height:unit+.005,color:rgb(0,0,0)});
 const label=access.shared?copy.shared:copy.local,note=access.shared?copy.auth:copy.offline;
 for(const [text,baseline]of [[label,785],[note,780.5]] as const){const fontSize=4.3;page.drawText(text,{x:x+(w-font.widthOfTextAtSize(text,fontSize))/2,y:baseline,size:fontSize,font,color:rgb(.08,.16,.26)});}
 const annotation=doc.context.register(doc.context.obj({Type:'Annot',Subtype:'Link',Rect:[x,y,x+w,y+h],Border:[0,0,0],A:{Type:'Action',S:PDFName.of('URI'),URI:PDFString.of(access.url)}}));page.node.addAnnot(annotation);
 return access;
}
