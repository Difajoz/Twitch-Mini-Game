import {Img,staticFile,useCurrentFrame,useVideoConfig,interpolate} from 'remotion';
import clean from './clean-frames.json';
import {ease} from './Design';
import {Scene,Big,Word,Label,TestCredit} from './V3Design';
export const IntroV3=()=>{const f=useCurrentFrame()*3;const {fps}=useVideoConfig();const t=2+useCurrentFrame()/fps;let index=0;for(let i=0;i<clean.length;i++){if(clean[i].t>t)break;index=i;}
return <Scene dark><Label style={{position:'absolute',left:95,top:93,color:'#b88af9'}}>TWITCH + MINI GAMES</Label><div style={{position:'absolute',left:95,top:265,width:850}}><Big><Word>Watching</Word><br/><Word delay={7}>a stream?</Word></Big><div style={{marginTop:42,fontSize:61,letterSpacing:-2,color:'#bc91fa'}}><Word delay={50}>Add a little play</Word></div></div>
<div style={{position:'absolute',right:75,top:220,width:810,height:570,perspective:1600}}><div style={{position:'absolute',inset:0,borderRadius:23,overflow:'hidden',border:'1px solid #ffffff40',boxShadow:'0 40px 100px #0009',transform:`rotateY(${interpolate(f,[0,80],[-12,-3],ease)}deg) rotateZ(-2deg)`,scale:interpolate(f,[0,90],[.86,1],ease)}}><Img src={staticFile(clean[index].file)} style={{width:810,maxWidth:'none'}}/></div><div style={{position:'absolute',right:15,bottom:-45,padding:'15px 23px',borderRadius:14,background:'#9b5deb',fontSize:26,fontWeight:700,rotate:'-3deg',scale:interpolate(f,[45,65],[0,1],ease)}}>Stream stays / Game opens</div></div><TestCredit dark/></Scene>;};

