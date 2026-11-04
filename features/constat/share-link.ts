// Never extend permissions, accept an external origin or include report content.
export function dossierShareLink(path:string,origin:string){const url=new URL(path,origin);if(url.origin!==origin||!/^\/session\/[a-zA-Z0-9_-]{16,80}$/.test(url.pathname)||url.search||(url.hash&&!/^#invite=[a-zA-Z0-9_-]{32,100}$/.test(url.hash)))throw new Error('invalid_link');return url.href}
