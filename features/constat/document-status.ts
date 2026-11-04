export type DocumentFacts={prepared:boolean;signedA?:boolean;signedB?:boolean;ready?:boolean;stale?:boolean;unsigned?:boolean};
export type DocumentState='draft'|'unsigned'|'review'|'partial'|'assembling'|'signed'|'historical';
// Display facts only. This never grants a right to sign, generate or transmit.
export function documentState(facts:DocumentFacts):DocumentState{
 if(facts.stale)return 'historical';
 if(!facts.prepared)return 'draft';
 if(facts.unsigned)return 'unsigned';
 if(facts.signedA&&facts.signedB)return facts.ready?'signed':'assembling';
 if(facts.signedA||facts.signedB)return 'partial';
 return 'review';
}
