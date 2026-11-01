/** Decorative scenes: the adjacent localized heading and copy carry all information. */
export function JourneyIllustration({step}:{step:number}) {
  return <div className="journey-art" aria-hidden="true"><svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
    <ellipse cx="120" cy="140" rx="92" ry="9" fill="#dce9f8"/>
    <circle cx="120" cy="76" r="65" fill="#edf5ff"/>
    {step===0&&<>
      <g stroke="#17385e" strokeWidth="3" strokeLinejoin="round"><path d="m51 94 12-29h64l17 29" fill="#b4d8ff"/><rect x="43" y="91" width="112" height="34" rx="9" fill="#fff"/><path d="M72 69h46l10 20H63z" fill="#e6f5ff"/><circle cx="64" cy="125" r="10" fill="#17385e"/><circle cx="135" cy="125" r="10" fill="#17385e"/><path d="M52 102h15m65 0h14" stroke="#3686e8"/></g>
      <g className="journey-float"><rect x="151" y="29" width="51" height="89" rx="10" fill="#fff" stroke="#17385e" strokeWidth="3"/><rect x="157" y="42" width="39" height="56" rx="4" fill="#dcecff"/><path d="M163 55v-6h7m19 6v-6h-7m-19 35v7h7m19-7v7h-7" stroke="#2476ed" strokeWidth="2"/><circle cx="176" cy="106" r="4" fill="#2476ed"/><circle className="journey-pulse" cx="176" cy="70" r="11" stroke="#2476ed" strokeWidth="3"/></g>
    </>}
    {step===1&&<>
      {[36,143].map((x,i)=><g key={x} className={i?'journey-float':'journey-float-alt'}><rect x={x} y="33" width="61" height="99" rx="10" fill="#fff" stroke="#17385e" strokeWidth="3"/><circle cx={x+30} cy="61" r="15" fill={i?'#ffdda0':'#bfdaff'}/><text x={x+30} y="67" textAnchor="middle" fill="#17385e" fontSize="18" fontWeight="700">{i?'B':'A'}</text><path d={`M${x+12} 88h36m-36 12h28m-28 12h32`} stroke="#8aadd4" strokeWidth="3" strokeLinecap="round"/></g>)}
      <path d="M103 76h32m-7-7 8 7-8 7M136 98h-32m7-7-8 7 8 7" stroke="#2476ed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </>}
    {step===2&&<>
      <rect x="77" y="29" width="88" height="109" rx="10" fill="#fff" stroke="#17385e" strokeWidth="3"/><path d="M96 59h49M96 74h37M96 89h49M96 104h30" stroke="#a0bedf" strokeWidth="4" strokeLinecap="round"/>
      <g className="journey-float"><rect x="23" y="37" width="65" height="36" rx="12" fill="#2476ed"/><text x="55" y="61" textAnchor="middle" fill="white" fontSize="16" fontWeight="700">FR · EN</text></g>
      <g className="journey-float-alt"><rect x="145" y="89" width="72" height="36" rx="12" fill="#d0e8ff" stroke="#8fbdf0"/><text x="181" y="113" textAnchor="middle" fill="#17385e" fontSize="16" fontWeight="700">DE · NL</text></g>
    </>}
    {step===3&&<>
      <rect x="41" y="31" width="147" height="102" rx="12" fill="#fff" stroke="#17385e" strokeWidth="3"/><path d="M53 86h122M113 43v78" stroke="#d6e4f3" strokeWidth="17"/><path d="M53 86h122M113 43v78" stroke="#fff" strokeWidth="2" strokeDasharray="6 6"/><rect x="75" y="78" width="25" height="14" rx="4" fill="#2476ed"/><rect x="106" y="49" width="14" height="25" rx="4" fill="#e6ab4e"/><path className="journey-draw" d="M64 111h36q30 0 30-30V56" stroke="#2476ed" strokeWidth="3" strokeLinecap="round" strokeDasharray="130"/><g className="journey-float" fill="#2476ed" stroke="#fff" strokeWidth="2"><path d="m184 18 6 15 15 6-15 6-6 15-6-15-15-6 15-6z"/><path d="m207 62 3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/></g>
    </>}
    {step===4&&<>
      <path d="M67 23h73l30 30v77a7 7 0 0 1-7 7H67a7 7 0 0 1-7-7V30a7 7 0 0 1 7-7Z" fill="#fff" stroke="#17385e" strokeWidth="3"/><path d="M140 24v29h29" stroke="#17385e" strokeWidth="3"/><rect x="76" y="61" width="55" height="25" rx="6" fill="#dcecff"/><text x="103" y="79" textAnchor="middle" fill="#174f9d" fontSize="15" fontWeight="700">PDF</text><path d="M78 100h44m-44 12h33" stroke="#a0bedf" strokeWidth="3" strokeLinecap="round"/><g className="journey-float"><circle cx="173" cy="111" r="25" fill="#2476ed"/><path d="M173 95v24m-9-9 9 9 9-9m-21 16h24" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></g>
    </>}
  </svg></div>;
}
