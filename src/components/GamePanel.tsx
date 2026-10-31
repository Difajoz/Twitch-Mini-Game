'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Simulation, TUNE, type Action, type Snapshot } from '@/game/simulation';
import { RunnerRenderer } from '@/game/renderer';
import { startMusic } from '@/game/music';

type Props = { open: boolean; best: number; muted: boolean; onBest: (score: number) => void; onClose: () => void; onMute: () => void; };
export default function GamePanel({ open, best, muted, onBest, onClose, onMute }: Props) {
  const panel = useRef<HTMLElement>(null), viewport = useRef<HTMLDivElement>(null);
  const sim = useRef(new Simulation());
  const live = useRef({ open, muted, onBest });
  const [snapshot, setSnapshot] = useState<Snapshot>(sim.current.snapshot());
  const [error, setError] = useState('');
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!open || muted || snapshot.state !== 'running' || !audio.current) return;
    void audio.current.resume(); return startMusic(audio.current);
  }, [open, muted, snapshot.state]);
  const toggleSound = () => { try { audio.current ??= new AudioContext(); void audio.current.resume(); } catch {} onMute(); };
  useEffect(() => { live.current = { open, muted, onBest }; }, [open, muted, onBest]);
  const refresh = useCallback(() => setSnapshot(sim.current.snapshot()), []);
  const pause = useCallback(() => { sim.current.pause(); refresh(); }, [refresh]);
  useEffect(() => { if (!open) pause(); }, [open, pause]);
  const tone = (frequency: number) => {
    if (live.current.muted) return;
    try {
      audio.current ??= new AudioContext();
      void audio.current.resume();
      const oscillator = audio.current.createOscillator(), gain = audio.current.createGain();
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, audio.current.currentTime);
      gain.gain.setValueAtTime(.035, audio.current.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.current.currentTime + .12);
      oscillator.connect(gain); gain.connect(audio.current.destination); oscillator.start(); oscillator.stop(audio.current.currentTime + .12);
    } catch { /* Audio is optional. */ }
  };
  useEffect(() => {
    if (!viewport.current) return;
    let renderer: RunnerRenderer;
    try { renderer = new RunnerRenderer(viewport.current, () => { pause(); setError('The graphics context was interrupted. Reload the page to restore the game.'); }); }
    catch { setError('3D graphics are unavailable. Enable hardware acceleration or try a browser with WebGL support.'); return; }
    let frame = 0, last = 0, accumulated = 0, lastUi = 0, lastTokens = 0, previous = sim.current.state;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!live.current.open) { last = now; accumulated = 0; return; }
      const elapsed = last ? (now - last) / 1000 : 0; last = now;
      if (elapsed > .25) { sim.current.pause(); accumulated = 0; }
      else accumulated += elapsed;
      while (accumulated >= TUNE.step) { sim.current.step(); accumulated -= TUNE.step; }
      const current = sim.current;
      if (current.tokens > lastTokens) tone(740); lastTokens = current.tokens;
      if (current.state === 'over' && previous !== 'over') { live.current.onBest(current.score); tone(160); }
      previous = current.state;
      renderer.render(current, now / 1000);
      if (now - lastUi > 90) { refresh(); lastUi = now; }
    };
    frame = requestAnimationFrame(tick);
    const blur = () => pause();
    const visibility = () => { if (document.hidden) pause(); };
    window.addEventListener('blur', blur); document.addEventListener('visibilitychange', visibility);
    return () => { cancelAnimationFrame(frame); renderer.dispose(); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', visibility); if (audio.current) { void audio.current.close(); audio.current = null; } };
  }, [pause, refresh]);
  const begin = (restart = false) => {
    if (!muted) { try { audio.current ??= new AudioContext(); void audio.current.resume(); } catch {} }
    if (restart) sim.current = new Simulation((sim.current.seed + 1) % 10000);
    if (sim.current.state === 'paused') sim.current.resume(); else sim.current.start();
    refresh(); panel.current?.focus();
  };
  const keyboard = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return;
    const map: Record<string, Action> = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'jump', w: 'jump', ' ': 'jump', ArrowDown: 'slide', s: 'slide' };
    const action = map[event.key] || map[event.key.toLowerCase()];
    if (event.key === 'Escape') { event.preventDefault(); pause(); }
    if (action) { event.preventDefault(); if (!event.repeat) sim.current.input(action); }
  };
  const state = snapshot.state;
  return <section ref={panel} className="game-panel" tabIndex={0} aria-label="Skyline Sprint game. Use arrow keys or W A S D. Escape to pause." onKeyDown={keyboard}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) pause(); }}
    onPointerDown={event => { if (!(event.target instanceof HTMLElement && event.target.closest('button'))) panel.current?.focus(); }}>
    <div className="game-topbar"><div><span className="tiny-dot" /> SKYLINE SPRINT <span className="build-label">01</span></div><div className="game-tools">
      <button className="icon-button" title={muted ? 'Enable music and game sound' : 'Mute music and game sound'} aria-label={muted ? 'Turn game sound on' : 'Mute game sound'} onClick={toggleSound}>{muted ? <Speaker muted /> : <Speaker />}</button>
      <button className="icon-button" title="Pause game" aria-label="Pause game" disabled={state !== 'running'} onClick={pause}>Ⅱ</button>
      <button className="icon-button" title="Close game" aria-label="Close game" onClick={onClose}>×</button>
    </div></div>
    <div className="game-view">
      <div className="three-viewport" ref={viewport} aria-hidden="true" />
      <span className="shield-status">{sim.current.shield ? 'Shield ready' : sim.current.protectedUntil > sim.current.time ? 'Shield saved you' : ''}</span>
      <div className="game-hud"><div><span>DISTANCE</span><strong>{Math.floor(snapshot.distance).toLocaleString()}<small> m</small></strong></div><div className="token-count"><i>◇</i> {snapshot.tokens}</div></div>
      <div className="best-chip">BEST {best.toLocaleString()}</div>
      {(state !== 'running' || error) && <div className={`game-overlay ${state === 'ready' ? 'ready' : ''}`}>
        <div className="overlay-card">
          <span className="eyebrow">{error ? 'GRAPHICS UNAVAILABLE' : state === 'ready' ? 'YOUR NEXT LITTLE ADVENTURE' : state === 'paused' ? 'TAKE YOUR TIME' : 'ONE MORE RUN?'}</span>
          <h2>{error ? 'A quick pit stop.' : state === 'ready' ? <>Chase the<br />golden hour.</> : state === 'paused' ? 'On a breather.' : 'Nice run.'}</h2>
          <p>{error || (state === 'ready' ? 'Three lanes. Open rooftops. See how far you can go.' : state === 'paused' ? 'Your run is right where you left it.' : snapshot.reason)}</p>
          {state === 'over' && <div className="results"><div><strong>{snapshot.score.toLocaleString()}</strong><span>SCORE</span></div><div><strong>{Math.floor(snapshot.distance)}</strong><span>METERS</span></div><div><strong>{snapshot.tokens}</strong><span>TOKENS</span></div></div>}
          {!error && <button className="button mint" onClick={() => begin(state === 'over')}>{state === 'ready' ? 'Let’s run' : state === 'paused' ? 'Resume run' : 'Run again'} <span>↗</span></button>}
          {state === 'paused' && <button className="text-button light" onClick={() => begin(true)}>Start a new run</button>}
          {state === 'ready' && <div className="ready-controls"><span><kbd>←</kbd><kbd>→</kbd> dodge</span><span><kbd>↑</kbd> jump</span><span><kbd>↓</kbd> slide</span></div>}
        </div>
      </div>}
      {state === 'running' && <div className="running-hint">← → DODGE <b>·</b> ↑ JUMP <b>·</b> ↓ SLIDE</div>}
    </div>
    <div className="game-bottom"><span><span className="tiny-dot mint-dot" /> {state === 'running' ? 'Click here to focus · Esc to pause' : 'Solo run · best saved on this device'}</span></div>
  </section>;
}
function Speaker({ muted = false }: { muted?: boolean }) { return <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 4 5 7H2v6h3l4 3Z" />{muted ? <path d="m13 7 5 6m0-6-5 6" /> : <><path d="M12 6c3 2 3 6 0 8M15 3c5 4 5 10 0 14" /></>}</svg>; }
