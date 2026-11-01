import type {CSSProperties,ReactNode} from 'react';
import {AbsoluteFill,Img,staticFile,useCurrentFrame,interpolate} from 'remotion';
import {ease} from './Design';
export const ivory='#f6f0e7', black='#121016', violet='#9354ed';
export const Scene=({children,dark=false}:{children:ReactNode;dark?:boolean})=><AbsoluteFill style={{background:dark?black:ivory,color:dark?ivory:black,fontFamily:'Arial, Helvetica, sans-serif',overflow:'hidden'}}>{children}</AbsoluteFill>;
export const Word=({children,delay=0,style={}}:{children:ReactNode;delay?:number;style?:CSSProperties})=>{const f=useCurrentFrame()*3;return <span style={{display:'inline-block',opacity:interpolate(f,[delay,delay+13],[0,1],ease),translate:`0 ${interpolate(f,[delay,delay+24],[75,0],ease)}px`,...style}}>{children}</span>;};
export const Big=({children,style={}}:{children:ReactNode;style?:CSSProperties})=><div style={{fontSize:128,fontWeight:800,letterSpacing:-7,lineHeight:1.02,...style}}>{children}</div>;
export const Art=({name,style={}}:{name:string;style?:CSSProperties})=>{const f=useCurrentFrame()*3;return <div style={{position:'absolute',width:680,height:680,overflow:'hidden',borderRadius:45,opacity:interpolate(f,[0,18],[0,1],ease),translate:`0 ${interpolate(f,[0,34],[80,0],ease)+Math.sin(f/32)*7}px`,rotate:`${interpolate(f,[0,50],[-4,0],ease)}deg`,...style}}><Img src={staticFile(`illustrations/${name}.png`)} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>;};
export const Label=({children,style={}}:{children:ReactNode;style?:CSSProperties})=><div style={{fontSize:25,fontWeight:700,letterSpacing:4,textTransform:'uppercase',color:violet,...style}}>{children}</div>;
export const TestCredit=({dark=false}:{dark?:boolean})=><div style={{position:'absolute',bottom:39,left:90,fontSize:26,color:dark?'#cdb4f2':'#675774'}}>Preview Test Games made with Codex</div>;
export const CodexBadge=({dark=false}:{dark?:boolean})=><div style={{position:'absolute',left:90,top:50,display:'flex',alignItems:'center',gap:18,fontSize:30,fontWeight:700}}><div style={{padding:9,borderRadius:14,background:dark?'#282330':'#15121b'}}><Img src={staticFile('capture/codex-icon.png')} style={{width:40,height:40,display:'block'}}/></div>Made with Codex</div>;


