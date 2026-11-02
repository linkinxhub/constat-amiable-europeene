'use client';
import {usePathname,useSearchParams} from 'next/navigation';
import {publicLanguage} from '../product/presentation-copy';
import {feedbackCopy} from './copy';
export function FeedbackEntry(){const path=usePathname(),q=useSearchParams(),lang=publicLanguage(q.get('lang'))||'fr';if(path==='/feedback')return null;return <aside className="feedback-entry"><a href={'/feedback?lang='+lang+'&source='+(['/','/guide','/pricing'].includes(path)?'site':'platform')} target="_blank" rel="noopener noreferrer">{feedbackCopy[lang].link} ↗</a></aside>}
