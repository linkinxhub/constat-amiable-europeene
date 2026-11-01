// Wrap at words, splitting only a token that cannot fit on an empty line.
// The caller supplies the actual embedded font's measurement.
export function pdfTextLines(text:string,width:number,measure:(text:string)=>number){
 const output:string[]=[];
 const clean=text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/\t/g,' ');
 for(const paragraph of clean.split('\n')){
  let line='';
  for(const word of paragraph.trim().split(/\s+/).filter(Boolean)){
   const candidate=line?line+' '+word:word;
   if(measure(candidate)<=width){line=candidate;continue;}
   if(line){output.push(line);line='';}
   for(const char of word){
    if(line&&measure(line+char)>width){output.push(line);line='';}
    line+=char;
   }
  }
  output.push(line);
 }
 return output;
}
