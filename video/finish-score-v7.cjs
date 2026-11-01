// Apply tiny fades at the retimed edit seams before loudness normalization.
const fs=require('fs');
const source=fs.readFileSync('out/score-v7-retimed.wav');
let pos=12,dataOffset=0,dataSize=0;
while(pos+8<=source.length){const name=source.toString('ascii',pos,pos+4),size=source.readUInt32LE(pos+4);if(name==='data'){dataOffset=pos+8;dataSize=size;break;}pos+=8+size+(size%2);}
if(!dataOffset)throw new Error('WAV data chunk missing');
const sampleRate=48000,frames=dataSize/4;
const out=Buffer.alloc(44+dataSize);
out.write('RIFF');out.writeUInt32LE(36+dataSize,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);out.writeUInt32LE(sampleRate,24);out.writeUInt32LE(sampleRate*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(dataSize,40);
const seams=[260/30,470/30,678/30];
for(let i=0;i<frames;i++){const t=i/sampleRate;let gain=1;for(const seam of seams)gain=Math.min(gain,Math.abs(t-seam)/.008);for(let c=0;c<2;c++)out.writeInt16LE(Math.round(source.readInt16LE(dataOffset+i*4+c*2)*gain),44+i*4+c*2);}
fs.writeFileSync('out/score-v7-seamed.wav',out);console.log({seconds:frames/sampleRate,seams});
