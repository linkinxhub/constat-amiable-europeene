/** Decorative desktop-only artwork. No report data, status or new product claim. */
export function DesktopHeroArt(){
 return <div className="desktop-hero-art" aria-hidden="true">
  <svg viewBox="0 0 640 260" fill="none" focusable="false" xmlns="http://www.w3.org/2000/svg">
   <defs>
    <linearGradient id="hero-art-wash" x1="70" y1="40" x2="570" y2="240" gradientUnits="userSpaceOnUse"><stop stopColor="#e4f1ed"/><stop offset="1" stopColor="#f4f7f2"/></linearGradient>
    <linearGradient id="hero-art-paper" x1="270" y1="40" x2="390" y2="224" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="#f4faf8"/></linearGradient>
    <linearGradient id="hero-art-road" x1="94" y1="220" x2="542" y2="166" gradientUnits="userSpaceOnUse"><stop stopColor="#91b9ad" stopOpacity=".15"/><stop offset=".5" stopColor="#88afa5" stopOpacity=".6"/><stop offset="1" stopColor="#b5cfd0" stopOpacity=".15"/></linearGradient>
   </defs>
   <ellipse cx="325" cy="145" rx="252" ry="104" fill="url(#hero-art-wash)"/>
   <circle cx="489" cy="64" r="22" fill="#f2e7c6" opacity=".8"/>
   <circle cx="139" cy="61" r="6" fill="#c9dfd7"/>
   <circle cx="552" cy="131" r="4" fill="#9ac6bc"/>
   <path d="M61 208C157 244 179 126 271 164S382 249 452 201S543 142 588 170" stroke="url(#hero-art-road)" strokeWidth="24" strokeLinecap="round"/>
   <path d="M61 208C157 244 179 126 271 164S382 249 452 201S543 142 588 170" stroke="#fbfcfa" strokeWidth="2" strokeDasharray="9 10" strokeLinecap="round"/>
   <path d="M191 110C222 110 221 97 252 97M404 145C432 145 436 120 460 120" stroke="#4a998b" strokeWidth="1.5" strokeDasharray="4 6"/>
   <g transform="rotate(-7 318 130)">
    <rect x="252" y="33" width="161" height="197" rx="17" fill="#244d49" fillOpacity=".07"/>
    <rect x="245" y="25" width="161" height="197" rx="17" fill="url(#hero-art-paper)" stroke="#c4d9d3" strokeWidth="1.5"/>
    <rect x="265" y="47" width="30" height="30" rx="9" fill="#173b47"/>
    <path d="M280 53L288 56V62C288 67 284 70 280 72C276 70 272 67 272 62V56L280 53Z" stroke="#e7f3ee" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M276 62L279 65L284 59" stroke="#a5dbca" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M308 55H382M308 67H359" stroke="#9ebdb7" strokeWidth="4" strokeLinecap="round"/>
    <path d="M265 94H385" stroke="#dce8e3"/>
    <rect x="265" y="109" width="51" height="47" rx="9" fill="#e7f0f8"/>
    <rect x="332" y="109" width="51" height="47" rx="9" fill="#f6efd9"/>
    <path d="M277 124H304M277 134H297M344 124H371M344 134H364" stroke="#a8bdc5" strokeWidth="3" strokeLinecap="round"/>
    <path d="M265 174H382M265 187H350M265 200H371" stroke="#c5d8d1" strokeWidth="3.5" strokeLinecap="round"/>
   </g>
   <g transform="rotate(-9 173 105)">
    <rect x="115" y="75" width="114" height="62" rx="14" fill="#1b494a" fillOpacity=".06"/>
    <rect x="110" y="69" width="114" height="62" rx="14" fill="white" stroke="#d6e4e6"/>
    <rect x="122" y="81" width="36" height="36" rx="10" fill="#e7f0f8"/>
    <text x="140" y="105" fill="#28566a" textAnchor="middle" fontSize="21" fontWeight="700" fontFamily="Arial, sans-serif">A</text>
    <path d="M170 89H208M170 100H198M170 111H204" stroke="#adc4cd" strokeWidth="3" strokeLinecap="round"/>
   </g>
   <g transform="rotate(8 484 124)">
    <rect x="443" y="98" width="114" height="62" rx="14" fill="#1b494a" fillOpacity=".06"/>
    <rect x="438" y="92" width="114" height="62" rx="14" fill="white" stroke="#e5dfcf"/>
    <rect x="450" y="104" width="36" height="36" rx="10" fill="#f6efd9"/>
    <text x="468" y="128" fill="#766239" textAnchor="middle" fontSize="21" fontWeight="700" fontFamily="Arial, sans-serif">B</text>
    <path d="M498 112H536M498 123H526M498 134H532" stroke="#c8c5ad" strokeWidth="3" strokeLinecap="round"/>
   </g>
   <path d="M98 150V160M93 155H103M526 212V222M521 217H531" stroke="#79ac9f" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
 </div>;
}
