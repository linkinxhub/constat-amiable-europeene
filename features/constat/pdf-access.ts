import type {Lang} from './i18n.ts';
// Canonical Site origin, never derived from a request Host header or user input.
export const PDF_ACCESS_ORIGIN='https://accordia-recette.adil-btp.chatgpt.site';
export function pdfAccess(sessionId:string|undefined,lang:Lang){
 if(sessionId!==undefined&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId))throw new Error('invalid_pdf_session');
 return {shared:!!sessionId,url:PDF_ACCESS_ORIGIN+(sessionId?'/session/'+encodeURIComponent(sessionId):'/account?lang='+lang)};
}
