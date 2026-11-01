const fs=require('fs');
let source=fs.readFileSync('edit-professional-score.cjs','utf8');
source=source.replace('"Close Up" by Michael Ramir C. (Mixkit #1167)','"Cat Walk" by Arulo (Mixkit #371)')
 .replace('out/close-up-source.wav','out/cat-walk-source.wav').replace('duration=858/30','duration=1291/30')
 .replace(/const cuts=\[[\s\S]*?\n\];/,`const cuts=[
 {label:'Opening and feature scenes',at:0,end:425/30,source:12,gain:1},
 {label:'Live preview / breakdown',at:425/30,end:635/30,source:60,gain:1},
 {label:'Codex process',at:635/30,end:1051/30,source:28,gain:.8},
 {label:'Signature and closing credits',at:1051/30,end:1291/30,source:108,gain:.8},
];`)
 .replaceAll('professional-score-premaster.wav','cat-walk-premaster.wav').replaceAll('close-up-edit-map.json','cat-walk-edit-map.json')
 .replace("title:'Close Up',artist:'Michael Ramir C.',mixkitId:1167","title:'Cat Walk',artist:'Arulo',mixkitId:371");
fs.writeFileSync('edit-cat-walk.cjs',source);
