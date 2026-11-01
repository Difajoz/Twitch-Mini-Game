import type {CSSProperties, ReactNode} from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
export const ink='#111016', purple='#9b6aff', cream='#f4f1ea';
export const ease={extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.16,1,.3,1)} as const;
export const Stage=({children,light=false}: {children:ReactNode;light?:boolean})=><AbsoluteFill style={{background:light?cream:ink,color:light?ink:cream,fontFamily:'Arial, Helvetica, sans-serif',overflow:'hidden'}}><div style={{position:'absolute',inset:0,background:light?'radial-gradient(ellipse at 80% 20%,#d9caf655,transparent 60%)':'radial-gradient(ellipse at 75% 40%,#7146bd26,transparent 65%)'}}/>{children}<div style={{position:'absolute',left:90,right:90,bottom:44,display:'flex',justifyContent:'space-between',fontSize:18,letterSpacing:3,color:light?'#6a6570':'#8e8899'}}><span>SIDEQUEST / MINI GAMES</span><span>FEATURE FILM · 01</span></div></AbsoluteFill>;
export const Tag=({children}: {children:ReactNode})=><div style={{fontSize:21,letterSpacing:5,fontWeight:700,color:purple,marginBottom:26}}>{children}</div>;
export const Reveal=({children,style={}}:{children:ReactNode;style?:CSSProperties})=>{const f=useCurrentFrame();return <div style={{opacity:interpolate(f,[0,20],[0,1],ease),translate:`0 ${interpolate(f,[0,27],[50,0],ease)}px`,...style}}>{children}</div>;};
export const Heading=({children}:{children:ReactNode})=><h1 style={{fontSize:110,lineHeight:.98,letterSpacing:-7,margin:0,fontWeight:800}}>{children}</h1>;
