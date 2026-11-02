// Device speech only, started by an explicit user action. No API key or asset URL.
export type SpeechLine={text:string;lang:string};
export type NarrationBackend={speak:(line:SpeechLine,onEnd:()=>void,onError:()=>void)=>void;cancel:()=>void};
export function createNarration(backend:NarrationBackend,lines:SpeechLine[],events:{phase:(i:number)=>void;finish:()=>void;error:()=>void}){
 let index=0,token=0,active=false,stopped=true;
 let deadline:ReturnType<typeof setTimeout>|undefined;const clear=()=>{if(deadline!==undefined)clearTimeout(deadline);deadline=undefined};
 function speak(){if(stopped||active)return;active=true;const stamp=++token;events.phase(index);deadline=setTimeout(()=>{if(stamp!==token||stopped)return;stopped=true;active=false;++token;backend.cancel();events.error()},30000);backend.speak(lines[index],()=>{if(stamp!==token||stopped)return;clear();active=false;if(++index>=lines.length){stopped=true;events.finish()}else speak()},()=>{if(stamp!==token||stopped)return;clear();active=false;stopped=true;events.error()})}
 return {start(){this.stop();index=0;stopped=false;speak()},pause(){if(!active)return;active=false;++token;clear();backend.cancel()},resume(){if(!stopped)speak()},stop(){const owned=active;stopped=true;active=false;++token;clear();if(owned)backend.cancel()}};
}
export function browserNarration(){return {speak(line:SpeechLine,onEnd:()=>void,onError:()=>void){try{const utterance=new SpeechSynthesisUtterance(line.text);utterance.lang=line.lang;utterance.rate=1;utterance.pitch=1;utterance.volume=.9;const voices=window.speechSynthesis.getVoices(),matching=voices.filter(v=>v.lang.toLowerCase().split('-')[0]===line.lang.split('-')[0]);utterance.voice=matching.find(v=>v.localService)||matching[0]||null;utterance.onend=onEnd;utterance.onerror=onError;window.speechSynthesis.speak(utterance)}catch{onError()}},cancel(){window.speechSynthesis.cancel()}}}
