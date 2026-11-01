export type ReviewEdit=(step:number,vehicle?:number,additional?:boolean)=>void;

// Called after React switches from review to the complete form. Never changes report data.
export function focusReviewEditor(step:number,vehicle?:number,additional=false){
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  const root=vehicle===undefined?document.getElementById(step===0?'common-fields':'review-witnesses'):document.querySelector<HTMLElement>(`[data-review-vehicle="${vehicle}"]`);
  if(!root)return;
  const section=additional?root.querySelector<HTMLElement>('.form-details'):step===2?root.querySelector<HTMLElement>('.standard-circumstances'):root;
  const target=section||root;
  let parent:HTMLElement|null=target;
  while(parent){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement;}
  if(additional)target.querySelectorAll('details').forEach(details=>{details.open=true});
  const input=target.querySelector<HTMLElement>('input:not([type="hidden"]):not(:disabled),textarea:not(:disabled),select:not(:disabled),button:not(:disabled),[tabindex="0"]');
  (input||target).scrollIntoView({behavior:'auto',block:'center'});
  if(input)input.focus({preventScroll:true});else {target.tabIndex=-1;target.focus({preventScroll:true});}
 }));
}
