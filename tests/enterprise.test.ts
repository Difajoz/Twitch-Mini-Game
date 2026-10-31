import test from 'node:test';
import assert from 'node:assert/strict';
import { applyGate, EnterpriseRun, emptyProfile, parseProfile, price, purchase, settle } from '../src/game/enterprise';
test('gate arithmetic is integral, floors losses and division, and has state-dependent choices',()=>{
  assert.equal(applyGate(19,{op:'÷',value:2}),9);assert.equal(applyGate(10,{op:'-',value:20}),0);
  assert.equal(applyGate(20,{op:'×',value:2}),40);assert.equal(applyGate(20,{op:'+',value:30}),50);
  assert.equal(applyGate(80,{op:'×',value:2}),160);
});
test('all six-gate choices stay bounded, zero ends the run and finish is stable',()=>{
  for(let round=0;round<4;round++)for(let choices=0;choices<64;choices++){
    const r=new EnterpriseRun(round);r.start('run');
    for(let frame=0;frame<34*120+10;frame++){r.move(choices&(1<<r.row)?1:-1);r.step(1/120);}
    assert.ok(['over','finish'].includes(r.state));assert.ok(r.coins>=0&&r.coins<=600);
    if(r.state==='finish')assert.equal(r.row,6);const value=r.coins;r.step(1);assert.equal(r.coins,value);
    const gates=r.events.filter(e=>e.label!=='+10');assert.ok(gates.length<=6);
  }
});
test('pausing freezes both position and accounting',()=>{const r=new EnterpriseRun();r.start('a');r.step(1);r.pause();const time=r.time;r.move(1);r.step(10);assert.equal(r.time,time);assert.equal(r.lane,-1);});
test('settlement pays once, order bonuses stay secondary, purchases cannot overdraw',()=>{
  let p=emptyProfile();const first=settle(p,'one',300);p=first.profile;assert.equal(p.wallet,300);
  assert.equal(settle(p,'one',300).total,0);assert.equal(price(p,1),null);
  p=purchase(p,0);assert.equal(p.wallet,50);assert.equal(p.levels[0],1);assert.throws(()=>purchase(p,1));
  const second=settle(p,'two',20);assert.equal(second.bonus,5);assert.equal(second.total,25);
  assert.equal(parseProfile(JSON.stringify(second.profile)).wallet,75);
});
test('invalid saves and reward amounts are rejected',()=>{assert.throws(()=>parseProfile('{'));assert.throws(()=>parseProfile(JSON.stringify({...emptyProfile(),wallet:-1})));assert.throws(()=>settle(emptyProfile(),'a',Infinity));assert.throws(()=>settle(emptyProfile(),'a',601));assert.equal(price(emptyProfile(),99),null);});
test('upgrades have two tiers and finish at max level',()=>{let p={...emptyProfile(),wallet:10000};for(let shop=0;shop<3;shop++){for(let i=0;i<3;i++)p=purchase(p,shop);assert.equal(price(p,shop),null);assert.throws(()=>purchase(p,shop));}assert.deepEqual(p.levels,[3,3,3]);});
