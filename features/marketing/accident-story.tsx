'use client';
import {useEffect,useRef,useState} from 'react';
import {Pause,Play,RotateCcw,ArrowUpRight,ShieldCheck,Volume2,VolumeX} from 'lucide-react';
import type {Lang} from '../constat/i18n';
import {useReducedMotion} from './motion-preference';
import {accidentStoryCopy} from './accident-story-copy';
import {useBrowserReady} from '../constat/browser-ready';
import {createNarration,browserNarration} from './story-narration';
import {createRecordedNarration,frenchNarration} from './recorded-narration';
import {StoryVideoShare} from './story-video-actions';
import {storyNarrationCopy} from './story-narration-copy';
const cues=frenchNarration.cues.map(t=>Math.round(t*1000)),duration=Math.ceil(frenchNarration.duration*1000);
export function AccidentStory({lang,paused=false}:{lang:Lang;paused?:boolean}){
 const c=accidentStoryCopy[lang],voice=storyNarrationCopy[lang],reduced=useReducedMotion(),browserReady=useBrowserReady();
 const recorded=lang==='fr',voiceAvailable=browserReady&&typeof window!=='undefined'&&(recorded?typeof Audio!=='undefined':'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined');
 const video=useRef<HTMLVideoElement|null>(null);
 const controller=useRef<ReturnType<typeof createNarration>|null>(null),[narrating,setNarrating]=useState(false),[voiceError,setVoiceError]=useState(false);
 useEffect(()=>()=>controller.current?.stop(),[]);
 const [root,setRoot]=useState<HTMLElement|null>(null),[visible,setVisible]=useState(false),[seen,setSeen]=useState(false),[pageVisible,setPageVisible]=useState(true),[localPaused,setLocalPaused]=useState(false),[elapsed,setElapsed]=useState(0),[cycle,setCycle]=useState(0);
 useEffect(()=>{if(!root||typeof IntersectionObserver==='undefined')return;const observer=new IntersectionObserver(entries=>{const show=entries.some(e=>e.isIntersecting&&e.intersectionRatio>0),start=entries.some(e=>e.isIntersecting&&e.intersectionRatio>=.6);setVisible(show);if(start)setSeen(true);setPageVisible(!document.hidden)},{threshold:[0,.6]});observer.observe(root);return()=>observer.disconnect()},[root]);
 useEffect(()=>{const update=()=>setPageVisible(!document.hidden);document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update)},[]);
 const finished=elapsed>=duration,playback=seen&&visible&&pageVisible&&!paused&&!localPaused&&!finished,running=playback&&!reduced;
 useEffect(()=>{if(narrating){if(playback)controller.current?.resume();else controller.current?.pause()}},[narrating,playback]);
 useEffect(()=>{if(!running||narrating)return;const timer=setInterval(()=>setElapsed(t=>Math.min(duration,t+250)),250);return()=>clearInterval(timer)},[running,narrating]);
 const beat=reduced||!seen?7:Math.max(0,cues.findLastIndex(t=>elapsed>=t)),phase=Math.min(3,beat);
 function toggleNarration(){if(narrating){controller.current?.stop();setNarrating(false);setLocalPaused(true);return}video.current?.pause();controller.current?.stop();setVoiceError(false);setElapsed(0);setLocalPaused(false);setCycle(n=>n+1);setNarrating(true);setSeen(true);const events={phase:(i:number)=>setElapsed(cues[i]),finish:()=>{setElapsed(duration);setNarrating(false)},error:()=>{setNarrating(false);setLocalPaused(true);setVoiceError(true)}};controller.current=recorded?createRecordedNarration(frenchNarration,events):createNarration(browserNarration(),voice.lines.map(text=>({text,lang:voice.locale})),events);controller.current.start()}
 function replay(){setVoiceError(false);setElapsed(0);setLocalPaused(false);setCycle(n=>n+1)}
 return <section className="accident-story" aria-label={c.question} data-phase={phase} data-beat={beat} data-running={running} data-reduced={reduced}>
  <div className="story-top"><span><ShieldCheck size={15} aria-hidden="true"/>{c.eyebrow}</span><span className="story-duration">{narrating?voice.playing:'57 s'}</span></div>
  <h2>{c.question}</h2><p className="story-intro">{c.intro} <strong>{c.answer}</strong></p>
  <div ref={setRoot} className="story-art" key={cycle} aria-hidden="true">
   <svg viewBox="0 0 640 320" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="story-sky" x2="0" y2="320" gradientUnits="userSpaceOnUse"><stop stopColor="#E7F1F3"/><stop offset="1" stopColor="#FAFCFA"/></linearGradient><linearGradient id="story-screen" x2="1" y2="1"><stop stopColor="#F7FBFE"/><stop offset="1" stopColor="#E5F3EF"/></linearGradient></defs>
    <rect width="640" height="320" rx="24" fill="url(#story-sky)"/>
    <circle cx="513" cy="57" r="23" fill="#F4E7BF"/><path d="M0 158C105 117 135 168 234 141S425 113 640 151V222H0Z" fill="#D5E6DF"/>
    <path d="M0 208H640V274H0Z" fill="#CAD6DC"/><path d="M0 240H640" stroke="#F8FCFD" strokeWidth="3" strokeDasharray="30 28"/>
    <path d="M0 280H640" stroke="#BACEC4" strokeWidth="2"/>
    <g className="story-tree" stroke="#7B9E8A" strokeWidth="5" strokeLinecap="round"><path d="M58 180V127M581 182V116"/><path d="M39 143L58 117L79 144M561 133L581 104L602 133"/></g>
    <g className="story-car-a"><ellipse cx="340" cy="263" rx="82" ry="7" fill="#6F858F" opacity=".15"/><path d="M262 239L275 213Q280 202 295 202H343L374 224L402 230V253H258V244Z" fill="#1D5870"/><path d="M289 210H309V229H279Z" fill="#BBDCE4"/><path d="M316 210H340L364 229H316Z" fill="#D2E9ED"/><rect x="386" y="235" width="14" height="6" rx="2" fill="#F3D779"/><circle cx="285" cy="252" r="13" fill="#18333F"/><circle cx="285" cy="252" r="6" fill="#B2C6CB"/><circle cx="372" cy="252" r="13" fill="#18333F"/><circle cx="372" cy="252" r="6" fill="#B2C6CB"/><text x="326" y="247" fill="white" fontSize="15" fontWeight="700">A</text></g>
    <g className="story-car-b"><ellipse cx="184" cy="263" rx="76" ry="7" fill="#6F858F" opacity=".15"/><path d="M110 237L122 214Q126 205 140 205H182L212 225L250 232V253H105V243Z" fill="#D4AA46"/><path d="M136 213H153V231H125Z" fill="#F4E9C6"/><path d="M160 213H180L203 231H160Z" fill="#F6EED5"/><rect x="237" y="237" width="12" height="6" rx="2" fill="#FFF5CF"/><circle cx="132" cy="252" r="13" fill="#18333F"/><circle cx="132" cy="252" r="6" fill="#B2C6CB"/><circle cx="220" cy="252" r="13" fill="#18333F"/><circle cx="220" cy="252" r="6" fill="#B2C6CB"/><text x="174" y="248" fill="#483A1B" fontSize="15" fontWeight="700">B</text></g>
    <g className="story-safe"><path d="M449 273L465 245L481 273Z" stroke="#A66045" strokeWidth="4" strokeLinejoin="round"/><circle cx="465" cy="266" r="2" fill="#A66045"/><path d="M465 254V261" stroke="#A66045" strokeWidth="2" strokeLinecap="round"/>
     <circle cx="515" cy="149" r="10" fill="#C99270"/><path d="M503 177Q515 157 527 177V206H503Z" fill="#F0CC63"/><path d="M510 207L505 232M520 207L526 232" stroke="#355361" strokeWidth="7" strokeLinecap="round"/><path d="M508 176L501 197M522 176L531 193" stroke="#C99270" strokeWidth="6" strokeLinecap="round"/>
     <circle cx="555" cy="151" r="10" fill="#A26E56"/><path d="M545 177Q555 164 568 178V207H544Z" fill="#E7BA56"/><path d="M550 208L546 232M562 208L568 232" stroke="#355361" strokeWidth="7" strokeLinecap="round"/>
    </g>
    <g className="story-paper"><rect x="227" y="47" width="125" height="100" rx="14" fill="white" stroke="#D0DEE3" strokeWidth="2"/><path d="M247 72H309M247 87H329M247 102H293" stroke="#BCCDD4" strokeWidth="4" strokeLinecap="round"/><circle cx="340" cy="66" r="25" fill="#FCF6E8" stroke="#D8C591"/><text x="331" y="76" fontSize="30" fontWeight="600" fill="#9E7B32">?</text></g>
    <g className="story-phone"><rect x="245" y="19" width="151" height="278" rx="27" fill="#173D4D"/><rect x="253" y="27" width="135" height="262" rx="21" fill="url(#story-screen)"/><path d="M286 28H355V34Q355 42 345 42H296Q286 42 286 34Z" fill="#173D4D"/><path d="M315 57L325 61V70Q320 78 315 79Q307 75 306 69V61Z" stroke="#188979" strokeWidth="2"/><text x="269" y="104" fontSize="21" fontWeight="700" fill="#173D4D">Accordia</text><rect x="267" y="122" width="48" height="47" rx="10" fill="#D7EBF3"/><rect x="325" y="122" width="48" height="47" rx="10" fill="#F4E9B9"/><text x="283" y="152" fontSize="22" fontWeight="700" fill="#24556D">A</text><text x="341" y="152" fontSize="22" fontWeight="700" fill="#72602A">B</text><path d="M271 188H368M271 201H348M271 214H360" stroke="#AEC9CB" strokeWidth="4" strokeLinecap="round"/><rect x="266" y="237" width="108" height="31" rx="9" fill="#167E70"/><path d="M309 253L318 259L332 246" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></g>
    {beat>=4&&<g><rect x="264" y="178" width="113" height="47" rx="7" fill="#E5F3EF"/><text x="320" y="205" textAnchor="middle" fontSize="18" fontWeight="700" fill="#173D4D">{beat===4?'▧ + ▧':beat===5?'A + B':beat===6?'✓ ✓ ✓':'PDF ↓'}</text></g>}
   </svg>
  </div>
  <div className="story-caption"><span className="story-count">0{beat+1}<span>/08</span></span><div><strong>{c.steps[beat]}</strong><p>{c.hints[beat]}</p></div></div>
  <div className="story-progress" aria-hidden="true">{c.steps.map((s,i)=><span key={s} className={i<=beat?'active':''}/>)}</div>
  <div className="story-actions"><a href={'/constat?lang='+lang}>{c.start}<ArrowUpRight size={17} aria-hidden="true"/></a><a href="#how">{c.how}</a></div>
  <div className="story-audio">{voiceAvailable?<button type="button" disabled={paused} aria-pressed={narrating} onClick={toggleNarration}>{narrating?<VolumeX size={16} aria-hidden="true"/>:<Volume2 size={16} aria-hidden="true"/>}{narrating?voice.stop:voice.start}</button>:<p>{voice.unavailable}</p>}{voiceError&&<p role="alert">{voice.error}</p>}</div><div className="story-bottom"><span>{c.note}</span>{reduced?<span>{c.static}</span>:<button type="button" disabled={paused} onClick={()=>finished?replay():setLocalPaused(p=>!p)}>{finished?<RotateCcw size={14} aria-hidden="true"/>:localPaused?<Play size={14} aria-hidden="true"/>:<Pause size={14} aria-hidden="true"/>}{finished?c.replay:localPaused?c.resume:c.pause}</button>}</div>
  <StoryVideoShare lang={lang} videoRef={video} onPlaybackStart={()=>{controller.current?.stop();setNarrating(false);setLocalPaused(true)}}/>
 </section>
}
