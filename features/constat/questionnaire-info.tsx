import {documentFirstCopy} from './document-first-copy';
import {qrScanCopy} from './qr-scan-copy';
import {reviewEntryCopy} from './review-entry-copy';
import {sharingCopy} from './sharing-copy';
import {pdfAccessCopy} from './pdf-access-copy';
import {synthesisCopy} from './synthesis-copy';
import {quickFlowCopy} from './quick-flow-copy';
import {onboardingCopy} from './onboarding-copy';
import {suggestionsCopy} from './damage-suggestions';
import {vehicleBrands,brandCopy} from './vehicle-brands';
import {experienceCopy} from './experience-copy';
import {entryModeCopy} from './entry-mode-copy';
import type {Lang} from './i18n';
import {questionnaireCopy} from './questionnaire-copy';
export function QuestionnaireInfo({lang}:{lang:Lang}){const c=questionnaireCopy[lang];return <section className="questionnaire-info"><span className="premium-badge">{c.free}</span><h3>{c.title}</h3><p>{c.pitch}</p><p>{entryModeCopy[lang].scope}</p><details><summary>{c.title} · {c.free}</summary><p>{quickFlowCopy[lang].guide}</p><p>{reviewEntryCopy[lang].guide}</p><p>{qrScanCopy[lang].guide}</p><p>{documentFirstCopy[lang].guide}</p><p>{synthesisCopy[lang].guide}</p><p>{pdfAccessCopy[lang].guide}</p><p>{pdfAccessCopy[lang].cached}</p><p>{sharingCopy[lang].guide}</p><p>{onboardingCopy[lang].guide}</p><p>{experienceCopy[lang].guide}</p><p>{vehicleBrands.length} {brandCopy[lang]}</p><p>{suggestionsCopy[lang].guide}</p><p>{c.hint}</p><p>{c.resume}</p><p>{c.scope}</p><p>{c.save}</p><p>{c.premium}</p></details></section>}
