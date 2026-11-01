// Navigation only: server invitation and site access checks stay authoritative.
export function invitationPath(input:string,origin:string):string{
 const url=new URL(input.trim(),origin);
 if(url.origin!==origin||url.username||url.password||!/^\/session\/[a-zA-Z0-9_-]{16,80}$/.test(url.pathname)||url.search)throw new Error('invalid_invitation');
 const fragment=new URLSearchParams(url.hash.slice(1)),token=fragment.get('invite');
 if(fragment.getAll('invite').length!==1||!token||!/^[-a-zA-Z0-9_]{32,200}$/.test(token)||[...fragment.keys()].some(k=>k!=='invite'))throw new Error('invalid_invitation');
 return url.pathname+'#invite='+encodeURIComponent(token);
}
