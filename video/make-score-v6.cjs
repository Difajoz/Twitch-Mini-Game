// Preserve the approved score through the process scenes; extend with a six-second coda.
const fs=require('fs'),sr=48000,duration=28,N=sr*duration;
const prior=fs.readFileSync('public/score-v5.wav');
const channels=[new Float64Array(N),new Float64Array(N)];
for(let i=0;i<22*sr;i++)for(let c=0;c<2;c++)channels[c][i]=prior.readInt16LE(44+i*4+c*2)/32768*Math.min(1,(22*sr-i)/(.06*sr));
let seed=26246;const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
function event(at,len,fn,pan=0){for(let j=0;j<len*sr;j++){const i=Math.round(at*sr)+j;if(i>=N)break;let v=fn(j/sr,len);channels[0][i]+=v*Math.sqrt((1-pan)/2);channels[1][i]+=v*Math.sqrt((1+pan)/2);}}
function chord(at,notes,len,vol){notes.forEach((hz,k)=>event(at,len,(t,d)=>vol*Math.min(1,t/.025)*Math.min(1,(d-t)/.6)*(Math.sin(2*Math.PI*hz*t)+.15*Math.sin(2*Math.PI*(2*hz+.3)*t)),(k-1)*.5));}
chord(22,[130.81,164.81,196],1.85,.055);
event(22,.65,t=>.11*Math.sin(2*Math.PI*(76*t+1.8*(1-Math.exp(-t*25))))*Math.exp(-t*9));
event(22,.7,t=>.06*Math.sin(2*Math.PI*783.99*t)*Math.exp(-t*5),.4);
event(23.35,.65,(t,d)=>.04*noise()*(t/d)*Math.sin(Math.PI*t/d),-.4);
chord(24,[146.83,174.61,220],4,.075);
event(24,.6,t=>.15*Math.sin(2*Math.PI*(48*t+1.8*(1-Math.exp(-t*28))))*Math.exp(-t*10));
[[24,587.33],[25.15,440],[26.3,587.33]].forEach(([at,h],i)=>event(at,1.1,t=>.045*Math.sin(2*Math.PI*h*t)*Math.exp(-t*4),i%2?.35:-.35));
// Tiny, distinct morph cues support the pad reveal and the return to Twitch.
event(25.05,.28,(t,d)=>.022*noise()*Math.sin(Math.PI*t/d),-.5);
event(26.45,.35,(t,d)=>.02*noise()*Math.sin(Math.PI*t/d),.5);
const out=Buffer.alloc(44+N*4);prior.copy(out,0,0,44);out.writeUInt32LE(36+N*4,4);out.writeUInt32LE(N*4,40);
let peak=0;for(let i=0;i<N;i++)for(let c=0;c<2;c++){let v=channels[c][i]*Math.min(1,(N-i)/(.35*sr));peak=Math.max(peak,Math.abs(v));out.writeInt16LE(Math.round(Math.max(-.98,Math.min(.98,v))*32767),44+i*4+c*2);}
fs.writeFileSync('public/score-v6.wav',out);console.log({duration,sampleRate:sr,peak});
