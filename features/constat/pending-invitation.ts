import {invitationPath} from './join-model.ts';
type StorageLike=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export const INVITATION_TTL=86400000;
export const validInvitationToken=(value:unknown):value is string=>typeof value==='string'&&/^[-a-zA-Z0-9_]{32,100}$/.test(value);
export function tokenFromFragment(hash:string){const p=new URLSearchParams(hash.replace(/^#/,''));const token=p.get('invite');return p.getAll('invite').length===1&&[...p.keys()].every(k=>k==='invite')&&validInvitationToken(token)?token:'';}
export function rememberInvitation(storage:StorageLike,id:string,token:string,now=Date.now()){if(!validInvitationToken(token))return false;try{storage.setItem('accordia-invite-'+id,JSON.stringify({token,at:now}));return true}catch{return false}}
export function pendingInvitation(storage:StorageLike,id:string,now=Date.now()){
 try{const raw=storage.getItem('accordia-invite-'+id);if(!raw)return '';if(raw.length>512){storage.removeItem('accordia-invite-'+id);return ''}if(validInvitationToken(raw)){rememberInvitation(storage,id,raw,now);return raw}const item=JSON.parse(raw);if(validInvitationToken(item.token)&&Number.isFinite(item.at)&&item.at<=now&&now-item.at<INVITATION_TTL)return item.token;storage.removeItem('accordia-invite-'+id)}catch{try{storage.removeItem('accordia-invite-'+id)}catch{}}return '';
}
export function forgetInvitation(storage:StorageLike,id:string){try{storage.removeItem('accordia-invite-'+id)}catch{}}
export function recoverInvitation(input:string,origin:string,id:string){const path=invitationPath(input,origin);if(path.split('#')[0]!=='/session/'+encodeURIComponent(id))throw new Error('different_invitation');const token=tokenFromFragment(path.slice(path.indexOf('#')));if(!token)throw new Error('invalid_invitation');return token;}
