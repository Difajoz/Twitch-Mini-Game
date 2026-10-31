import * as T from 'three';
import { EnterpriseRun, gateText, SHOPS, price, RUN_PAD, SHOP_PADS, type BusinessWalk, type Profile } from './enterprise';

type Coin = { mesh: T.Group; target: T.Vector3; delay: number; flying: boolean; velocity: T.Vector3; age: number; payment: boolean; start: T.Vector3 };
export class EnterpriseRenderer {
  scene = new T.Scene(); camera = new T.PerspectiveCamera(48, 1, .1, 180);
  gl: T.WebGLRenderer; observer: ResizeObserver; pickups = new T.Group(); road = new T.Group(); town = new T.Group(); gates = new T.Group();
  coins: Coin[] = []; active: Coin[] = []; coinGeo = new T.CylinderGeometry(.3,.3,.1,16); rimGeo = new T.TorusGeometry(.25,.022,5,16);
  gold = new T.MeshStandardMaterial({color:'#edb845',metalness:.65,roughness:.28}); rim = new T.MeshStandardMaterial({color:'#ffe5a0',metalness:.5,roughness:.3});
  materials: T.Material[] = []; materialCache = new Map<string,T.Material>(); textures: T.Texture[] = []; seen = 0; lastCount = -1; clock = 0; phaseTime = 0; phase = ''; levelKey = ''; shopGroups: T.Group[] = [];
  man = new T.Group(); pads = new T.Group(); hand = new T.Group(); payShop = 0; payInitial = 0; payKeep = 0; signCache = new Map<string,T.Material>(); customer = new T.Group(); reduced = false;
  constructor(public host: HTMLElement) {
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.gl = new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
    this.gl.setPixelRatio(Math.min(devicePixelRatio,1.5)); this.gl.outputColorSpace=T.SRGBColorSpace; this.gl.setClearColor('#b7d3dc');
    host.appendChild(this.gl.domElement); this.scene.fog=new T.Fog('#b7d3dc',45,105);
    this.scene.add(new T.HemisphereLight('#fff7dc','#758e9b',2.7)); const sun=new T.DirectionalLight('#fff0ce',3);sun.position.set(-8,18,10);this.scene.add(sun);
    this.scene.add(this.road,this.town,this.gates);this.town.add(this.pads);this.road.add(this.pickups);for(let i=0;i<10;i++){const coin=new T.Mesh(this.coinGeo,this.gold);coin.rotation.x=Math.PI/2;coin.position.set((i<5?-1.6:1.6)+(i%5-2)*.25,.23,0);this.pickups.add(coin);}
    this.box(this.road,0,-.28,-32,9,.5,94,'#536d77');
    for(const x of [-4.45,4.45]) this.box(this.road,x,.02,-32,.13,.15,94,'#e7d5ad');
    for(let i=0;i<26;i++) this.box(this.road,0,.005,-i*4,.05,.02,1.3,'#dce8e5');
    for(let i=0;i<14;i++){const x=(i%2?1:-1)*(7+(i%3)*2);this.box(this.road,x,-2,-i*7,3,3+i%4,4,['#719ca2','#8daab0','#b8c2b1'][i%3]);}
    this.box(this.town,0,-.22,0,16,.4,16,'#92aaa2'); this.box(this.town,1,0,0,11,.06,12,'#d1c7af');
    for(let i=0;i<3;i++){const g=new T.Group();g.position.set(3,0,3-i*4);this.town.add(g);this.shopGroups.push(g);}
    const man=this.man;man.position.set(-2,0,1);this.town.add(man);
    this.box(man,0,1.35,0,.85,1.05,.48,'#344c60');this.box(man,0,1.42,.25,.24,.8,.03,'#e9e4cd');
    this.box(man,0,.62,0,.68,.45,.44,'#293e52');
    for(const x of [-.23,.23]){this.box(man,x,.25,0,.27,.6,.3,'#293e52');this.box(man,x,.05,.12,.32,.15,.5,'#26323c');}
    const head=new T.Mesh(new T.SphereGeometry(.35,16,12),this.mat('#dca778'));head.position.y=2.2;man.add(head);
    this.box(man,0,2.45,-.04,.62,.16,.51,'#423b36');
    for(const x of [-.12,.12])this.box(man,x,2.23,.31,.045,.05,.025,'#26323c');
    this.box(man,-.5,1.37,0,.25,.8,.28,'#eee8d7');
    this.box(man,.55,1.55,.28,.65,.25,.3,'#eee8d7');
    this.hand.position.set(-1.05,1.7,1.4);this.town.add(this.hand);this.box(this.hand,0,0,0,.85,.16,.75,'#dca778');
    this.customer.position.set(0,0,4); this.town.add(this.customer);this.box(this.customer,0,.6,0,.4,.8,.35,'#567fa3');this.box(this.customer,0,1.15,0,.3,.3,.3,'#d5a17e');
    this.camera.position.set(10,10,13);this.camera.lookAt(1,1,0);this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();
  }
  mat(color:string){const cached=this.materialCache.get(color);if(cached)return cached;const m=new T.MeshStandardMaterial({color,roughness:.72});this.materials.push(m);this.materialCache.set(color,m);return m;}
  box(g:T.Group,x:number,y:number,z:number,w:number,h:number,d:number,color:string){const m=new T.Mesh(new T.BoxGeometry(w,h,d),this.mat(color));m.position.set(x,y,z);g.add(m);return m;}
  sign(text:string,color:string,w:number,h:number){const key=text+color;const cached=this.signCache.get(key);if(cached)return new T.Mesh(new T.PlaneGeometry(w,h),cached);const c=document.createElement('canvas');c.width=512;c.height=192;const ctx=c.getContext('2d')!;ctx.fillStyle=color;ctx.fillRect(0,0,512,192);ctx.strokeStyle='#ffffff60';ctx.lineWidth=8;ctx.strokeRect(8,8,496,176);ctx.fillStyle='#fff';ctx.font=`800 ${text.length>8?46:90}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,102);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;this.textures.push(tex);const mat=new T.MeshBasicMaterial({map:tex,side:T.DoubleSide});this.materials.push(mat);this.signCache.set(key,mat);return new T.Mesh(new T.PlaneGeometry(w,h),mat);}
  groundPoint(clientX:number,clientY:number){const rect=this.host.getBoundingClientRect();const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1),this.camera);const hit=new T.Vector3();if(!ray.ray.intersectPlane(new T.Plane(new T.Vector3(0,1,0),0),hit))return null;return {x:Math.max(-5,Math.min(5,hit.x)),z:Math.max(-6.5,Math.min(6,hit.z))};}
  rebuildTown(p:Profile){
    while(this.pads.children.length){const old=this.pads.children[0];old.traverse(n=>{if(n instanceof T.Mesh)n.geometry.dispose();});this.pads.remove(old);}
    [RUN_PAD,...SHOP_PADS].forEach((pad,i)=>{const cost=i?price(p,i-1):0;const color=i===0?'#c29643':cost!==null&&cost<=p.wallet?'#3e927c':'#73898b';this.box(this.pads,pad.x,.06,pad.z,1.65,.12,1.65,color);const label=this.sign(i===0?'▶ RUN':cost===null?'—':String(cost),color,1.6,1.25);label.rotation.x=-Math.PI/2;label.position.set(pad.x,.13,pad.z);this.pads.add(label);});
    this.shopGroups.forEach((g,i)=>{while(g.children.length){const o=g.children[0];o.traverse(n=>{if(n instanceof T.Mesh)n.geometry.dispose();});g.remove(o);}const level=p.levels[i];const s=SHOPS[i];
      if(!level){this.box(g,0,.04,0,3,.08,3,'#b7b8a7');for(const x of [-1.3,1.3])this.box(g,x,.3,1.1,.12,.6,.12,'#647f79');const sign=this.sign(`${s.short} · PLOT`,'#536e74',2.5,.7);sign.position.set(0,.7,1.1);g.add(sign);return;}
      this.box(g,0,1,0,3,2,2.8,'#f2e7cf');this.box(g,0,2.1,0,3.25,.22,3,SHOPS[i].color);this.box(g,0,.9,1.43,2.5,1,.06,'#527780');
      this.box(g,0,1.62,1.65,3.2,.16,.7,SHOPS[i].color);for(let a=0;a<8;a++)this.box(g,-1.4+a*.4,1.56,1.8,.2,.1,.6,'#f3e8cd');
      const sign=this.sign(`${s.short}${level>1?' ★'.repeat(level-1):''}`,s.color,2.7,.65);sign.position.set(0,2.53,1.48);g.add(sign);
      for(const x of [-.95,.95]){this.box(g,x,.37,1.9,.42,.12,.42,s.color);this.box(g,x,.17,1.9,.08,.35,.08,'#475d64');}
      this.box(g,0,.45,1.75,.7,.85,.45,'#cfb48c');if(i===0){const cup=new T.Mesh(new T.CylinderGeometry(.14,.1,.24,12),this.mat('#faf2df'));cup.position.set(0,.99,1.8);g.add(cup);}else if(i===1){for(let j=0;j<3;j++){const cookie=new T.Mesh(new T.CylinderGeometry(.12,.12,.06,12),this.mat('#c68e50'));cookie.position.set((j-1)*.18,.94,1.8);g.add(cookie);}}else{for(let j=0;j<4;j++){const burger=new T.Mesh(new T.CylinderGeometry(.24,.24,.08,12),this.mat(['#e8b46d','#5c8c4b','#704539','#e8b46d'][j]));burger.position.set(0,.92+j*.07,1.8);g.add(burger);}} if(level>1)this.box(g,1.8,.7,.9,.7,.12,.7,s.color);if(level>2)this.box(g,1.8,1.3,.9,.1,1.2,.1,'#f4de9c');
    });
  }
  makeCoin():Coin {const mesh=new T.Group();const body=new T.Mesh(this.coinGeo,this.gold);mesh.add(body);const rim=new T.Mesh(this.rimGeo,this.rim);rim.rotation.x=-Math.PI/2;rim.position.y=.035;mesh.add(rim);this.scene.add(mesh);const c={mesh,target:new T.Vector3(),delay:0,flying:false,velocity:new T.Vector3(),age:0,payment:false,start:new T.Vector3()};this.coins.push(c);return c;}
  acquire(){return this.coins.find(c=>!c.mesh.visible&&!this.active.includes(c))||this.makeCoin();}
  count(n:number,run:EnterpriseRun){const count=n===0?0:n<=32?n:Math.min(96,32+Math.ceil((n-32)/6));
    while(this.active.length>count){const c=this.active.pop()!;c.flying=true;c.payment=false;c.age=0;c.velocity.set((this.active.length%2?1:-1)*(4+this.active.length%3),4,-.5);}
    const old=this.active.length;
    while(this.active.length<count){const c=this.acquire();c.mesh.visible=true;c.flying=false;c.age=0;c.delay=(this.active.length-old)*.003;c.mesh.position.set(run.x+(this.active.length%2?1:-1)*1.1,.2,-2.5);this.active.push(c);}
  }
  rebuildGates(run:EnterpriseRun){while(this.gates.children.length){const o=this.gates.children[0];o.traverse(n=>{if(n instanceof T.Mesh)n.geometry.dispose();});this.gates.remove(o);}
    for(let row=run.row;row<Math.min(6,run.row+2);row++){const pair=run.pair(row);pair.forEach((gate,i)=>{const g=new T.Group();g.userData.at=5+row*5;g.position.x=i?1.7:-1.7;const good=gate.op==='+'||gate.op==='×';const color=good?'#258bc5':'#c65455';this.box(g,-1.48,1.05,0,.13,2.1,.2,color);this.box(g,1.48,1.05,0,.13,2.1,.2,color);const label=this.sign(gateText(gate),color,3.15,1.65);label.position.y=2;g.add(label);this.gates.add(g);});}
  }
  resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.gl.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  render(run:EnterpriseRun,p:Profile,mode:'run'|'town',dt:number,payment:number,shop:number,keepFraction=0,walk?:BusinessWalk){
    this.clock+=dt;const key=p.levels.join(',')+':'+p.wallet;if(key!==this.levelKey){this.rebuildTown(p);this.levelKey=key;}
    const phase=payment>0?'pay':mode==='town'?'town':run.state==='finish'?'finish':'run';if(phase!==this.phase){this.phase=phase;this.phaseTime=0;this.payInitial=this.active.length;this.payKeep=Math.floor(this.payInitial*keepFraction);}else this.phaseTime+=dt;
    const town=phase!=='run';this.road.visible=!town;this.town.visible=town;this.gates.visible=!town;
    if(!town){if(this.seen!==run.row||!this.gates.children.length){this.rebuildGates(run);this.seen=run.row;}this.gates.children.forEach(g=>g.position.z=-(g.userData.at-run.time)*4);this.pickups.visible=run.pickup<6;this.pickups.position.z=-(2.5+run.pickup*5-run.time)*4;
      if(this.lastCount!==run.coins){this.count(run.coins,run);this.lastCount=run.coins;}
      const cols=Math.min(5,Math.max(2,Math.ceil(Math.sqrt(this.active.length))));this.active.forEach((c,i)=>{c.target.set(run.x+((i%cols)-(cols-1)/2)*.57,.34,Math.floor(i/cols)*.43+.2);c.mesh.rotation.x=Math.PI/2;c.mesh.rotation.z=-this.clock*8;});
      this.camera.position.lerp(new T.Vector3(run.x*.12,5.3,8),this.reduced?1:.12);this.camera.lookAt(0,.4,-3.5);
    } else {
      const mx=phase==='finish'?-2:walk?.x??-2,mz=phase==='finish'?1:walk?.z??1;this.man.position.set(mx,walk?.moving&&phase!=='finish'?Math.sin(this.clock*16)*.045:0,mz);
      const count=phase==='finish'?Math.min(64,run.coins):phase==='pay'?this.payKeep+Math.ceil((this.payInitial-this.payKeep)*(1-payment)):Math.min(48,Math.ceil(p.wallet/5));
      while(this.active.length<count){const c=this.acquire();c.mesh.visible=true;c.flying=false;c.age=0;c.delay=0;c.mesh.position.set(-3,.4,5);this.active.push(c);}
      while(this.active.length>count){const c=this.active.pop()!;c.flying=phase==='pay';c.payment=c.flying;c.age=0;c.start.copy(c.mesh.position);c.velocity.set(3,.6,3-shop*4);if(!c.flying)c.mesh.visible=false;}
      this.active.forEach((c,i)=>{const t=Math.min(1,Math.max(0,(this.phaseTime-i*.008)/.24));const goal=new T.Vector3(mx+.95+(i%2-.5)*.36,1.83+Math.floor(i/4)*.045,mz+.4+(Math.floor(i/2)%2-.5)*.36);if(phase==='finish'&&t<1){c.target.set(T.MathUtils.lerp((i%7-3)*.35,goal.x,t),T.MathUtils.lerp(.2,goal.y,t)+Math.sin(t*Math.PI)*1.6,T.MathUtils.lerp(5+Math.floor(i/7)*.25,goal.z,t));}else c.target.copy(goal);c.mesh.rotation.set(0,this.clock*.1,0);});
      this.hand.position.x=mx+.95;this.hand.position.z=mz+.4;this.hand.position.y=1.7+(this.reduced?0:Math.sin(this.clock*25)*.012);this.customer.visible=p.levels.some(Boolean);this.customer.position.z=3-Math.sin(this.clock*.5)*2;this.shopGroups.forEach((g,i)=>{g.scale.y=phase==='pay'&&i===shop?.05+.95*Math.min(1,payment*1.6):1;});
      this.camera.position.lerp(phase==='finish'?new T.Vector3(3,5.3,10):new T.Vector3(0,16,15),this.reduced?1:.1);this.camera.lookAt(phase==='finish'?-1:0,1,phase==='finish'?1:0);
    }
    this.coins.forEach(c=>{if(!c.mesh.visible)return;if(c.flying){if(this.reduced){c.mesh.visible=false;return;}c.age+=dt;if(c.payment){const t=Math.min(1,c.age/.2);c.mesh.position.lerpVectors(c.start,c.velocity,t);c.mesh.position.y+=Math.sin(t*Math.PI)*.7;c.mesh.rotation.z+=dt*5;if(t===1)c.mesh.visible=false;return;}c.velocity.y-=15*dt;c.mesh.position.addScaledVector(c.velocity,dt);c.mesh.rotation.z+=dt*8;if(c.mesh.position.y < -6||c.age>1)c.mesh.visible=false;}else{c.delay-=dt;if(c.delay<=0)c.mesh.position.lerp(c.target,this.reduced?1:Math.min(1,dt*15));}});
    this.gl.render(this.scene,this.camera);
  }
  dispose(){this.observer.disconnect();const geometries=new Set<T.BufferGeometry>();this.scene.traverse(o=>{if(o instanceof T.Mesh)geometries.add(o.geometry);});geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());this.textures.forEach(t=>t.dispose());this.gold.dispose();this.rim.dispose();this.gl.dispose();this.gl.domElement.remove();}
}
