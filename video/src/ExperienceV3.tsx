import {useCurrentFrame,interpolate} from 'remotion';
import {Scene,Big,Word,Art,Label,TestCredit,violet} from './V3Design';
import {ease} from './Design';
import {Engine} from './Engine';
export const ExperienceV3=({beat=0}:{beat?:number})=>{const f=useCurrentFrame()*3;
if(beat===0)return <Scene><div style={{position:'absolute',left:95,top:170}}><Label>ONE SCREEN / TWO WAYS TO ENJOY IT</Label><Big style={{marginTop:45,fontSize:145}}><Word>Your stream</Word><br/><Word delay={16}>Your game</Word><br/><Word delay={36} style={{color:violet}}>Together</Word></Big></div><Art name="watch-flat" style={{right:75,top:210,width:760,height:600}}/><TestCredit/></Scene>;
if(beat===1)return <Scene><Art name="drawer-flat" style={{left:100,top:135,width:570,height:750}}/><div style={{position:'absolute',left:825,top:230,width:1000}}><Label>THE MINI GAMES SIDEBAR</Label><Big style={{marginTop:38}}><Word>A little</Word><br/><Word delay={10} style={{color:violet}}>play</Word></Big><div style={{marginTop:34,fontSize:55,fontWeight:600,lineHeight:1.2,letterSpacing:-2}}><Word delay={30}>Without leaving</Word><br/><Word delay={38}>the stream</Word></div></div><div style={{position:'absolute',left:450,top:110,padding:'15px 22px',borderRadius:16,background:violet,color:'white',fontSize:28,fontWeight:700,rotate:'6deg',translate:`0 ${interpolate(f,[0,45],[100,0],ease)}px`}}>Pick / Play / Repeat</div><TestCredit/></Scene>;
return <Scene dark><div style={{position:'absolute',left:95,top:170,width:1030,zIndex:2}}><Label style={{color:'#ba91f5'}}>LESS SWITCHING / MORE ENJOYING</Label><Big style={{marginTop:42,fontSize:136}}><Word>More ways</Word><br/><Word delay={12}>to enjoy</Word></Big><div style={{display:'inline-block',marginTop:35,background:violet,borderRadius:20,padding:'15px 30px',fontSize:77,fontWeight:700,letterSpacing:-3,rotate:`${interpolate(f,[20,60],[-5,-2],ease)}deg`,opacity:interpolate(f,[20,40],[0,1],ease)}}>the same stream</div></div><div style={{position:'absolute',right:90,top:150,width:620,height:730,overflow:'hidden',borderRadius:25,border:'1px solid #ffffff30',rotate:'3deg'}}><Engine kind="skyline" offsetFrames={60}/><div style={{position:'absolute',bottom:0,left:0,right:0,padding:20,background:'#141019e6',fontSize:23,textAlign:'center'}}>Skyline Sprint · Actual game engine</div></div><TestCredit dark/></Scene>;
};



