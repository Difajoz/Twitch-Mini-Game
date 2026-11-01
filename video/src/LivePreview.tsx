import {Video} from '@remotion/media';
import {interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease} from './Design';
import {Scene, TestCredit} from './V3Design';

export const LivePreview = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <Scene dark>
    <div style={{position:'absolute',left:90,top:52,fontSize:65,fontWeight:800,letterSpacing:-2.6,
      opacity:interpolate(frame,[0,.3*fps],[0,1],ease),
      translate:`0 ${interpolate(frame,[0,.4*fps],[22,0],ease)}px`}}>
      Your stream — <span style={{color:'#b88af9'}}>your side quest</span>
    </div>
    <div style={{position:'absolute',right:94,top:79,fontSize:19,fontWeight:700,letterSpacing:3,color:'#bcaaca'}}>ACTUAL PROJECT PREVIEW</div>
    <div style={{position:'absolute',left:90,top:155,width:1740,height:810,borderRadius:22,
      overflow:'hidden',border:'1px solid #ffffff32',boxShadow:'0 25px 90px #0007',
      scale:interpolate(frame,[0,.45*fps],[.97,1],ease)}}>
      <Video src={staticFile('capture/live-bright-skyline.mp4')} muted
        durationInFrames={7*fps} premountFor={fps}
        style={{width:1740,height:1740*712/1266}} objectFit="contain"/>
    </div>
    <TestCredit dark/>
  </Scene>;
};
