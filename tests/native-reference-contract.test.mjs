import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import fontkit from '@pdf-lib/fontkit';
import {referenceImage} from '../server/reference-image.ts';import {regular,hand} from '../server/pdf-fonts.ts';
const asset=(name)=>readFileSync(new URL('../mobile/accordia_native/assets/pdf/'+name,import.meta.url));
test('native report uses exactly the website reference background and regular font',()=>{
 assert.deepEqual(asset('reference.jpg'),Buffer.from(referenceImage,'base64'));
 assert.deepEqual(asset('web-regular.ttf'),Buffer.from(regular,'base64'));
});
test('native handwriting font preserves the web WOFF glyphs and metrics after TTF conversion',()=>{
 const web=fontkit.create(Buffer.from(hand,'base64')),native=fontkit.create(asset('web-hand.ttf'));
 assert.deepEqual(native.characterSet,web.characterSet);
 for(const cp of web.characterSet){const a=web.glyphForCodePoint(cp),b=native.glyphForCodePoint(cp);assert.equal(a.advanceWidth,b.advanceWidth);assert.equal(a.path.toSVG(),b.path.toSVG());}
});
test('native supplied-form cell coordinates match website reference-page fill calls',()=>{
 const web=readFileSync(new URL('../server/reference-page.ts',import.meta.url),'utf8'),native=readFileSync(new URL('../mobile/accordia_native/lib/reports/reference_pdf.dart',import.meta.url),'utf8');
 const extract=(s)=>[...s.matchAll(/fill\(\s*([rve])(?:\.([A-Za-z]\w*)|\['(\w+)'\])\s*,\s*(\d+(?:\s*\+\s*dx)?)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d+))?/g)].map(m=>[m[1]+'.'+(m[2]||m[3]),m[4].replace(/\s/g,''),m[5],m[6],m[7]||'19']);
 const cells=extract(web);assert.ok(cells.length>=25);assert.deepEqual(extract(native),cells);
});
