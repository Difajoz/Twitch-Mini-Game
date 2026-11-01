import {Img,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {Scene,Big,Word,Label,TestCredit,Art,violet} from './V3Design';
import {ease} from './Design';

export const BrowseGames=()=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();
 const scroll=interpolate(f,[.4*fps,3.6*fps],[0,1000],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <Scene><div style={{position:'absolute',left:95,top:220,width:900}}>
 <Label>A LITTLE SOMETHING FOR EVERY MOOD</Label><Big style={{marginTop:40,fontSize:145}}><Word>Browse</Word><br/><Word delay={12} style={{color:violet}}>games</Word></Big>
 <div style={{fontSize:42,marginTop:35,letterSpacing:-1}}>Find your next side quest</div>
 <div style={{fontSize:22,color:'#786885',marginTop:60,letterSpacing:2}}>LIBRARY CONCEPT · 12 GAME IDEAS</div></div>
 <div style={{position:'absolute',right:110,top:100,width:660,height:840,borderRadius:28,background:'#18181f',overflow:'hidden',boxShadow:'0 30px 70px #23123b20',translate:`${interpolate(f,[0,.4*fps],[70,0],ease)}px 0`}}>
 <div style={{height:83,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',fontSize:32,fontWeight:700,color:'#f6f0e7',borderBottom:'1px solid #ffffff22'}}>Mini games <span style={{fontSize:19,color:'#b58af4'}}>Browse all</span></div>
 <div style={{position:'absolute',top:95,bottom:12,left:12,right:12,overflow:'hidden'}}><Img src={staticFile('illustrations/library-tall.png')} style={{width:624,translate:`0 -${scroll}px`}}/></div>
 <div style={{position:'absolute',right:7,top:104,width:4,height:720,background:'#ffffff15',borderRadius:2}}><div style={{width:4,height:170,borderRadius:2,background:'#a970ff',translate:`0 ${scroll/1000*550}px`}}/></div>
 </div><TestCredit/></Scene>;
};

export const AdOpportunity=()=> <Scene>
 <div style={{position:'absolute',left:95,top:190,width:1000}}><Label>MONETIZATION CONCEPT</Label>
 <Big style={{marginTop:40,fontSize:126}}><Word>A new space</Word><br/><Word delay={12}>for <span style={{color:violet}}>ad revenue</span></Word></Big>
 <div style={{fontSize:41,marginTop:38,lineHeight:1.3,width:890}}>Skippable ads inside mini games<br/>The stream stays in view</div>
 <div style={{fontSize:23,color:'#786885',marginTop:40}}>Illustrative placement · Proposed feature</div></div>
 <Art name="ad-sidebar-no-period" style={{right:65,top:100,width:680,height:850,borderRadius:24}}/>
 <TestCredit/>
 </Scene>;

