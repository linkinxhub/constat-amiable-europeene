import {writeFileSync,mkdirSync} from 'node:fs';import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';
import {referenceImage} from '../server/reference-image.ts';import {regular,hand} from '../server/pdf-fonts.ts';
const directory=new URL('../mobile/accordia_native/assets/pdf/',import.meta.url);mkdirSync(directory,{recursive:true});
writeFileSync(new URL('reference.jpg',directory),Buffer.from(referenceImage,'base64'));
writeFileSync(new URL('web-regular.ttf',directory),Buffer.from(regular,'base64'));
// Developer-only export step: Android/iOS consume the resulting TTF directly.
execFileSync('python3',['-c','from fontTools.ttLib import TTFont; from io import BytesIO; import sys; f=TTFont(BytesIO(sys.stdin.buffer.read())); f.flavor=None; f.save(sys.argv[1])',fileURLToPath(new URL('web-hand.ttf',directory))],{input:Buffer.from(hand,'base64')});
