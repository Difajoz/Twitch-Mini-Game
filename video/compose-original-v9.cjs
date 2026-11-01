// Original through-composed product-film cue. No stock audio or earlier score reused.
const fs=require('fs'),sr=48000,duration=35.6,N=Math.round(sr*duration),TAU=2*Math.PI;
const L=new Float64Array(N),R=new Float64Array(N),sendL=new Float64Array(N),sendR=new Float64Array(N),duck=new Float64Array(N);
let seed=739183;const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
const hz=n=>440*2**((n-69)/12);
function sound(at,len,fn,level=1,pan=0,wet=.15,sidechain=false){const start=Math.round(at*sr),steps=Math.round(len*sr),a=Math.sqrt((1-pan)/2),b=Math.sqrt((1+pan)/2);for(let j=0;j<steps;j++){const i=start+j;if(i<0||i>=N)continue;let v=fn(j/sr,len,j)*level;if(sidechain)v*=1-.43*duck[i];L[i]+=v*a;R[i]+=v*b;sendL[i]+=v*a*wet;sendR[i]+=v*b*wet;}}
function kick(at,level=.4){const start=Math.round(at*sr);for(let j=0;j<.28*sr&&start+j<N;j++)duck[start+j]=Math.max(duck[start+j],Math.exp(-j/sr*16));sound(at,.38,t=>(Math.sin(TAU*(43*t+1.7*(1-Math.exp(-t*38))))*Math.exp(-t*15)+.1*noise()*Math.exp(-t*170)),level,0,.025);}
function snare(at,level=.12,pan=.04){let lp=0; sound(at,.21,t=>{const n=noise();lp+=.2*(n-lp);return .65*(n-lp)*Math.exp(-t*28)+.35*Math.sin(TAU*183*t)*Math.exp(-t*33);},level,pan,.1);}
function hat(at,level=.025,pan=.4,open=false){let lp=0; sound(at,open?.23:.065,t=>{let n=noise();lp+=.45*(n-lp);return(n-lp)*Math.exp(-t*(open?20:90));},level,pan,.03);}
function bass(at,n,len=.35,level=.13){const h=hz(n);sound(at,len,(t,d)=>{const env=Math.min(1,t/.009)*Math.min(1,(d-t)/.08);return env*(Math.sin(TAU*h*t)+.26*Math.sin(TAU*2*h*t)+.09*Math.sin(TAU*3*h*t))*Math.exp(-t*1.8);},level,-.04,.02,true);}
function keys(at,notes,len=1.4,level=.055){notes.forEach((n,k)=>{const h=hz(n);sound(at+k*.012,len,(t,d)=>{const env=(1-Math.exp(-t*160))*Math.exp(-t*2.9)*Math.min(1,(d-t)/.18);return env*(Math.sin(TAU*h*t+1.1*Math.exp(-t*6)*Math.sin(TAU*2*h*t))+.16*Math.sin(TAU*h*2.002*t));},level,(k/(notes.length-1||1)-.5)*.9,.34,true);});}
function pad(at,notes,len,level=.024){notes.forEach((n,k)=>{const h=hz(n),phase=k*.8;sound(at,len,(t,d)=>{const env=Math.min(1,t/.45)*Math.min(1,(d-t)/.65);return env*(Math.sin(TAU*h*t+phase)+.45*Math.sin(TAU*(h*1.003)*t-phase)+.16*Math.sin(TAU*h*2*t)+.05*Math.sin(TAU*h*3*t))*(.92+.08*Math.sin(t*1.3+phase));},level,(k/(notes.length-1||1)-.5)*1.3,.4,true);});}
function air(at,len,level=.035,reverse=false){let lp=0;sound(at,len,(t,d)=>{lp+=.08*(noise()-lp);const u=t/d;return lp*Math.sin(Math.PI*u)*(reverse?u*u:(1-u)**2);},level,-.3,.4);}
// Every phrase has different percussion, bass placements and voicing.
const beat=60/128;
const phrases=[
 {at:0,notes:[54,61,64,68],root:30,len:2.1667,mode:'intro'},
 {at:2.1667,notes:[50,57,61,64],root:26,len:2.1667,mode:'groove'},
 {at:4.3333,notes:[49,56,59,64],root:25,len:2.1667,mode:'groove'},
 {at:6.5,notes:[52,59,61,66],root:28,len:4,mode:'browse'},
 {at:10.5,notes:[54,61,64,69],root:30,len:2.1667,mode:'groove'},
 {at:12.6667,notes:[50,57,61,66],root:26,len:3,mode:'space'},
 {at:15.6667,notes:[57,61,64,68],root:33,len:3.5,mode:'preview'},
 {at:19.1667,notes:[52,59,63,66],root:28,len:3.5,mode:'preview'},
 {at:22.6667,notes:[47,54,57,61],root:23,len:2.6,mode:'build'},
 {at:25.2667,notes:[52,56,59,66],root:28,len:2.6,mode:'build'},
 {at:27.8667,notes:[49,56,59,64],root:25,len:1.7333,mode:'lift'},
 {at:29.6,notes:[54,61,64,68],root:30,len:2,mode:'signature'},
 {at:31.6,notes:[54,58,61,68],root:30,len:4,mode:'resolve'},
];
const kicks=[[0,1.5,3],[0,.75,2.5],[0,2,3.25],[0,1.5,3,4.75,6.5],[0,1.75,3],[0,3.5],[.5,4.5],[0,3.25,6],[0,1.5,3.5,4.5],[0,.75,2.5,4],[0,1.5,2.75],[0],[0]];
// Percussion pass first establishes sidechain envelopes for the tonal instruments.
phrases.forEach((p,i)=>{const quiet=['intro','space','preview','signature','resolve'].includes(p.mode);kicks[i].forEach(b=>{if(b*beat<p.len-.15)kick(p.at+b*beat,quiet?.25:.42);});if(!quiet){[1,3,5,7].filter(b=>b*beat<p.len-.12).forEach((b,j)=>snare(p.at+b*beat,.1+(i%3)*.012,j%2?-.08:.08));for(let b=.5;b*beat<p.len-.1;b+=.5){if((i+Math.round(b*2))%5===0)continue;hat(p.at+b*beat,.016+((i+Math.round(b*2))%3)*.006,b%1?.45:-.45,(i+Math.round(b*2))%9===0);}}else if(p.mode==='preview'){[1.5,3,5.5].forEach((b,j)=>hat(p.at+b*beat,.014,j%2?.4:-.4));}});
phrases.forEach((p,i)=>{const spacious=['space','preview','intro','resolve'].includes(p.mode);pad(p.at,p.notes,p.len+.4,spacious?.025:.016);keys(p.at+.05,p.notes,Math.min(2,p.len),spacious?.055:.065);if(!['signature','resolve'].includes(p.mode)){const offsets=spacious?[1.35]:[.75,2.5,3.5,5.75];offsets.forEach((b,j)=>{if(b*beat<p.len-.25){keys(p.at+b*beat,[p.notes[(i+j)%4]+12,p.notes[(i+j+2)%4]],.9,.028);bass(p.at+b*beat,p.root+(j===2?7:0),.28,spacious?.07:.12);}});}bass(p.at,p.root,spacious?1.2:.48,spacious?.09:.14);});
// A single, restrained melodic line evolves across the whole film rather than looping.
[[2.38,73],[3.25,76],[4.8,71],[6.85,73],[8.1,78],[9.5,76],[10.8,73],[13.1,69],[15.95,76],[18.2,73],[20.1,71],[22.95,73],[24.1,78],[25.8,76],[27.95,73],[29.65,80],[31.65,78]].forEach(([at,n],i)=>keys(at,[n],1.25,i<6?.022:.018));
air(0,1.4,.05);air(5.95,.55,.075,true);air(12.2,.45,.04,true);air(22.05,.62,.08,true);air(28.9,.7,.09,true);air(31.6,1.3,.04);
// Stereo room: multiple filtered reflections, kept behind the dry transients.
const taps=[[.061,.19],[.113,.15],[.179,.12],[.271,.09],[.397,.065],[.541,.045],[.739,.03]];
for(const [delay,gain] of taps){const offset=Math.round(delay*sr);let lowL=0,lowR=0;for(let i=offset;i<N;i++){lowL+=.23*(sendR[i-offset]-lowL);lowR+=.23*(sendL[i-offset]-lowR);L[i]+=lowL*gain;R[i]+=lowR*gain;}}
let peak=0;for(let i=0;i<N;i++){const fade=Math.min(1,i/(sr*.012),(N-i)/(sr*.65));L[i]=Math.tanh(L[i]*1.3)*fade;R[i]=Math.tanh(R[i]*1.3)*fade;peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));}
const out=Buffer.alloc(44+N*4);out.write('RIFF');out.writeUInt32LE(36+N*4,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);out.writeUInt32LE(sr,24);out.writeUInt32LE(sr*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(N*4,40);for(let i=0;i<N;i++){out.writeInt16LE(Math.round(L[i]/peak*.88*32767),44+i*4);out.writeInt16LE(Math.round(R[i]/peak*.88*32767),46+i*4);}fs.writeFileSync('out/original-v9-premaster.wav',out);fs.writeFileSync('out/original-v9-arrangement.json',JSON.stringify({duration,bpm:128,phrases,source:'Original deterministic synthesis; no imported audio'},null,2));console.log({duration,peak,phrases:phrases.length});
