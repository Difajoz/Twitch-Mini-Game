export type Gate = { op: '+' | '-' | '×' | '÷'; value: number };
export const gateText = (gate: Gate) => `${gate.op}${gate.value}`;
export const applyGate = (coins: number, gate: Gate) => Math.max(0, Math.floor(gate.op === '+' ? coins + gate.value : gate.op === '-' ? coins - gate.value : gate.op === '×' ? coins * gate.value : coins / gate.value));
export const GATES: [Gate, Gate][] = [
  [{ op: '×', value: 2 }, { op: '-', value: 20 }],
  [{ op: '+', value: 30 }, { op: '+', value: 10 }],
  [{ op: '×', value: 2 }, { op: '+', value: 30 }],
  [{ op: '-', value: 10 }, { op: '÷', value: 2 }],
  [{ op: '+', value: 60 }, { op: '+', value: 30 }],
  [{ op: '+', value: 40 }, { op: '-', value: 20 }],
];
export const SHOPS = [
  { name: 'Coffee House', short: 'COFFEE', cost: 250, bonus: 10, color: '#448e86', upgrades: [350, 700] },
  { name: 'Cookie Corner', short: 'COOKIES', cost: 750, bonus: 20, color: '#c48655', upgrades: [650, 1100] },
  { name: 'Burger Club', short: 'BURGERS', cost: 1800, bonus: 35, color: '#b85d51', upgrades: [1000, 1600] },
] as const;
export type Profile = { version: 1; wallet: number; levels: number[]; paid: string[]; runs: number; revision: number };
export const emptyProfile = (): Profile => ({ version: 1, wallet: 0, levels: [0, 0, 0], paid: [], runs: 0, revision: 0 });
export function parseProfile(raw: string | null): Profile {
  if (!raw) return emptyProfile();
  const p = JSON.parse(raw);
  if (p.version !== 1 || !Number.isSafeInteger(p.wallet) || p.wallet < 0 || p.wallet > 1e12 || !Array.isArray(p.levels) || p.levels.length !== 3 || !p.levels.every((v: number) => Number.isInteger(v) && v >= 0 && v <= 3) || !Array.isArray(p.paid) || !p.paid.every((s: unknown) => typeof s === 'string') || !Number.isSafeInteger(p.runs) || p.runs < 0 || !Number.isSafeInteger(p.revision) || p.revision < 0) throw new Error('Invalid saved city');
  return p;
}
export function settle(profile: Profile, id: string, coins: number) {
  if (!Number.isInteger(coins) || coins < 0 || coins > 600 || !id) throw new Error('Invalid run');
  if (profile.paid.includes(id)) return { profile, bonus: 0, total: 0 };
  const bonus = Math.min(Math.floor(coins / 4), profile.levels.reduce((sum, level, i) => sum + level * SHOPS[i].bonus, 0));
  const total = coins + bonus;
  return { profile: { ...profile, wallet: profile.wallet + total, paid: [...profile.paid, id], runs: profile.runs + 1, revision: profile.revision + 1 }, bonus, total };
}
export function price(profile: Profile, index: number): number | null {
  if (!Number.isInteger(index) || index < 0 || index >= SHOPS.length) return null;
  const level = profile.levels[index];
  if (level === 3 || (level === 0 && index > 0 && profile.levels[index - 1] === 0)) return null;
  return level === 0 ? SHOPS[index].cost : SHOPS[index].upgrades[level - 1];
}
export function purchase(profile: Profile, index: number): Profile {
  const cost = price(profile, index);
  if (cost === null || cost > profile.wallet) throw new Error('Purchase unavailable');
  const levels = [...profile.levels]; levels[index]++;
  return { ...profile, wallet: profile.wallet - cost, levels, revision: profile.revision + 1 };
}
export type EnterpriseState = 'ready' | 'running' | 'paused' | 'finish' | 'over';
export class EnterpriseRun {
  state: EnterpriseState = 'ready'; time = 0; coins = 20; lane = -1; x = -1.6; row = 0; pickup = 0;
  id = ''; events: { id: number; kind: 'gain' | 'loss'; before: number; after: number; label: string }[] = [];
  constructor(public round = 0) {}
  pair(index: number) { const pair = GATES[index]; return (this.round + index) % 2 && index > 0 ? [pair[1], pair[0]] : pair; }
  start(id: string) { this.id = id; this.state = 'running'; }
  move(side: number) { if (this.state === 'running') this.lane = side < 0 ? -1 : 1; }
  pause() { if (this.state === 'running') this.state = 'paused'; }
  change(amount: number, label: string) { const before = this.coins; this.coins = amount; this.events.push({ id: this.events.length, kind: amount >= before ? 'gain' : 'loss', before, after: amount, label }); if (!amount) this.state = 'over'; }
  step(dt: number) {
    if (this.state !== 'running') return;
    this.time += dt; this.x += (this.lane * 1.6 - this.x) * Math.min(1, dt * 14);
    if (this.pickup < 6 && this.time >= 2.5 + this.pickup * 5) { this.pickup++; this.change(this.coins + 10, '+10'); }
    if (this.row < 6 && this.time >= 5 + this.row * 5) { const gate = this.pair(this.row)[this.x < 0 ? 0 : 1]; this.row++; this.change(applyGate(this.coins, gate), gateText(gate)); }
    if (this.time >= 34 && this.state === 'running') this.state = 'finish';
  }
}
