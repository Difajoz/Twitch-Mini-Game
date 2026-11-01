import {Img,staticFile} from 'remotion';
import {Scene,CodexBadge,violet} from './V3Design';

export const Thumbnail=()=> <Scene>
  <CodexBadge/>
  <div style={{position:'absolute',right:90,top:66,fontSize:25,fontWeight:700,letterSpacing:4,color:violet}}>WATCH / PLAY / ENJOY</div>
  <div style={{position:'absolute',left:90,top:215,width:800,fontWeight:800,fontSize:164,letterSpacing:-9,lineHeight:.96}}>
    <div>Twitch</div><div style={{color:violet,fontSize:138,marginTop:18}}>Mini Games</div>
  </div>
  <div style={{position:'absolute',left:96,top:600,fontSize:46,lineHeight:1.25,letterSpacing:-1.5}}>Your stream<br/>with a little more fun</div>
  <div style={{position:'absolute',right:80,top:235,width:900,height:600,borderRadius:26,overflow:'hidden',boxShadow:'0 24px 65px #24113724',border:'2px solid #292431'}}>
    <Img src={staticFile('illustrations/watch-flat.png')} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
  </div>
  <div style={{position:'absolute',right:105,top:865,padding:'15px 28px',borderRadius:15,background:violet,color:'#fff',fontSize:31,fontWeight:700}}>A little play beside your stream</div>
  <div style={{position:'absolute',left:96,right:96,bottom:62,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:24,color:'#675774'}}>
    <span>Made for Codex x TwitchCon Hackathon</span><span style={{color:violet,fontWeight:700,fontSize:29}}>by Silicon</span>
  </div>
</Scene>;
