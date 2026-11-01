import {Img,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {ease} from './Design';
import {Scene} from './V3Design';

export const CodexSignature=()=>{
  const frame=useCurrentFrame();const {fps}=useVideoConfig();
  return <Scene dark>
    <div style={{position:'absolute',left:320,top:330,width:300,height:300,
      scale:interpolate(frame,[0,.45*fps],[.65,1],ease),
      rotate:`${interpolate(frame,[0,.7*fps],[-32,0],ease)}deg`,
      opacity:interpolate(frame,[0,.2*fps],[0,1],ease)}}>
      <div style={{position:'absolute',inset:0,background:'#25212d',border:'1px solid #ffffff24',borderRadius:66,display:'grid',placeItems:'center'}}>
        <Img src={staticFile('capture/codex-icon.png')} style={{width:200,height:200}}/>
      </div>
    </div>
    <div style={{position:'absolute',left:760,top:325,opacity:interpolate(frame,[.12*fps,.4*fps],[0,1],ease),translate:`${interpolate(frame,[.12*fps,.55*fps],[80,0],ease)}px 0`}}>
      <div style={{fontSize:78,fontWeight:700,letterSpacing:-3}}>All done with</div>
      <div style={{fontSize:145,fontWeight:800,letterSpacing:-7,color:'#bc91fa',marginTop:7}}>Codex only</div>
    </div>
    <div style={{position:'absolute',left:0,right:0,bottom:190,textAlign:'center',fontSize:24,letterSpacing:5,color:'#b8a6ca',opacity:interpolate(frame,[.4*fps,.7*fps],[0,1],ease)}}>IDEA · PLAN · CODE · DEMO</div>
  </Scene>;
};
