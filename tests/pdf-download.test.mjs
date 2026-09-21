import test from 'node:test';import assert from 'node:assert/strict';
import {pdfFilename} from '../features/constat/pdf-download.ts';
test('PDF filenames distinguish session, language, generation, style and signature state without header injection',()=>{
 const d={id:'generation-A',session_id:'session-A',revision:3,lang:'fr',style:'blue-pen',translated:1};
 const name=pdfFilename(d,false);assert.ok(name.includes('session-A-fr-v3-blue-pen-traduction-generation-A-relecture'));
 for(const variant of [{...d,id:'generation-B'},{...d,lang:'de'},{...d,session_id:'session-B'}])assert.notEqual(pdfFilename(variant,false),name);
 assert.notEqual(pdfFilename(d,true),name);assert.ok(!/[\r\n"/]/.test(pdfFilename({...d,id:'bad\r\n"/file'},false)));
});
