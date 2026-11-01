// Preserve the real timing of screenshots captured through the browser UI.
const fs = require('fs');
const directory=process.argv[2] || 'cozy-imhaliya';
const base='public/capture/'+directory;
const frames = JSON.parse(fs.readFileSync(base+'/frames.json','utf8'));
const lines = ['ffconcat version 1.0'];
frames.forEach((frame, i) => {
  const name=frame.file.split('/').at(-1).replace('.png','.jpg');
  if(frame.file.endsWith('.png'))fs.copyFileSync('public/'+frame.file,base+'/'+name);
  lines.push(`file '${name}'`);
  lines.push(`duration ${((frames[i + 1]?.t ?? 14) - frame.t).toFixed(6)}`);
});
lines.push(`file '${frames.at(-1).file.split('/').at(-1).replace('.png','.jpg')}'`);
fs.writeFileSync(base+'/capture.ffconcat', lines.join('\n'));
console.log({frames: frames.length, startDistance: frames[0].d, endDistance: frames.at(-1).d});
