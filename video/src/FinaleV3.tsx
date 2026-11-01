import {interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {Scene,Big,Word,Label,violet} from './V3Design';
import {ease} from './Design';
import {TwitchPlayMorph} from './TwitchPlayMorph';
export const FinaleV3=()=>{const f=useCurrentFrame();const {fps}=useVideoConfig();return <Scene>
<Label style={{position:'absolute',top:95,left:0,right:0,textAlign:'center'}}>WATCH / PLAY / ENJOY</Label>
<div style={{position:'absolute',top:240,left:0,right:0,textAlign:'center'}}><Big style={{fontSize:147,letterSpacing:-8}}><Word>Twitch</Word> <Word delay={7} style={{color:violet}}>Mini Games</Word></Big><div style={{fontSize:49,marginTop:40,letterSpacing:-1}}><Word delay={18}>Your stream with a little more fun</Word></div></div>
<div style={{position:'absolute',left:0,right:0,top:560,display:'flex',justifyContent:'center',opacity:interpolate(f,[.15*fps,.4*fps],[0,1],ease)}}><TwitchPlayMorph/></div>
<div style={{position:'absolute',bottom:100,left:0,right:0,textAlign:'center',fontSize:32,lineHeight:1.8,opacity:interpolate(f,[.3*fps,.6*fps],[0,1],ease)}}><div>Made for Codex x TwitchCon Hackathon</div><div style={{color:violet,fontSize:34,fontWeight:700}}>by Silicon</div></div></Scene>;};

