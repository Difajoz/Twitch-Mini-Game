'use client';
import './enterprise.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EnterpriseRun, SHOPS, emptyProfile, parseProfile, price, purchase, settle, gateText, type Profile } from '@/game/enterprise';
import { EnterpriseRenderer } from '@/game/enterprise-renderer';

const KEY='sidequest:enterprise:v1';
export default function EnterpriseGame({open}:{open:boolean}) {
  const host=useRef<HTMLDivElement>(null), panel=useRef<HTMLElement>(null), run=useRef(new EnterpriseRun());
  const profile=useRef(emptyProfile()), view=useRef<'run'|'town'>('town'), active=useRef(open), busy=useRef(false), clock=useRef(0), pay=useRef(0), payIndex=useRef(0), payFraction=useRef(0), payBefore=useRef(0), receiptAt=useRef(0);
  const [p,setP]=useState(emptyProfile()), [mode,setMode]=useState<'run'|'town'>('town'), [tick,setTick]=useState(0), [error,setError]=useState(''), [notice,setNotice]=useState(''), [selected,setSelected]=useState(0), [payment,setPayment]=useState(false), [result,setResult]=useState<{coins:number;bonus:number;total:number}|null>(null);
  const publish=useCallback((next:Profile)=>{profile.current=next;setP(next);},[]);
  const pause=useCallback(()=>{run.current.pause();setTick(t=>t+1);},[]);
  useEffect(()=>{active.current=open;if(!open)pause();},[open,pause]);
  useEffect(()=>{try{publish(parseProfile(localStorage.getItem(KEY)));}catch{setNotice('Saved city unavailable. Progress is session-only until storage is restored.');}
    const sync=(e:StorageEvent)=>{if(e.key===KEY){try{publish(parseProfile(e.newValue));}catch{setNotice('Another tab has an incompatible save.');}}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[publish]);
  const transact=useCallback(async(action:(p:Profile)=>Profile)=>{
    const update=()=>{let latest=profile.current;try{const raw=localStorage.getItem(KEY);if(raw){const disk=parseProfile(raw);if(disk.revision>=latest.revision)latest=disk;}}catch{setNotice('Session-only progress: browser storage is unavailable.');}
      const next=action(latest);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{setNotice('Session-only progress: keep this tab open to retain your city.');}publish(next);};
    if(navigator.locks)await navigator.locks.request(KEY,update);else {setNotice('This browser cannot synchronize purchases across tabs. Use one game tab.');update();}
  },[publish]);
  const finish=useCallback(async()=>{if(busy.current||run.current.state!=='finish')return;busy.current=true;
    try{const current=run.current;receiptAt.current=clock.current;await transact(p=>{const receipt=settle(p,current.id,current.coins);setResult({coins:current.coins,bonus:receipt.bonus,total:receipt.total});return receipt.profile;});}catch{setNotice('Could not settle this run. Return to Businesses and try again.');}finally{busy.current=false;}},[transact]);
  useEffect(()=>{
    if(!host.current)return;let renderer:EnterpriseRenderer;try{renderer=new EnterpriseRenderer(host.current);}catch{setError('3D graphics could not start. Try a browser with hardware acceleration.');return;}
    let frame=0,last=0,ui=0,settled='';const animate=(now:number)=>{frame=requestAnimationFrame(animate);const dt=last?Math.min((now-last)/1000,.05):0;const gap=last?(now-last)/1000:0;last=now;
      if(!active.current)return;if(gap>.25)run.current.pause();clock.current+=dt;
      if(view.current==='run')run.current.step(dt);
      if(run.current.state==='finish'&&settled!==run.current.id){settled=run.current.id;void finish();}
      if(pay.current){pay.current=Math.max(0,pay.current-dt);if(pay.current===0)setPayment(false);}
      renderer.render(run.current,profile.current,view.current,dt,pay.current?1-pay.current/.8:0,payIndex.current,payFraction.current);
      if(now-ui>65){setTick(t=>t+1);ui=now;}
    };frame=requestAnimationFrame(animate);const blur=()=>pause();const visibility=()=>{if(document.hidden)pause();};window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
    return()=>{cancelAnimationFrame(frame);renderer.dispose();window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);};
  },[finish,pause]);
  const changeMode=(next:'run'|'town')=>{pause();pay.current=0;setPayment(false);view.current=next;setMode(next);};
  const start=()=>{if(busy.current)return;pay.current=0;setPayment(false);run.current=new EnterpriseRun(profile.current.runs);run.current.start(crypto.randomUUID());setResult(null);view.current='run';setMode('run');panel.current?.focus();setTick(t=>t+1);};
  const buy=async()=>{if(busy.current||pay.current)return;busy.current=true;try{await transact(p=>{const cost=price(p,selected)!;payBefore.current=p.wallet;payFraction.current=(p.wallet-cost)/p.wallet;return purchase(p,selected);});payIndex.current=selected;pay.current=.8;setPayment(true);setNotice(`${SHOPS[selected].name} ${profile.current.levels[selected]===1?'is open':'upgraded'}!`);}catch{setNotice('Not enough cash, or another tab changed this purchase.');}finally{busy.current=false;}};
  const r=run.current, state=r.state;const cost=price(p,selected);const recent=r.events.at(-1);const remaining=cost===null?0:Math.max(0,cost-p.wallet);
  const arriving=state==='finish'&&result?Math.round(result.total*Math.min(1,(clock.current-receiptAt.current)/.85)):0;
  const displayWallet=payment?p.wallet+Math.round((payBefore.current-p.wallet)*pay.current/.8):state==='finish'&&result?p.wallet-result.total+arriving:p.wallet;
  const steer=(side:number)=>{r.move(side);panel.current?.focus();};
  return <section ref={panel} className="enterprise-game" tabIndex={0} aria-label="Pocket Enterprise game" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))pause();}} onKeyDown={e=>{if(e.target instanceof HTMLButtonElement)return;if(['ArrowLeft','a','A','ArrowRight','d','D','Escape'].includes(e.key)){e.preventDefault();if(e.key==='Escape')pause();else steer(['ArrowLeft','a','A'].includes(e.key)?-1:1);}}}>
    <div className="enterprise-bar"><strong>POCKET <span>ENTERPRISE</span></strong><span className="enterprise-wallet" aria-label="Wallet balance">◉ {displayWallet.toLocaleString()}</span></div>
    <nav className="enterprise-tabs" aria-label="Pocket Enterprise views"><button className={mode==='town'?'active':''} onClick={()=>changeMode('town')}>Businesses</button><button className={mode==='run'?'active':''} onClick={()=>changeMode('run')}>Coin run</button><span>{p.levels.filter(Boolean).length}/3 open</span></nav>
    <div className="enterprise-scene" ref={host} onPointerDown={e=>{if(e.target instanceof HTMLCanvasElement){e.currentTarget.setPointerCapture(e.pointerId);steer(e.clientX<e.currentTarget.getBoundingClientRect().left+e.currentTarget.clientWidth/2?-1:1);}}} onPointerMove={e=>{if(e.buttons===1&&e.currentTarget.hasPointerCapture(e.pointerId))steer(e.clientX<e.currentTarget.getBoundingClientRect().left+e.currentTarget.clientWidth/2?-1:1);}}>
      {mode==='town'?<div className="enterprise-town-label"><span>YOUR LITTLE EMPIRE</span><strong>{payment?'Putting your money to work…':p.levels.some(Boolean)?'Built one coin at a time.':'Big plans. Small beginnings.'}</strong></div>:<>
        <div className="enterprise-hud"><div><small>RUN COINS</small><strong>◉ {r.coins}</strong></div><button onClick={pause} aria-label="Pause coin run">Ⅱ</button></div><div className="enterprise-progress"><i style={{width:`${r.time/34*100}%`}} /></div>
        {state==='running'&&<><div className="enterprise-choice">{r.row<6?r.pair(r.row).map((g,i)=><span key={i} className={`${g.op==='+'||g.op==='×'?'gain':'loss'} ${r.lane===(i?-1:1)?'':'chosen'}`}>{gateText(g)}</span>):<span>Meet your business partner →</span>}</div>{recent&&<span key={recent.id} className={`enterprise-feedback ${recent.kind}`}>{recent.label} · {recent.before} → {recent.after}</span>}</>}
        {(state==='ready'||state==='paused'||state==='over')&&<div className="enterprise-overlay"><span>{state==='over'?'EVERY EMPIRE STARTS SOMEWHERE':'A LITTLE RUN. A BIGGER BUSINESS.'}</span><h3>{state==='over'?'Out of coins.':state==='paused'?'Business can wait.':'Make your first investment.'}</h3><p>{state==='over'?'Your saved cash and shops are safe. Try another route.':'Pick the best gate. Build your shop street.'}</p><button className="button primary" onClick={state==='paused'?()=>{r.state='running';panel.current?.focus();}:start}>{state==='paused'?'Resume run':'Start coin run'} →</button></div>}
        {state==='finish'&&result&&<div className="enterprise-receipt"><strong>+{arriving} banked</strong><span>{result.coins} run + {result.bonus} shop orders</span></div>}
      </>}
      {error&&<div className="enterprise-overlay" role="alert">{error}</div>}
    </div>
    <div className="enterprise-actions">
      {mode==='town'?<><div className="enterprise-shop-tabs">{SHOPS.map((s,i)=><button key={s.name} aria-label={`Select ${s.name}`} aria-pressed={selected===i} className={selected===i?'selected':''} onClick={()=>setSelected(i)}>{['☕','▦','☷'][i]}<span>{s.short}</span><small>{p.levels[i]?`Lv ${p.levels[i]}`:'Plot'}</small></button>)}</div><div className="enterprise-shop-detail"><div><strong>{SHOPS[selected].name}</strong><small>{p.levels[selected]===3?'Fully upgraded':selected>0&&!p.levels[selected-1]&&!p.levels[selected]?`Open ${SHOPS[selected-1].name} first`:`Orders ${SHOPS[selected].bonus*p.levels[selected]} → ${SHOPS[selected].bonus*(p.levels[selected]+1)} / run*`}</small></div><button className="button secondary" disabled={cost===null||remaining>0||payment} onClick={()=>void buy()}>{payment?'Building…':cost===null?p.levels[selected]===3?'Max level':'Locked':remaining?`Need ${remaining}`:`${p.levels[selected]?'Upgrade':'Open'} · ${cost}`}</button></div><button className="button primary enterprise-start" onClick={start}>Earn cash · Start coin run →</button><small className="enterprise-footnote">*Shop orders capped at 25% of run earnings. Saved on this device.</small></>:
      state==='finish'?<div className="enterprise-result-actions"><button className="button primary" disabled={!result} onClick={()=>changeMode('town')}>Invest earnings →</button><button className="button secondary" disabled={!result} onClick={start}>Run again</button></div>:<div className="enterprise-steering"><button aria-label="Steer coin left" onClick={()=>steer(-1)}>← LEFT</button><span>{Math.min(6,r.row)}/6 gates · {Math.max(0,Math.ceil(34-r.time))}s</span><button aria-label="Steer coin right" onClick={()=>steer(1)}>RIGHT →</button></div>}
      {notice&&<p className="enterprise-notice" role="status">{notice}</p>}
    </div>
  </section>;
}
