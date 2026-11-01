// Original 13 1/3-second stereo editorial sting. No external samples, no loop.
const fs=require('fs'); const sr=48000, duration=400/30, N=Math.round(sr*duration);
const L=new Float64Array(N),R=new Float64Array(N);let seed=82423;
const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
function event(start,len,fn,pan=0){const p=Math.max(-1,Math.min(1,pan)),a=Math.cos((p+1)*Math.PI/4),b=Math.sin((p+1)*Math.PI/4);for(let j=0;j<Math.round(len*sr);j++){let i=Math.round(start*sr)+j;if(i>=N)break;const t=j/sr,v=fn(t,len);L[i]+=v*a;R[i]+=v*b;}}
function kick(t){event(t,.35,x=>.55*Math.sin(2*Math.PI*(48*x+1.8*(1-Math.exp(-x*32))))*Math.exp(-x*16));}
function clap(t){event(t,.2,x=>.16*rnd()*(Math.exp(-x*42)+.5*Math.exp(-Math.abs(x-.025)*95)),-.08);}
function hat(t,v=.035,p=.3){let last=0;event(t,.07,x=>{const n=rnd(),hp=n-last;last=n;return v*hp*Math.exp(-x*75);},p);}
function bass(t,hz,len=.3){event(t,len,(x,d)=>.12*(Math.sin(2*Math.PI*hz*x)+.2*Math.sin(4*Math.PI*hz*x))*Math.min(1,x/.008)*Math.exp(-x*7)*(1-x/d),-.15);}
function chord(t,notes,len,level=.035){notes.forEach((hz,k)=>event(t,len,(x,d)=>{const env=Math.min(1,x/.08)*Math.min(1,(d-x)/.3);return level*env*(Math.sin(2*Math.PI*hz*x)+.25*Math.sin(2*Math.PI*(hz*2+.4)*x)+.12*Math.sin(2*Math.PI*(hz*3-.6)*x));},(k-1)*.45));}
function swell(t,len,level=.1){event(t,len,(x,d)=>level*rnd()*Math.pow(x/d,2)*Math.sin(Math.PI*x/d),-.5);}
function snap(t){event(t,.07,x=>.13*rnd()*Math.exp(-x*95),.3);}
// A rising introduction, then a varied groove, a break, a build and a final resolve.
chord(0,[146.832,174.614,220],1.6,.026);swell(.2,1.4,.07);
const beat=60/144;const kickBeats=[4,5.5,7,8,9.75,11,12,14,15.5];kickBeats.forEach(b=>kick(b*beat));
[5,7,9,11,13,15].forEach(b=>clap(b*beat));
[4,4.5,5.25,6,6.5,7.5,8,8.75,9.5,10,10.5,11.25,12,13,13.5,14.25,15.5].forEach((b,i)=>hat(b*beat,.022+(i%4)*.005,i%2?.5:-.5));
[[4,73.416],[5.5,73.416],[7,87.307],[8,58.27],[9.75,58.27],[11,65.406],[12,87.307],[14,65.406]].forEach(([b,h])=>bass(b*beat,h));
chord(1.667,[146.832,174.614,220],1.5);chord(3.333,[116.541,146.832,174.614],1.5);chord(5,[174.614,220,261.626],1.5);
// One evolving melodic phrase, not an ostinato.
[293.665,349.228,440,523.251,392,349.228,261.626].forEach((hz,i)=>event(1.95+i*.43,.55,x=>.045*Math.sin(2*Math.PI*hz*x)*Math.exp(-x*8),Math.sin(i)*.6));
[6.667,7.667,8.667,9.667].forEach((t,i)=>{snap(t);event(t,.4,x=>.06*Math.sin(2*Math.PI*(880+i*110)*x)*Math.exp(-x*14),i%2?.4:-.4);});
chord(6.667,[130.813,164.814,196],2.8,.025);swell(9.45,1.5,.1);
[9.8,10.1,10.3,10.45,10.58,10.69,10.79,10.87].forEach((t,i)=>hat(t,.025+i*.004,(i%2?1:-1)*.3));
kick(11);clap(11);chord(11,[174.614,220,261.626],2.333,.055);
event(11,1.6,x=>.08*Math.sin(2*Math.PI*1046.5*x)*Math.exp(-x*4),.4);
// Short cross-channel delays, then a final fade and a peak-normalized master.
for(let i=0;i<N;i++){if(i>sr*.17){L[i]+=.14*R[i-Math.round(sr*.17)];R[i]+=.12*L[i-Math.round(sr*.23)]||0;}}
let peak=0;for(let i=0;i<N;i++){const tail=Math.min(1,(duration-i/sr)/.35);L[i]=Math.tanh(L[i]*1.3)*tail;R[i]=Math.tanh(R[i]*1.3)*tail;peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));}
const out=Buffer.alloc(44+N*4);out.write('RIFF');out.writeUInt32LE(36+N*4,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);out.writeUInt32LE(sr,24);out.writeUInt32LE(sr*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(N*4,40);
for(let i=0;i<N;i++){out.writeInt16LE(Math.round(L[i]/peak*.88*32767),44+i*4);out.writeInt16LE(Math.round(R[i]/peak*.88*32767),46+i*4);}fs.writeFileSync('public/score-v4.wav',out);console.log(JSON.stringify({duration,channels:2,sampleRate:sr,peakBeforeNormalize:peak,peakAfterNormalize:.88}));
