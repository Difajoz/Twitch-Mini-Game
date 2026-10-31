import * as THREE from 'three';
import { Simulation, TUNE, type HazardKind } from './simulation';

export class RunnerRenderer {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(58, 1, .1, 210);
  private renderer: THREE.WebGLRenderer;
  private avatar = new THREE.Group();
  private torso = new THREE.Group();
  private limbs: THREE.Group[] = [];
  private tiles: THREE.Mesh[] = [];
  private buildings: THREE.Group[] = [];
  private objects = new Map<string, THREE.Group>();
  private pools = new Map<string, THREE.Group[]>();
  private seed = -1;
  private geometry = new Map<string, THREE.BufferGeometry>();
  private materials = new Map<string, THREE.MeshStandardMaterial>();
  private observer: ResizeObserver;
  private canvasLost: (e: Event) => void;
  constructor(private host: HTMLElement, onLost: () => void) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor('#d6a3a0');
    this.scene.fog = new THREE.Fog('#d6a3a0', 50, 175);
    this.host.appendChild(this.renderer.domElement);
    this.canvasLost = e => { e.preventDefault(); onLost(); };
    this.renderer.domElement.addEventListener('webglcontextlost', this.canvasLost);
    this.scene.add(new THREE.HemisphereLight('#fff4dd', '#5b6277', 2.8));
    const sunLight = new THREE.DirectionalLight('#fff1c5', 3.2);
    sunLight.position.set(-12, 24, 10); this.scene.add(sunLight);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(11, 24, 16), new THREE.MeshBasicMaterial({ color: '#ffdab1' }));
    sun.position.set(-25, 22, -140); this.scene.add(sun);
    // Recycled three-lane rooftop tiles; gaps hide the corresponding tile.
    for (let i = 0; i < 52; i++) for (let lane = -1; lane <= 1; lane++) {
      const tile = this.box(2.46, .45, 4, (i % 5 === 0) ? '#3f5964' : '#38515c');
      tile.position.set(lane * TUNE.laneWidth, -.25, -i * 4);
      tile.userData = { index: i, lane }; this.tiles.push(tile); this.scene.add(tile);
    }
    for (let i = 0; i < 35; i++) {
      const group = new THREE.Group();
      const height = 6 + this.noise(i) * 24;
      const width = 6 + this.noise(i + 2) * 6;
      const body = this.box(width, height, 9, ['#5e6c83', '#718395', '#8c8292', '#a38995'][i % 4]);
      body.position.y = height / 2 - 16; group.add(body);
      const roof = this.box(width + .4, .45, 9.5, '#b6a0a5'); roof.position.y = height - 16; group.add(roof);
      for (let w = 0; w < 3; w++) {
        const window = this.box(.65, .9, .06, '#efbd89'); window.position.set((w - 1) * 1.8, height - 19, 4.55); group.add(window);
      }
      if (i % 3 === 0) {
        const tank = new THREE.Mesh(this.cylinder(1.2, 1.2, 2), this.mat('#d6b6a6')); tank.position.y = height - 14.8; group.add(tank);
      }
      group.position.set((i % 2 ? 1 : -1) * (11 + this.noise(i + 5) * 12), 0, -i * 6);
      group.userData.index = i; this.buildings.push(group); this.scene.add(group);
    }
    for (let side = -1; side <= 1; side += 2) {
      const edge = this.box(.22, .4, 205, '#e5a378'); edge.position.set(side * 3.94, -.03, -96); this.scene.add(edge);
    }
    this.makeCharacter(); this.scene.add(this.avatar);
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(.67, 24), new THREE.MeshBasicMaterial({ color: '#172d38', transparent: true, opacity: .35, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = .015; shadow.name = 'shadow'; this.scene.add(shadow);
    this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(host); this.resize();
  }
  private noise(n: number) { return (Math.sin(n * 127.1 + 31.7) * 43758.5453) % 1 * .5 + .5; }
  private mat(color: string, glow = false) {
    const key = color + glow;
    if (!this.materials.has(key)) this.materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: .8, emissive: glow ? color : '#000000', emissiveIntensity: glow ? .35 : 0 }));
    return this.materials.get(key)!;
  }
  private box(w: number, h: number, d: number, color: string) {
    const key = `${w},${h},${d}`;
    if (!this.geometry.has(key)) this.geometry.set(key, new THREE.BoxGeometry(w, h, d));
    return new THREE.Mesh(this.geometry.get(key)!, this.mat(color));
  }
  private cylinder(a: number, b: number, h: number) {
    const key = `c${a},${b},${h}`;
    if (!this.geometry.has(key)) this.geometry.set(key, new THREE.CylinderGeometry(a, b, h, 10));
    return this.geometry.get(key)!;
  }
  private makeCharacter() {
    // Original geometric human: teal jacket, cream cap, coral satchel.
    const hips = this.box(.57, .32, .38, '#243b51'); hips.position.y = .7; this.torso.add(hips);
    const jacket = this.box(.72, .62, .44, '#70ded0'); jacket.position.y = 1.08; this.torso.add(jacket);
    const stripe = this.box(.74, .12, .46, '#e8f1d7'); stripe.position.y = .91; this.torso.add(stripe);
    const head = this.box(.44, .43, .43, '#d59a78'); head.position.y = 1.6; this.torso.add(head);
    const cap = this.box(.5, .17, .51, '#f9e7c6'); cap.position.y = 1.85; this.torso.add(cap);
    const brim = this.box(.48, .05, .25, '#f9e7c6'); brim.position.set(0, 1.79, -.32); this.torso.add(brim);
    const bag = this.box(.42, .48, .21, '#ee8267'); bag.position.set(0, 1.12, .32); this.torso.add(bag);
    const buckle = this.box(.15, .11, .03, '#f9d884'); buckle.position.set(0, 1.15, .44); this.torso.add(buckle);
    for (let i = 0; i < 4; i++) {
      const limb = new THREE.Group(); const leg = i < 2;
      limb.position.set((i % 2 ? 1 : -1) * (leg ? .19 : .47), leg ? .68 : 1.3, 0);
      const part = this.box(leg ? .24 : .19, leg ? .57 : .52, .24, leg ? '#243b51' : '#70ded0'); part.position.y = -.24; limb.add(part);
      const end = this.box(leg ? .28 : .17, .15, leg ? .4 : .2, leg ? '#fae7cb' : '#d59a78'); end.position.set(0, -.52, leg ? -.06 : 0); limb.add(end);
      this.torso.add(limb); this.limbs.push(limb);
    }
    this.avatar.add(this.torso);
  }
  private hazard(kind: HazardKind) {
    const group = new THREE.Group();
    if (kind === 'barrier') {
      const beam = this.box(1.68, .85, 1.05, '#e99555'); beam.position.y = .425; group.add(beam);
      for (let i = -1; i <= 1; i++) { const stripe = this.box(.18, .8, 1.08, '#ffe9ba'); stripe.position.set(i * .46, .44, 0); stripe.rotation.z = -.24; group.add(stripe); }
    } else if (kind === 'arch') {
      for (const side of [-1, 1]) { const post = this.box(.18, 2.5, 1.15, '#dfad68'); post.position.set(side * .93, 1.25, 0); group.add(post); }
      const top = this.box(2.05, 1.35, 1.15, '#dfad68'); top.position.y = 1.755; group.add(top);
      const stripe = this.box(2.08, .18, 1.18, '#ffe9ba'); stripe.position.y = 1.25; group.add(stripe);
      const arrow = this.box(.7, .12, 1.2, '#a55945'); arrow.position.y = 1.64; group.add(arrow);
    } else if (kind === 'block') {
      const crate = this.box(1.8, 2.5, 1.5, '#6c92a7'); crate.position.y = 1.25; group.add(crate);
      for (const x of [-.65, .65]) { const stripe = this.box(.14, 2.54, 1.54, '#c3d4cf'); stripe.position.set(x, 1.25, 0); group.add(stripe); }
      const lid = this.box(1.94, .17, 1.64, '#b7c5c2'); lid.position.y = 2.48; group.add(lid);
    } else {
      for (const z of [-1.9, 1.9]) { const lip = this.box(2.38, .12, .15, '#ffc080'); lip.position.set(0, .02, z); group.add(lip); }
      const dark = this.box(2.45, .05, 3.7, '#182938'); dark.position.y = -.75; group.add(dark);
    }
    return group;
  }
  private token() {
    const key = 'token';
    if (!this.geometry.has(key)) this.geometry.set(key, new THREE.TorusGeometry(.24, .085, 6, 12));
    const group = new THREE.Group(); const mesh = new THREE.Mesh(this.geometry.get(key)!, this.mat('#ffe093', true)); group.add(mesh); return group;
  }
  resize() {
    const width = this.host.clientWidth, height = this.host.clientHeight;
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.fov = width / height < .7 ? 65 : 58;
    this.camera.updateProjectionMatrix(); this.renderer.setSize(width, height);
  }
  render(sim: Simulation, elapsed: number) {
    if (this.seed !== sim.seed) { for (const object of this.objects.values()) this.recycle(object); this.objects.clear(); this.seed = sim.seed; }
    const distance = sim.distance;
    this.tiles.forEach(tile => {
      const index = tile.userData.index as number;
      const at = Math.floor((distance - 12) / 208) * 208 + index * 4;
      const corrected = at < distance - 12 ? at + 208 : at;
      tile.position.z = distance - corrected;
      tile.visible = !sim.hazards.some(h => h.kind === 'gap' && h.lane === tile.userData.lane && Math.abs(h.at - corrected) < 2);
    });
    this.buildings.forEach(b => { b.position.z = 16 - ((b.userData.index * 6 + distance * .75) % 210); });
    const visible = new Set<string>();
    for (const h of sim.hazards) {
      if (h.at < distance - 8) continue;
      const key = `h${h.id}`; visible.add(key);
      if (!this.objects.has(key)) { const obj = this.take(h.kind); this.objects.set(key, obj); this.scene.add(obj); }
      this.objects.get(key)!.position.set(h.lane * TUNE.laneWidth, 0, distance - h.at);
    }
    for (const t of sim.collectibles) {
      if (t.collected || t.at < distance - 8) continue;
      const key = `t${t.id}`; visible.add(key);
      if (!this.objects.has(key)) { const obj = this.take('token'); this.objects.set(key, obj); this.scene.add(obj); }
      const obj = this.objects.get(key)!; obj.position.set(t.lane * TUNE.laneWidth, 1 + Math.sin(elapsed * 3 + t.id) * .08, distance - t.at); obj.rotation.y = elapsed * 2;
    }
    for (const [key, object] of this.objects) if (!visible.has(key)) { this.recycle(object); this.objects.delete(key); }
    const running = sim.state === 'running';
    const phase = running ? sim.time * 15 : 0;
    this.avatar.position.set(sim.x, sim.y, 0);
    this.torso.scale.y = sim.slide > 0 ? .38 : 1;
    this.torso.rotation.x = sim.slide > 0 ? -.25 : -.07;
    this.avatar.rotation.z = 0;
    this.limbs.forEach((limb, i) => { limb.rotation.x = sim.slide > 0 ? (i < 2 ? -1 : .5) : Math.sin(phase + (i % 2 ? Math.PI : 0)) * (i < 2 ? .75 : -.65) * (sim.y > 0 ? .25 : 1); });
    this.scene.getObjectByName('shadow')!.position.x = sim.x;
    this.camera.position.set(0, 4.8, 9.6);
    this.camera.lookAt(0, 1.1, -20);
    this.renderer.render(this.scene, this.camera);
  }
  private take(kind: HazardKind | 'token') {
    const obj = this.pools.get(kind)?.pop() || (kind === 'token' ? this.token() : this.hazard(kind));
    obj.userData.kind = kind; obj.rotation.set(0, 0, 0); return obj;
  }
  private recycle(object: THREE.Group) {
    this.scene.remove(object); const kind = object.userData.kind as string;
    if (!this.pools.has(kind)) this.pools.set(kind, []);
    this.pools.get(kind)!.push(object);
  }
  dispose() {
    this.observer.disconnect(); this.renderer.domElement.removeEventListener('webglcontextlost', this.canvasLost);
    const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>();
    this.scene.traverse(obj => { if (obj instanceof THREE.Mesh) { geometries.add(obj.geometry); (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => materials.add(m)); } });
    this.geometry.forEach(g => geometries.add(g)); this.materials.forEach(m => materials.add(m));
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
    this.renderer.dispose(); this.renderer.domElement.remove(); this.objects.clear();
  }
}
