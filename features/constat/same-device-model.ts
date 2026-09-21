import {sha256} from '@noble/hashes/sha2.js';
import {bytesToHex} from '@noble/hashes/utils.js';
import type {Report} from './model';
// Ignore bookkeeping; common facts and unassigned evidence concern both drivers.
const photoKeys=new WeakMap<object,{data:string,preview?:string,name:string,side?:string,key:string}>();
function photoKey(photo:Report['photos'][number]){const previous=photoKeys.get(photo);if(previous&&previous.data===photo.data&&previous.preview===photo.preview&&previous.name===photo.name&&previous.side===photo.side)return previous.key;const key=bytesToHex(sha256(new TextEncoder().encode(JSON.stringify(photo))));photoKeys.set(photo,{...photo,key});return key}
export function reportContentKey(report:Report){const {updated,photos,...rest}=report;return JSON.stringify({...rest,photos:photos.map(photoKey)})}
export function deviceCompletionKey(report:Report,side:0|1){
 const {id,updated,vehicles,photos,readingLanguages,...common}=report;
 return JSON.stringify({common,vehicle:vehicles[side],photos:photos.filter(p=>!p.side||p.side===(side===0?'A':'B')).map(photoKey),language:readingLanguages[side]});
}
