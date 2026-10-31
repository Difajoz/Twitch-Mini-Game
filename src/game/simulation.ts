export type RunState = 'ready' | 'running' | 'paused' | 'over';
export type Action = 'left' | 'right' | 'jump' | 'slide';
export type HazardKind = 'barrier' | 'arch' | 'block' | 'gap';
export type Hazard = { id: number; lane: number; at: number; kind: HazardKind };
export type Token = { id: number; lane: number; at: number; collected: boolean };
export const TUNE = {
  step: 1 / 120, laneWidth: 2.5, laneSeconds: .16, jumpVelocity: 8.8, gravity: 24,
  slideSeconds: .8, bufferSeconds: .12, startSpeed: 18, maxSpeed: 30,
  acceleration: .24, opening: 96, rowSpacing: 64, horizon: 220,
} as const;
export type Snapshot = { state: RunState; distance: number; tokens: number; score: number; speed: number; reason: string };

// Each authored row has a bypass route. Rows are separated by two seconds at
// maximum speed, exceeding the full two-lane crossing + action recovery time.
// Cross-row feasibility is verified with the actual simulation in tests.
export function createRow(index: number, seed: number): { hazards: Hazard[]; tokens: Token[]; safe: number } {
  let n = (Math.imul(index + 1, 1664525) + seed * 1013904223) >>> 0;
  n = (n ^ (n >>> 13)) >>> 0;
  const safe = n % 3 - 1;
  const kinds: HazardKind[] = ['barrier', 'block', 'arch', 'gap'];
  const kind = kinds[index < 4 ? index : (n >>> 3) % 4];
  const at = TUNE.opening + index * TUNE.rowSpacing;
  const lanes = [-1, 0, 1].filter(l => l !== safe);
  const blocked = index < 4 ? lanes.slice(0, 1) : lanes;
  return {
    safe,
    hazards: blocked.map((lane, i) => ({ id: index * 4 + i, lane, at, kind })),
    tokens: Array.from({ length: 5 }, (_, i) => ({ id: index * 8 + i, lane: safe, at: at - 10 + i * 4, collected: false })),
  };
}

export class Simulation {
  state: RunState = 'ready';
  distance = 0; speed: number = TUNE.startSpeed; lane = 0; x = 0;
  y = 0; velocityY = 0; slide = 0; time = 0; tokens = 0; reason = '';
  shield = false; shieldEarned = false; protectedUntil = 0;
  hazards: Hazard[] = []; collectibles: Token[] = [];
  private nextRow = 0;
  private buffered: { action: 'jump' | 'slide'; until: number } | null = null;
  constructor(public seed = 17) { this.extend(); }
  get score() { return Math.floor(this.distance) + this.tokens * 25; }
  snapshot(): Snapshot { return { state: this.state, distance: this.distance, tokens: this.tokens, score: this.score, speed: this.speed, reason: this.reason }; }
  start() { if (this.state === 'ready') this.state = 'running'; }
  pause() { if (this.state === 'running') this.state = 'paused'; }
  resume() { if (this.state === 'paused') this.state = 'running'; }
  input(action: Action) {
    if (this.state !== 'running') return;
    if (action === 'left' || action === 'right') {
      this.lane = Math.max(-1, Math.min(1, this.lane + (action === 'left' ? -1 : 1)));
    } else {
      this.buffered = { action, until: this.time + TUNE.bufferSeconds };
      this.applyAction();
    }
  }
  private applyAction() {
    if (!this.buffered || this.buffered.until < this.time) { this.buffered = null; return; }
    if (this.y > .001) return;
    if (this.buffered.action === 'jump') { this.slide = 0; this.velocityY = TUNE.jumpVelocity; }
    else this.slide = TUNE.slideSeconds;
    this.buffered = null;
  }
  private extend() {
    while (TUNE.opening + this.nextRow * TUNE.rowSpacing < this.distance + TUNE.horizon) {
      const row = createRow(this.nextRow++, this.seed);
      this.hazards.push(...row.hazards); this.collectibles.push(...row.tokens);
    }
    this.hazards = this.hazards.filter(h => h.at > this.distance - 15);
    this.collectibles = this.collectibles.filter(t => t.at > this.distance - 15);
  }
  step(dt = TUNE.step) {
    if (this.state !== 'running') return;
    // Host advances using fixed steps; bound direct callers as well.
    dt = Math.min(dt, 1 / 30);
    this.time += dt; this.applyAction();
    this.speed = Math.min(TUNE.maxSpeed, this.speed + TUNE.acceleration * dt);
    this.distance += this.speed * dt;
    const difference = this.lane * TUNE.laneWidth - this.x;
    this.x += Math.sign(difference) * Math.min(Math.abs(difference), TUNE.laneWidth / TUNE.laneSeconds * dt);
    if (this.velocityY !== 0 || this.y > 0) {
      this.y = Math.max(0, this.y + this.velocityY * dt - .5 * TUNE.gravity * dt * dt);
      this.velocityY -= TUNE.gravity * dt;
      if (this.y === 0) this.velocityY = 0;
    }
    this.slide = Math.max(0, this.slide - dt);
    for (const h of this.hazards) {
      if (Math.abs(h.at - this.distance) > (h.kind === 'gap' ? 1.8 : .8) + .26) continue;
      if (Math.abs(h.lane * TUNE.laneWidth - this.x) > .94) continue;
      const hit = h.kind === 'barrier' ? this.y < .92 : h.kind === 'arch' ? this.y + (this.slide > 0 ? .68 : 1.65) > 1.08 : h.kind === 'gap' ? this.y < .18 : true;
      if (hit) {
        if (this.time < this.protectedUntil) continue;
        if (this.shield) { this.shield = false; this.protectedUntil = this.time + .6; continue; }
        this.state = 'over';
        this.reason = { barrier: 'Jump over the low barriers.', arch: 'Slide under the striped arches.', block: 'Change lanes around the cargo.', gap: 'Jump across the rooftop gaps.' }[h.kind];
        break;
      }
    }
    if (this.state === 'running') for (const t of this.collectibles) {
      if (!t.collected && Math.abs(t.at - this.distance) < .65 && Math.abs(t.lane * TUNE.laneWidth - this.x) < .8 && this.y < 2) { t.collected = true; this.tokens++; }
    }
    if (!this.shieldEarned && this.tokens >= 10) { this.shieldEarned = true; this.shield = true; }
    this.extend();
  }
}
