import {DOCUMENT_ACCEPT, DOCUMENT_BYTES} from './document-model.ts';
export const DOCUMENT_SOURCE_BYTES = 20 * 1024 * 1024;
export function validDocumentSource(file: Pick<File, 'size'|'type'>) {
 return file.size > 0 && DOCUMENT_ACCEPT.split(',').includes(file.type) && file.size <= (file.type === 'application/pdf' ? DOCUMENT_BYTES : DOCUMENT_SOURCE_BYTES);
}
export async function prepareDocument(file: File, signal?: AbortSignal): Promise<string> {
 if (!validDocumentSource(file)) throw new Error('document_invalid');
 if (signal?.aborted) throw new Error('document_cancelled');
 const original = await new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  const cancel = () => { reader.abort(); reject(new Error('document_cancelled')); };
  const cleanup = () => signal?.removeEventListener('abort', cancel);
  reader.onload = () => { cleanup(); resolve(String(reader.result)); };
  reader.onerror = () => { cleanup(); reject(new Error('document_invalid')); };
  reader.onabort = () => { cleanup(); reject(new Error('document_cancelled')); };
  signal?.addEventListener('abort', cancel, {once:true}); reader.readAsDataURL(file);
 });
 if (signal?.aborted) throw new Error('document_cancelled');
 if (file.type === 'application/pdf') return original;
 const image = await new Promise<HTMLImageElement>((resolve, reject) => {
  const im = new Image();
  const cleanup = () => signal?.removeEventListener('abort', cancel);
  const cancel = () => { cleanup(); im.onload = null; im.onerror = null; im.src = ''; reject(new Error('document_cancelled')); };
  im.onload = () => { cleanup(); resolve(im); };
  im.onerror = () => { cleanup(); reject(new Error('document_invalid')); };
  signal?.addEventListener('abort', cancel, {once:true});
  if (signal?.aborted) cancel(); else im.src = original;
 });
 if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 40000000) throw new Error('document_invalid');
 const ratio = Math.min(1, 2000 / Math.max(image.naturalWidth, image.naturalHeight));
 const canvas = document.createElement('canvas');
 canvas.width = Math.max(1, Math.floor(image.naturalWidth * ratio)); canvas.height = Math.max(1, Math.floor(image.naturalHeight * ratio));
 const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('document_invalid');
 ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
 // Re-encoding avoids forwarding EXIF metadata. Never replace the local original.
 for (const quality of [.92, .82, .72]) {
  const data = canvas.toDataURL('image/jpeg', quality);
  if (data.startsWith('data:image/jpeg;base64,') && (data.split(',')[1].length * 3 / 4) <= DOCUMENT_BYTES) return data;
 }
 throw new Error('document_invalid');
}
