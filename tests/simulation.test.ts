import test from 'node:test';
import assert from 'node:assert/strict';
import { Simulation, TUNE, createRow, type HazardKind } from '../src/game/simulation';

function advance(sim: Simulation, seconds: number) { for (let i = 0; i < seconds / TUNE.step; i++) sim.step(); }
function isolated(kind: HazardKind, distance = 7) {
  const sim = new Simulation(); sim.speed = 12; sim.hazards = [{ id: -1, lane: 0, at: distance, kind }]; sim.collectibles = []; sim.start(); return sim;
}
test('ready and paused states freeze simulation; resume is deliberate', () => {
  const sim = new Simulation(); advance(sim, 2); assert.equal(sim.distance, 0);
  sim.start(); advance(sim, 1); sim.pause(); const position = sim.distance;
  advance(sim, 10); sim.input('right'); assert.equal(sim.distance, position); assert.equal(sim.lane, 0);
  sim.resume(); advance(sim, 1); assert.ok(sim.distance > position);
});
test('lanes clamp and remain responsive during a jump or slide', () => {
  const sim = new Simulation(); sim.start(); sim.input('jump'); sim.input('left'); advance(sim, .2);
  assert.equal(sim.x, -TUNE.laneWidth); assert.ok(sim.y > 0);
  sim.input('left'); assert.equal(sim.lane, -1); advance(sim, .8);
  sim.input('slide'); sim.input('right'); advance(sim, .2);
  assert.equal(sim.x, 0); assert.ok(sim.slide > 0);
});
for (const kind of ['barrier', 'arch', 'block', 'gap'] as const) {
  test(`${kind}: collision ends a run, no repeated scoring after death`, () => {
    const sim = isolated(kind); advance(sim, 1); assert.equal(sim.state, 'over');
    const score = sim.score; advance(sim, 3); assert.equal(sim.score, score);
  });
}
test('jump clears barrier and gap; slide clears arch', () => {
  for (const kind of ['barrier', 'gap', 'arch'] as const) {
    const sim = isolated(kind); advance(sim, .22); sim.input(kind === 'arch' ? 'slide' : 'jump'); advance(sim, .65);
    assert.equal(sim.state, 'running', kind);
  }
});
test('jump and slide windows also work at the maximum speed', () => {
  for (const speed of [12, 18, TUNE.maxSpeed]) for (const kind of ['barrier', 'gap', 'arch'] as const) {
    const sim = isolated(kind, 20); sim.speed = speed;
    while (sim.distance < 20 - speed * .36) sim.step();
    sim.input(kind === 'arch' ? 'slide' : 'jump');
    while (sim.distance < 23 && sim.state === 'running') sim.step();
    assert.equal(sim.state, 'running', `${kind}, speed ${speed}`);
  }
});
test('lane changes dodge solid blockers and jump cannot pass through them', () => {
  const sim = isolated('block'); sim.input('right'); advance(sim, 1); assert.equal(sim.state, 'running');
  const jumping = isolated('block'); jumping.input('jump'); advance(jumping, 1); assert.equal(jumping.state, 'over');
});
test('buffer near landing accepts jump, early airborne request expires', () => {
  const sim = new Simulation(); sim.start(); sim.input('jump'); advance(sim, .65); sim.input('jump'); advance(sim, .16);
  assert.ok(sim.velocityY > 0);
  const early = new Simulation(); early.start(); early.input('jump'); advance(early, .2); early.input('jump'); advance(early, .7);
  assert.equal(early.y, 0);
});
test('collectibles are awarded once and score is distance + 25 per token', () => {
  const sim = new Simulation(); sim.collectibles = [{ id: -1, lane: 0, at: 2, collected: false }]; sim.start(); advance(sim, .4);
  assert.equal(sim.tokens, 1); assert.equal(sim.score, Math.floor(sim.distance) + 25);
  const retry = new Simulation(); assert.equal(retry.tokens, 0); assert.equal(retry.score, 0);
});
test('ten tokens award exactly one shield; impact consumes it and a later impact ends the run', () => {
  const sim = isolated('block', 7); sim.tokens = 10; sim.step(); assert.equal(sim.shield, true);
  advance(sim, .7); assert.equal(sim.state, 'running'); assert.equal(sim.shield, false);
  sim.hazards.push({ id: -2, kind: 'block', lane: 0, at: 22 }); advance(sim, 2);
  assert.equal(sim.state, 'over'); assert.equal(sim.shield, false);
  assert.equal(new Simulation().shieldEarned, false);
});
test('same fixed steps yield the same result under 30, 60 and 144 Hz rendering', () => {
  const run = (hz: number) => {
    const sim = new Simulation(); sim.start(); let accumulator = 0;
    for (let frame = 0; frame < hz * 4; frame++) { accumulator += 1 / hz; while (accumulator >= TUNE.step - 1e-10) { sim.step(); accumulator -= TUNE.step; } }
    return sim.snapshot();
  };
  assert.deepEqual(run(30), run(60)); assert.deepEqual(run(60), run(144));
});
test('generated cross-row routes survive at maximum speed using real lane transitions', () => {
  for (let seed = 0; seed < 64; seed++) {
    const sim = new Simulation(seed); sim.start(); sim.speed = TUNE.maxSpeed;
    let row = 0;
    while (sim.distance < 5000 && sim.state === 'running') {
      if (sim.distance > TUNE.opening + row * TUNE.rowSpacing + 3) row++;
      const pattern = createRow(row, seed);
      if (sim.distance > TUNE.opening + row * TUNE.rowSpacing - 30) {
        if (sim.lane < pattern.safe) sim.input('right'); else if (sim.lane > pattern.safe) sim.input('left');
      }
      sim.step();
      assert.equal(sim.state, 'running', `seed ${seed}, row ${row}, distance ${sim.distance}`);
    }
    assert.ok(sim.hazards.length <= 10); assert.ok(sim.collectibles.length <= 25);
  }
});
test('guided trails avoid hazardous lanes and rows allow enough reaction time', () => {
  assert.ok(TUNE.rowSpacing / TUNE.maxSpeed > TUNE.laneSeconds * 2 + TUNE.slideSeconds + .5);
  for (let seed = 0; seed < 30; seed++) for (let row = 0; row < 200; row++) {
    const pattern = createRow(row, seed);
    assert.ok(pattern.tokens.every(token => !pattern.hazards.some(h => h.lane === token.lane)));
  }
});
