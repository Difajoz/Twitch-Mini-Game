import test from 'node:test';
import assert from 'node:assert/strict';
import { applyGate, invest, BusinessWalk, RUN_PAD, SHOP_PADS, EnterpriseRun, emptyProfile, parseProfile, price, purchase, settle } from '../src/game/enterprise';
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
test('partial investments persist and completion spends only the remainder',()=>{
  let p=invest({...emptyProfile(),wallet:100},0);assert.equal(p.wallet,0);assert.equal(p.invested[0],100);assert.equal(price(p,0),150);assert.equal(p.levels[0],0);
  p=parseProfile(JSON.stringify(p));p=invest({...p,wallet:200},0);assert.equal(p.wallet,50);assert.equal(p.levels[0],1);assert.equal(p.invested[0],0);assert.equal(price(p,0),350);
  const old={...emptyProfile()} as Partial<ReturnType<typeof emptyProfile>>;delete old.invested;assert.deepEqual(parseProfile(JSON.stringify(old)).invested,[0,0,0]);
  assert.throws(()=>invest(emptyProfile(),0));assert.throws(()=>invest({...emptyProfile(),wallet:500},1));
});
test('upgrades have two tiers and finish at max level',()=>{let p={...emptyProfile(),wallet:10000};for(let shop=0;shop<3;shop++){for(let i=0;i<3;i++)p=purchase(p,shop);assert.equal(price(p,shop),null);assert.throws(()=>purchase(p,shop));}assert.deepEqual(p.levels,[3,3,3]);});
test('walking pads trigger only on entry; moving out and back permits a second investment',()=>{
  const walk=new BusinessWalk();walk.x=SHOP_PADS[0].x;walk.z=SHOP_PADS[0].z;
  assert.equal(walk.step(0),0);assert.equal(walk.step(.1),null);
  walk.x=-3;walk.z=1;assert.equal(walk.step(0),null);
  walk.x=SHOP_PADS[0].x;walk.z=SHOP_PADS[0].z;assert.equal(walk.step(0),0);
  walk.x=RUN_PAD.x;walk.z=RUN_PAD.z;assert.equal(walk.step(0),-1);assert.equal(walk.step(.1),null);
});
test('free walking is normalized, bounded, and stopping clears pointer and keyboard movement',()=>{
  const walk=new BusinessWalk();walk.keys.add('up');walk.keys.add('right');const x=walk.x,z=walk.z;walk.step(.1);assert.ok(Math.abs(Math.hypot(walk.x-x,walk.z-z)-.6)<1e-8);
  walk.stop();const at=walk.x;walk.step(.1);assert.equal(walk.x,at);
  walk.target={x:SHOP_PADS[1].x,z:SHOP_PADS[1].z};for(let i=0;i<200;i++)walk.step(.01);assert.ok(Math.hypot(walk.x-SHOP_PADS[1].x,walk.z-SHOP_PADS[1].z)<.1);
  walk.keys.add('right');for(let i=0;i<200;i++)walk.step(.01);assert.equal(walk.x,10);
});

test('coin runs finish at three times the original speed',()=>{const run=new EnterpriseRun();run.start('fast');for(let i=0;i<11*120;i++)run.step(1/120);assert.equal(run.state,'running');for(let i=0;i<41;i++)run.step(1/120);assert.equal(run.state,'finish');assert.equal(run.row,6);});
test('businessman cannot walk or click through an open shop',()=>{
  for(const pointer of [false,true]){const w=new BusinessWalk();w.x=0;w.z=6;if(pointer)w.target={x:9,z:6};else w.keys.add('right');for(let i=0;i<100;i++)w.step(.016,[1,0,0]);assert.ok(w.x<2.65);}
});
test('building corners allow sliding alongside walls and unopened plots remain walkable',()=>{
  const w=new BusinessWalk();w.x=2.5;w.z=6;w.keys.add('right');w.keys.add('up');for(let i=0;i<100;i++)w.step(.016,[1,0,0]);assert.ok(w.z<4.2);
  const empty=new BusinessWalk();empty.x=0;empty.z=6;empty.keys.add('right');for(let i=0;i<100;i++)empty.step(.016,[0,0,0]);assert.ok(empty.x>6);
});
test('gate uses the lane at the crossing, not after a late switch',()=>{const r=new EnterpriseRun();r.start('crossing');r.time=4.99;r.x=-1.6;r.lane=1;r.step(.05);assert.equal(r.events.at(-1)?.label,'×2');});
test('business counters and upgrade tables are solid',()=>{const w=new BusinessWalk();w.x=4.5;w.z=9;w.keys.add('up');for(let i=0;i<100;i++)w.step(.016,[1,0,0]);assert.ok(w.z>=8.49);const table=new BusinessWalk();table.x=8;table.z=6.9;table.keys.add('left');for(let i=0;i<5;i++)table.step(.016,[2,0,0]);assert.ok(table.x>=7);});
