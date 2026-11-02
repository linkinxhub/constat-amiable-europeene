// One pre-recorded take. Cue times come from the provider's word alignment,
// rather than distributing words or changing playback speed to fit 15 seconds.
export const frenchNarration={src:'/audio/accordia-story-fr-v1.mp3',duration:12.016313,cues:[0,3.243,5.632,7.424]} as const;
export function createRecordedNarration(source:{src:string;cues:readonly number[]},events:{phase:(i:number)=>void;finish:()=>void;error:()=>void},makeAudio:(src:string)=>HTMLAudioElement=src=>new Audio(src)){
 let media:HTMLAudioElement|null=null,active=false,stopped=true,token=0,lastPhase=-1,watchdog:ReturnType<typeof setTimeout>|undefined;
 const clear=()=>{if(watchdog!==undefined)clearTimeout(watchdog);watchdog=undefined};
 function stop(){++token;stopped=true;active=false;clear();if(media){media.removeEventListener('timeupdate',time);media.removeEventListener('ended',ended);media.removeEventListener('error',failed);media.pause();media.removeAttribute('src');media.load();media=null}}
 function failed(){if(stopped)return;stop();events.error()}
 function guard(){clear();watchdog=setTimeout(failed,30000)}
 function time(){if(!media||stopped)return;let phase=0;for(let i=1;i<source.cues.length;i++)if(media.currentTime>=source.cues[i])phase=i;if(phase!==lastPhase){lastPhase=phase;events.phase(phase)}if(active)guard()}
 function ended(){if(stopped)return;stop();events.finish()}
 function resume(){if(stopped||active||!media)return;active=true;guard();const stamp=++token;try{void media.play().catch(()=>{if(stamp===token)failed()})}catch{failed()}}
 return {start(){stop();media=makeAudio(source.src);media.preload='none';media.playbackRate=1;media.addEventListener('timeupdate',time);media.addEventListener('ended',ended);media.addEventListener('error',failed);stopped=false;lastPhase=-1;time();resume()},pause(){if(stopped||!active)return;++token;active=false;clear();media?.pause()},resume,stop};
}
