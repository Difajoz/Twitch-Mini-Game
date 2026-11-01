// Browser screenshots are JPEG bytes; give the opening capture matching extensions.
const fs=require('fs');
const manifest='src/clean-frames.json';
const frames=JSON.parse(fs.readFileSync(manifest,'utf8'));
let corrected=0;
for(const frame of frames){
  const source='public/'+frame.file;
  const bytes=fs.readFileSync(source);
  if(frame.file.endsWith('.png')&&bytes[0]===0xff&&bytes[1]===0xd8){
    frame.file=frame.file.replace(/\.png$/,'.jpg');
    fs.writeFileSync('public/'+frame.file,bytes);corrected++;
  }
}
fs.writeFileSync(manifest,JSON.stringify(frames,null,2)+'\n');
console.log({corrected,frames:frames.length});
