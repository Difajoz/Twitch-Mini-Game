// Extend the existing editorial score with an evolving 10-second preview passage.
// All tones are original synthesis. No repeated audio loop or external samples.
const fs=require('fs');
const original=fs.readFileSync('public/score-v4.wav');
const sr=48000, insert=10, split=Math.round(200/30*sr), count=insert*sr;
const bed=[new Float64Array(count),new Float64Array(count)];
let seed=39231;
const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
function event(start,len,fn,pan=0){for(let j=0;j<len*sr;j++){const i=Math.round(start*sr)+j;if(i>=count)break;const v=fn(j/sr,len);bed[0][i]+=v*Math.sqrt((1-pan)/2);bed[1][i]+=v*Math.sqrt((1+pan)/2);}}
const chords=[[0,[146.83,174.61,220]],[2.8,[130.81,164.81,196]],[5.5,[116.54,146.83,174.61]],[7.8,[130.81,174.61,220]]];
chords.forEach(([t,notes])=>notes.forEach((h,k)=>event(t,2.7,(x,d)=>.055*Math.min(1,x/.28)*Math.min(1,(d-x)/.65)*(Math.sin(2*Math.PI*h*x)+.17*Math.sin(2*Math.PI*(2*h+.35)*x)),(k-1)*.55)));
[.2,1.45,2.9,4.15,5.7,6.5,8.1,9.2].forEach((t,i)=>event(t,.35,x=>.17*Math.sin(2*Math.PI*(47*x+1.5*(1-Math.exp(-x*35))))*Math.exp(-x*18),-.1));
[.8,2.05,3.5,4.8,6.3,8.7].forEach(t=>event(t,.13,x=>.042*noise()*Math.exp(-x*40),.2));
[[.55,440],[1.9,523.25],[3.2,392],[4.45,329.63],[6.05,349.23],[7.25,293.66],[8.5,440]].forEach(([t,h],i)=>event(t,.7,x=>.06*Math.sin(2*Math.PI*h*x)*Math.exp(-x*6),Math.sin(i)*.6));
event(9.2,.8,(x,d)=>.04*noise()*Math.sin(Math.PI*x/d)*x/d,-.4);
const oldCount=(original.length-44)/4, total=oldCount+count;
const out=Buffer.alloc(44+total*4);original.copy(out,0,0,44);out.writeUInt32LE(36+total*4,4);out.writeUInt32LE(total*4,40);
for(let i=0;i<total;i++)for(let c=0;c<2;c++){
  let value;
  if(i<split)value=original.readInt16LE(44+i*4+c*2)/32768*Math.min(1,(split-i)/(sr*.025));
  else if(i<split+count){const n=i-split;value=Math.tanh(bed[c][n])*Math.min(1,n/(sr*.03),(count-n)/(sr*.06));}
  else {const n=i-count;value=original.readInt16LE(44+n*4+c*2)/32768*Math.min(1,(i-split-count)/(sr*.025));}
  out.writeInt16LE(Math.round(Math.max(-.98,Math.min(.98,value))*32767),44+i*4+c*2);
}
fs.writeFileSync('public/score-v5.wav',out);
console.log({seconds:total/sr,insertedSeconds:10,sampleRate:sr});
