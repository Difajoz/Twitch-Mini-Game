import {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Simulation, TUNE, createRow} from '../../src/game/simulation';
import {RunnerRenderer} from '../../src/game/renderer';
import {EnterpriseRun, emptyProfile, applyGate} from '../../src/game/enterprise';
import {EnterpriseRenderer} from '../../src/game/enterprise-renderer';

// Replays the real project engines. No fabricated gameplay, live data or video.
export const Engine = ({kind,offsetFrames=0}: {kind:'skyline'|'enterprise';offsetFrames?:number}) => {
 const host=useRef<HTMLDivElement>(null);
 const replay=useRef<{draw:RunnerRenderer|EnterpriseRenderer; sim:Simulation; run:EnterpriseRun; frame:number}|null>(null);
 const frame=useCurrentFrame()+offsetFrames; const {fps}=useVideoConfig();
 useLayoutEffect(()=>{return ()=>{replay.current?.draw.dispose();replay.current=null;};},[]);
 useLayoutEffect(()=>{
  if(!host.current)return;
  const reset=()=>{replay.current?.draw.dispose();const sim=new Simulation(17);sim.start();const run=new EnterpriseRun();run.start('film-replay');replay.current={draw:kind==='skyline'?new RunnerRenderer(host.current!,()=>{}):new EnterpriseRenderer(host.current!),sim,run,frame:-1};};
  if(!replay.current||frame<replay.current.frame)reset();
  const state=replay.current!;
  for(let f=state.frame+1;f<=frame;f++){
   if(kind==='skyline'){
    for(let tick=0;tick<120/fps;tick++){
     const row=Math.max(0,Math.floor((state.sim.distance+20-TUNE.opening)/TUNE.rowSpacing));
     const target=createRow(row,17).safe;
     if(state.sim.lane<target)state.sim.input('right');
     if(state.sim.lane>target)state.sim.input('left');
     state.sim.step();
    }
    (state.draw as RunnerRenderer).render(state.sim,f/fps);
   } else {
    if(state.run.row<6){const pair=state.run.pair(state.run.row);state.run.move(applyGate(state.run.coins,pair[0])>=applyGate(state.run.coins,pair[1])?-1:1);}
    state.run.step(1/fps);
    (state.draw as EnterpriseRenderer).render(state.run,emptyProfile(),'run',1/fps,0,0);
   }
  }
  state.frame=frame;
 },[frame,fps,kind]);
 return <div ref={host} style={{width:'100%',height:'100%',overflow:'hidden'}}/>;
};
