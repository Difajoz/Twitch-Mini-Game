import {AbsoluteFill,Img,staticFile,useCurrentFrame,useVideoConfig,interpolate} from 'remotion';
import run from './capture-frames.json';
import sky from './sky-frames.json';
import clean from './clean-frames.json';
import {ease} from './Design';

const BG='#0b0a10';
export const Badge=()=> <div style={{display:'flex',alignItems:'center',gap:16,fontSize:27,fontWeight:600,color:'#f8f6ff'}}><Img src={staticFile('capture/codex-icon.png')} style={{width:42,height:42,objectFit:'contain'}}/>Made with Codex</div>;
export const Base=({children}:{children:React.ReactNode})=><AbsoluteFill style={{background:BG,color:'#fff',fontFamily:'Arial, Helvetica, sans-serif',overflow:'hidden'}}><div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 20%,#6b37ad22,transparent 70%)'}}/>{children}</AbsoluteFill>;
const sourceAt=(frames:typeof run,t:number)=>{let index=0;for(let i=0;i<frames.length;i++){if(frames[i].t>t)break;index=i;}return frames[index].file;};

export const Feature=({beat=0}:{beat?:number})=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;
 const captions=['Watching a stream?','Meet Mini games.','A quick game. Right beside your stream.','Switch it up. Keep watching.','Your stream still comes first.'];
 const src=beat===0?'capture/closed.png':beat===1?(t<1.3?'capture/closed.png':'capture/open.png'):beat===2?sourceAt(clean,t+2):beat===3?sourceAt(sky,t):'capture/paused.png';
 return <Base>
  <div style={{position:'absolute',left:90,top:43,fontSize:44,fontWeight:700,letterSpacing:-1,opacity:interpolate(f,[0,10],[0,1],ease)}}>{beat===0&&t>=2?'Add a little play.':captions[beat]}</div>
  <div style={{position:'absolute',left:190,top:135,width:1540,height:810,perspective:1800}}><div style={{position:'absolute',inset:0,overflow:'hidden',borderRadius:18,border:'1px solid #ffffff33',boxShadow:'0 25px 90px #000b',transform:beat===0?`rotateX(${interpolate(f,[0,100],[5,0],ease)}deg)`:undefined,scale:interpolate(f,[0,60],[beat===0?1.09:1.015,1],ease)}}>
   <Img src={staticFile(src)} style={{position:'absolute',top:0,left:0,width:1540,maxWidth:'none'}}/>
   {beat===1&&t>=1.3&&t<2.5?<div style={{position:'absolute',right:4,top:75,width:500,height:700,border:'3px solid #a970ff',borderRadius:8,opacity:interpolate(f,[1.3*fps,2.5*fps],[.9,0],ease)}}/>:null}
  </div></div>
  {beat>0?<div style={{position:'absolute',bottom:49,left:0,right:0,textAlign:'center',fontSize:28,color:'#d0bcf7'}}>Preview Test Games made with Codex</div>:<div style={{position:'absolute',bottom:50,left:90,fontSize:24,color:'#a993cb'}}>TWITCH + MINI GAMES</div>}
 </Base>;
};

export const Process=({step=0}:{step?:number})=>{
 const f=useCurrentFrame();const titles=['Developing the idea','Planning the build','Writing the code','Creating this demo'];
 const assets=['codex-idea.png','codex-plan.png','codex-code.png','codex-video.png'];
 return <Base><div style={{position:'absolute',left:90,top:40}}><Badge/></div><div style={{position:'absolute',right:90,top:46,fontSize:28,color:'#c4a5f8'}}>{String(step+1).padStart(2,'0')} / {titles[step]}</div>
 <div style={{position:'absolute',left:185,top:130,width:1550,height:830,overflow:'hidden',borderRadius:18,border:'1px solid #ffffff2b',boxShadow:'0 30px 90px #000b',scale:interpolate(f,[0,110],[1,1.025],ease)}}><Img src={staticFile('capture/'+assets[step])} style={{width:1550,maxWidth:'none'}}/>
 {/* Mask unrelated chats while retaining the actual Codex application chrome. */}<div style={{position:'absolute',left:0,top:295,width:273,bottom:0,background:'#161d29'}}/>
 </div><div style={{position:'absolute',bottom:42,left:0,right:0,textAlign:'center',fontSize:27,color:'#c5b4de'}}>{step===3?'Codex + Remotion':'From the first idea to the finished feature.'}</div></Base>;
};

export const Finale=()=>{const f=useCurrentFrame();return <Base><div style={{position:'absolute',left:90,right:90,top:40,fontSize:49,fontWeight:700,letterSpacing:-1}}>Your stream. <span style={{color:'#b18aff'}}>A little more play.</span></div>
 <div style={{position:'absolute',left:260,top:125,width:1400,height:705,overflow:'hidden',borderRadius:18,border:'1px solid #ffffff33',scale:interpolate(f,[0,119],[1.025,1],ease)}}><Img src={staticFile(sourceAt(clean,6+f/30))} style={{width:1400,maxWidth:'none'}}/></div>
 <div style={{position:'absolute',bottom:69,left:0,right:0,textAlign:'center',fontSize:34,lineHeight:1.55}}><div>Made for Codex x TwitchCon Hackathon</div><div style={{fontSize:31,color:'#bb98f4'}}>, by Silicon</div></div></Base>;};

