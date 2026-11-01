// Video synchronization edit of "Cat Walk" by Arulo (Mixkit #371).
// Four distinct source passages, all at 1x speed. No synthesis, looping or stretching.
// Licensed only as synchronized soundtrack; do not distribute this edit as music alone.
const fs=require('fs');
const input=fs.readFileSync('out/cat-walk-source.wav');
let pos=12,dataOffset=0,dataSize=0;
while(pos+8<input.length){const id=input.toString('ascii',pos,pos+4),size=input.readUInt32LE(pos+4);if(id==='data'){dataOffset=pos+8;dataSize=size;break;}pos+=8+size+size%2;}
if(!dataOffset)throw Error('Missing PCM data');
const sr=48000,duration=1291/30,frames=Math.round(duration*sr),sourceFrames=dataSize/4;
const channels=[new Float64Array(frames),new Float64Array(frames)];
const cuts=[
 {label:'Opening and feature scenes',at:0,end:425/30,source:12,gain:1},
 {label:'Live preview / breakdown',at:425/30,end:635/30,source:60,gain:1},
 {label:'Codex process',at:635/30,end:1051/30,source:28,gain:.8},
 {label:'Signature and closing credits',at:1051/30,end:1291/30,source:108,gain:.8},
];
const blend=.075;
for(let k=0;k<cuts.length;k++){
  const cut=cuts[k],start=Math.max(0,cut.at-blend),end=Math.min(duration,cut.end+blend);
  for(let i=Math.floor(start*sr);i<Math.ceil(end*sr);i++){
    const t=i/sr,sourceIndex=Math.round((cut.source+t-cut.at)*sr);
    if(sourceIndex<0||sourceIndex>=sourceFrames)continue;
    let gain=cut.gain;
    if(k>0)gain*=Math.sin(Math.max(0,Math.min(1,(t-(cut.at-blend))/(2*blend)))*Math.PI/2);
    if(k<cuts.length-1)gain*=Math.cos(Math.max(0,Math.min(1,(t-(cut.end-blend))/(2*blend)))*Math.PI/2);
    // A tiny clean entry and a natural release on the source's original ending.
    gain*=Math.min(1,t/.012,Math.max(0,(duration-t)/.28));
    for(let c=0;c<2;c++)channels[c][i]+=input.readInt16LE(dataOffset+sourceIndex*4+c*2)/32768*gain;
  }
}
let peak=0;for(let i=0;i<frames;i++)for(let c=0;c<2;c++)peak=Math.max(peak,Math.abs(channels[c][i]));
const trim=Math.min(1,.92/peak);
const output=Buffer.alloc(44+frames*4);
output.write('RIFF');output.writeUInt32LE(36+frames*4,4);output.write('WAVEfmt ',8);output.writeUInt32LE(16,16);output.writeUInt16LE(1,20);output.writeUInt16LE(2,22);output.writeUInt32LE(sr,24);output.writeUInt32LE(sr*4,28);output.writeUInt16LE(4,32);output.writeUInt16LE(16,34);output.write('data',36);output.writeUInt32LE(frames*4,40);
for(let i=0;i<frames;i++)for(let c=0;c<2;c++)output.writeInt16LE(Math.round(channels[c][i]*trim*32767),44+i*4+c*2);
fs.writeFileSync('out/cat-walk-premaster.wav',output);
fs.writeFileSync('source-audio/cat-walk-edit-map.json',JSON.stringify({title:'Cat Walk',artist:'Arulo',mixkitId:371,duration,sourcePlaybackRate:1,crossfadeSeconds:blend*2,cuts},null,2));
console.log({duration,sourcePeak:peak,trim,cuts});
