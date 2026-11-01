'use client';
import './enterprise.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EnterpriseRun, BusinessWalk, emptyProfile, parseProfile, price, invest, settle, gateText, type Profile } from '@/game/enterprise';
import { EnterpriseRenderer } from '@/game/enterprise-renderer';

const KEY='sidequest:enterprise:v1';
export default function EnterpriseGame({open}:{open:boolean}) {
  const host=useRef<HTMLDivElement>(null), panel=useRef<HTMLElement>(null), run=useRef(new EnterpriseRun());
  const profile=useRef(emptyProfile()), view=useRef<'run'|'town'>('run'), active=useRef(open), busy=useRef(false), clock=useRef(0), pay=useRef(0), payIndex=useRef(0), payFraction=useRef(0), payBefore=useRef(0), receiptAt=useRef(0);
  const [p,setP]=useState(emptyProfile()), [mode,setMode]=useState<'run'|'town'>('run'), [tick,setTick]=useState(0), [error,setError]=useState(''), [notice,setNotice]=useState(''), [payment,setPayment]=useState(false), [result,setResult]=useState<{coins:number;bonus:number;total:number}|null>(null);
  const walk=useRef(new BusinessWalk()), rendererRef=useRef<EnterpriseRenderer|null>(null);
  const publish=useCallback((next:Profile)=>{profile.current=next;setP(next);},[]);
  const pause=useCallback(()=>{run.current.pause();walk.current.stop();setTick(t=>t+1);},[]);
  useEffect(()=>{active.current=open;if(!open)pause();},[open,pause]);
  useEffect(()=>{try{publish(parseProfile(localStorage.getItem(KEY)));}catch{setNotice('Saved city unavailable. Progress is session-only until storage is restored.');}
    const sync=(e:StorageEvent)=>{if(e.key===KEY){try{publish(parseProfile(e.newValue));}catch{setNotice('Another tab has an incompatible save.');}}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[publish]);
  const transact=useCallback(async(action:(p:Profile)=>Profile)=>{
    const update=()=>{let latest=profile.current;try{const raw=localStorage.getItem(KEY);if(raw){const disk=parseProfile(raw);if(disk.revision>=latest.revision)latest=disk;}}catch{setNotice('Session-only progress: browser storage is unavailable.');}
      const next=action(latest);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{setNotice('Session-only progress: keep this tab open to retain your city.');}publish(next);};
    if(navigator.locks)await navigator.locks.request(KEY,update);else {setNotice('This browser cannot synchronize purchases across tabs. Use one game tab.');update();}
  },[publish]);
  const finish=useCallback(async()=>{if(busy.current||run.current.state!=='finish')return;busy.current=true;
    try{const current=run.current;receiptAt.current=clock.current;await transact(p=>{const receipt=settle(p,current.id,current.coins);setResult({coins:current.coins,bonus:receipt.bonus,total:receipt.total});return receipt.profile;});}catch{setNotice('Could not save this run. Retry to collect your coins.');}finally{busy.current=false;}},[transact]);
  const start=useCallback(()=>{if(busy.current)return;walk.current.stop();pay.current=0;setPayment(false);run.current=new EnterpriseRun(profile.current.runs);run.current.start(crypto.randomUUID());setResult(null);view.current='run';setMode('run');panel.current?.focus();setTick(t=>t+1);},[]);
  const buy=useCallback(async(index:number)=>{if(busy.current||pay.current)return;const cost=price(profile.current,index);if(cost===null||profile.current.wallet===0)return;busy.current=true;try{await transact(p=>{const cost=price(p,index)!;payBefore.current=p.wallet;payFraction.current=(p.wallet-Math.min(cost,p.wallet))/p.wallet;return invest(p,index);});payIndex.current=index;pay.current=.8;setPayment(true);}catch{setNotice('Not enough coins');}finally{busy.current=false;}},[transact]);
  useEffect(()=>{
    if(!host.current)return;let renderer:EnterpriseRenderer;try{renderer=new EnterpriseRenderer(host.current,()=>{pause();setError('The graphics context was interrupted. Reload the page to restore the game.');});}catch{setError('3D graphics could not start. Try a browser with hardware acceleration.');return;}
    rendererRef.current=renderer;let frame=0,last=0,ui=0,settled='',finishedAt=-1;const animate=(now:number)=>{frame=requestAnimationFrame(animate);const dt=last?Math.min((now-last)/1000,.05):0;const gap=last?(now-last)/1000:0;last=now;
      if(!active.current)return;if(gap>.25)run.current.pause();clock.current+=dt;
      if(view.current==='run')run.current.step(dt);else {const zone=walk.current.step(dt,profile.current.levels);if(zone===-1)start();else if(zone!==null&&zone>=0)void buy(zone);}
      if(run.current.state==='finish'&&settled!==run.current.id){settled=run.current.id;finishedAt=clock.current;void finish();}
      if(view.current==='run'&&run.current.state==='finish'&&finishedAt>=0&&clock.current-finishedAt>1.1&&!busy.current&&profile.current.paid.includes(run.current.id)){view.current='town';setMode('town');walk.current.x=-2;walk.current.z=1;walk.current.zone=-2;walk.current.stop();}
      if(pay.current){pay.current=Math.max(0,pay.current-dt);if(pay.current===0)setPayment(false);}
      renderer.render(run.current,profile.current,view.current,dt,pay.current?1-pay.current/.8:0,payIndex.current,payFraction.current,walk.current);
      if(now-ui>65){setTick(t=>t+1);ui=now;}
    };frame=requestAnimationFrame(animate);const blur=()=>pause();const visibility=()=>{if(document.hidden)pause();};window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
    return()=>{cancelAnimationFrame(frame);renderer.dispose();window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);};
  },[finish,pause,start,buy]);
  const r=run.current, state=r.state;const recent=r.events.at(-1);
  const arriving=state==='finish'&&result?Math.round(result.total*Math.min(1,(clock.current-receiptAt.current)/.85)):0;
  const displayWallet=payment?p.wallet+Math.round((payBefore.current-p.wallet)*pay.current/.8):state==='finish'&&result?p.wallet-result.total+arriving:p.wallet;
  const steer=(side:number)=>{r.move(side);panel.current?.focus();};
  const keyMap:Record<string,string>={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'};
  const point=(e:React.PointerEvent<HTMLDivElement>)=>{if(!(e.target instanceof HTMLCanvasElement))return;panel.current?.focus();if(view.current==='town'){const target=rendererRef.current?.groundPoint(e.clientX,e.clientY);if(target)walk.current.target=target;}else steer(e.clientX<e.currentTarget.getBoundingClientRect().left+e.currentTarget.clientWidth/2?-1:1);};
  return <section ref={panel} className="enterprise-game enterprise-walk" tabIndex={0} aria-label="Pocket Enterprise game" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))pause();}} onKeyDown={e=>{const direction=keyMap[e.key]||keyMap[e.key.toLowerCase()];if(direction){e.preventDefault();if(view.current==='town')walk.current.keys.add(direction);else if(direction==='left'||direction==='right')steer(direction==='left'?-1:1);}if(e.key==='Escape'){e.preventDefault();pause();}}} onKeyUp={e=>{const direction=keyMap[e.key]||keyMap[e.key.toLowerCase()];if(direction){e.preventDefault();walk.current.keys.delete(direction);}}}>
    <div className="enterprise-bar"><strong>POCKET ENTERPRISE</strong><span className="enterprise-wallet" aria-label="Wallet balance">◉ {displayWallet.toLocaleString()}</span></div>
    <div className="enterprise-scene" ref={host} onPointerDown={e=>{if(e.target instanceof HTMLCanvasElement){e.currentTarget.setPointerCapture(e.pointerId);point(e);}}} onPointerMove={e=>{if(e.buttons===1&&e.currentTarget.hasPointerCapture(e.pointerId))point(e);}}>
      {mode==='run'&&<><div className="enterprise-hud"><div><strong>◉ {r.coins}</strong></div>{state==='running'&&<button onClick={pause} aria-label="Pause coin run">Ⅱ</button>}</div><div className="enterprise-progress"><i style={{width:`${r.time/34*100}%`}} /></div>
      {state==='running'&&r.row<6&&<div className="enterprise-choice">{r.pair(r.row).map((g,i)=><button key={i} aria-label={`Choose ${gateText(g)}`} onClick={()=>steer(i?1:-1)} className={`${g.op==='+'||g.op==='×'?'gain':'loss'} ${r.lane===(i?1:-1)?'chosen':''}`}>{gateText(g)}</button>)}</div>}
      {(state==='ready'||state==='paused'||state==='over')&&<div className="enterprise-overlay"><button className="enterprise-play" aria-label={state==='paused'?'Resume coin run':'Start coin run'} onClick={state==='paused'?()=>{r.state='running';panel.current?.focus();}:start}>{state==='over'?'↻':'▶'}</button></div>}
      {state==='finish'&&result&&<div className="enterprise-receipt"><strong>+{arriving}</strong></div>}</>}
      {state==='finish'&&!result&&notice&&<div className="enterprise-overlay"><button className="button primary" onClick={()=>void finish()}>Retry saving run</button></div>}
      {mode==='town'&&<span className="enterprise-walk-hint">WASD / ↑↓←→</span>}
      {error&&<div className="enterprise-overlay" role="alert">{error}</div>}
    </div>
    <div className="enterprise-controls" aria-label={mode==='town'?'Walk controls':'Coin steering'}>{(mode==='town'?['left','up','down','right']:['left','right']).map(direction=><button key={direction} aria-label={mode==='town'?`Walk ${direction}`:`Steer coin ${direction}`} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);panel.current?.focus();if(view.current==='town')walk.current.keys.add(direction);else steer(direction==='left'?-1:1);}} onPointerUp={()=>walk.current.keys.delete(direction)} onPointerCancel={()=>walk.current.keys.delete(direction)} onLostPointerCapture={()=>walk.current.keys.delete(direction)}>{({left:'←',up:'↑',down:'↓',right:'→'} as Record<string,string>)[direction]}</button>)}</div>
    {notice&&<button className="enterprise-notice" role="status" onClick={()=>setNotice('')}>{notice} ×</button>}
  </section>;
}
