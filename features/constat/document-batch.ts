import {documentFields, extractionResult, documentValue, type DocumentField, type Extraction} from './document-model.ts';
import type {Vehicle} from './model';

// A batch is only a browser queue. Each document retains its own server-side
// authorization, selected kind, quota reservation and bounded provider request.
export const DOCUMENT_BATCH_LIMIT = 5;
export type DocumentReading = {source: string; result: Extraction};
export function documentCandidates(readings: DocumentReading[]) {
 const candidates: Partial<Record<DocumentField, Array<Extraction['fields'][number] & {sources: string[]}>>> = {};
 for (const reading of readings) for (const field of extractionResult.parse(reading.result).fields) {
  const list = candidates[field.field] ??= [];
  const same = list.find(item => item.value === field.value);
  if (same) {
   if (!same.sources.includes(reading.source)) same.sources.push(reading.source);
   // An uncertain reading must still be checked, even if another page agrees.
   if (field.confidence === 'uncertain') same.confidence = 'uncertain';
  } else list.push({...field, sources: [reading.source]});
 }
 return documentFields.filter(field => candidates[field]?.length).map(field => ({field, values: candidates[field]!}));
}
export function defaultDocumentSelection(vehicle: Vehicle, readings: DocumentReading[]): Extraction['fields'] {
 return documentCandidates(readings).flatMap(({field, values}) =>
  values.length === 1 && values[0].confidence === 'high' && !documentValue(vehicle, field)
   ? [{field, value: values[0].value, confidence: values[0].confidence}] : []);
}
