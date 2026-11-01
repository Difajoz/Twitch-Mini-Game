import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease} from './Design';

// Shared polygon topology turns the existing project Glitch into an angular pad.
// Both endpoints use the same flat purple/white masses and corner treatment.
const twitchOuter=[[4,0],[0,5],[0,24],[6,24],[6,28],[11,24],[17,24],[24,17],[24,0],[14,0]];
const twitchInner=[[7,3],[3,7],[3,20],[9,20],[9,24],[13,20],[18,20],[22,16],[22,3],[14,3]];
const padOuter=[[5,6],[2,9],[0,22],[4,25],[9,20],[15,20],[20,25],[24,22],[22,9],[19,6]];
const padInner=[[6,9],[5,10],[3,21],[4,22],[8,17],[16,17],[20,22],[21,21],[19,10],[18,9]];
const points=(a:number[][],b:number[][],p:number)=>a.map((v,i)=>`${v[0]+(b[i][0]-v[0])*p},${v[1]+(b[i][1]-v[1])*p}`).join(' ');

export const TwitchPlayMorph=()=>{
  const frame=useCurrentFrame();const {fps}=useVideoConfig();
  const p=interpolate(frame,[.65*fps,1.35*fps,2.1*fps,2.9*fps],[0,1,1,0],ease);
  return <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:18}}>
    <svg width="144" height="168" viewBox="0 0 24 28" role="img" aria-label="Twitch icon morphs into a game controller and back">
      <polygon points={points(twitchOuter,padOuter,p)} fill="#9146ff"/>
      <polygon points={points(twitchInner,padInner,p)} fill="white"/>
      <rect x={10-3.5*p} y={6+5*p} width="2" height={8-2*p} fill="#9146ff"/>
      <rect x={16-.5*p} y={6+5.8*p} width="2" height={8-6*p} fill="#9146ff"/>
      <rect x="4.5" y="13" width="6" height="2" fill="#9146ff" opacity={p}/>
      <rect x="18" y="14.2" width="2" height="2" fill="#9146ff" opacity={p}/>
    </svg>
  </div>;
};
