export function pdfFilename(document:{id:string;session_id:string;revision:number;lang:string;style:string;translated:number},signed:boolean){
 const safe=(s:string)=>s.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,40)||'document';
 return `Accordia-${safe(document.session_id)}-${safe(document.lang)}-v${document.revision}-${safe(document.style)}-${document.translated?'traduction-':''}${safe(document.id)}-${signed?'signe':'relecture'}.pdf`;
}
