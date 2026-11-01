'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Icon } from './Icons';

const GamePanel = dynamic(() => import('./GamePanel'), { ssr: false, loading: () => <div className="game-loading">Loading Skyline Sprint…</div> });
const EnterpriseGame = dynamic(() => import('./EnterpriseGame'), { ssr: false, loading: () => <div className="game-loading" role="status">Loading Pocket Enterprise…</div> });
const games = [
  { id: 'enterprise', name: 'Pocket Enterprise', genre: 'Runner · Tycoon', description: 'Run for coins. Build your little empire.' },
  { id: 'skyline', name: 'Skyline Sprint', genre: '3D Runner', description: 'Dodge, jump, and chase the skyline.' },
  { id: 'neon', name: 'Neon Drift', genre: 'Racing', description: 'Find your line through the neon city.' },
  { id: 'orbit', name: 'Orbit Breaker', genre: 'Arcade', description: 'Clear the field. Keep the ball alive.' },
  { id: 'rally', name: 'Pixel Rally', genre: 'Racing', description: 'One track. Every corner counts.' },
  { id: 'moon', name: 'Moon Hopper', genre: 'Platformer', description: 'Make the next leap into low gravity.' },
  { id: 'crystal', name: 'Crystal Match', genre: 'Puzzle', description: 'Line up gems and build your combo.' },
] as const;
export type GameId = typeof games[number]['id'];
type Props = { open: boolean; selected: GameId | null; best: number; muted: boolean; onSelect: (game: GameId) => void; onBest: (score: number) => void; onMute: () => void; onClose: () => void; onBack: () => void };

export default function MiniGames({ open, selected, best, muted, onSelect, onBest, onMute, onClose, onBack }: Props) {
  const [enterpriseMounted, setEnterpriseMounted] = useState(false);
  const [runnerMounted, setRunnerMounted] = useState(false);
  const choose = (id: GameId) => { if (id === 'enterprise') setEnterpriseMounted(true); if (id === 'skyline') setRunnerMounted(true); onSelect(id); };
  const game = games.find(game => game.id === selected);
  const playable = selected === 'skyline' || selected === 'enterprise';
  return <aside id="mini-games-sidebar" className={`mini-games-sidebar ${selected ? 'has-selection' : ''}`} hidden={!open} aria-label="Mini games sidebar">
    <header className="mini-games-header"><h2><Icon name="game" size={19} />Mini games</h2><button className="icon-button" aria-label="Close mini games" onClick={onClose}><Icon name="close" size={18} /></button></header>
    <div className="active-mini-game" hidden={!selected} aria-label="Selected game">
      <div className="selected-game-heading"><span>{playable ? 'NOW PLAYING' : 'GAME CONCEPT'}</span><button className="text-button" onClick={onBack}>All games</button></div>
      {/* Keep the real runner mounted and paused when switching games or closing the bar. */}
      <div className="runner-slot" hidden={selected !== 'skyline'}>{runnerMounted && <GamePanel open={open && selected === 'skyline'} best={best} muted={muted} onBest={onBest} onMute={onMute} onClose={onBack} />}</div>
      <div className="runner-slot" hidden={selected !== 'enterprise'}>{enterpriseMounted && <EnterpriseGame open={open && selected === 'enterprise'} />}</div>
      {selected !== 'skyline' && selected !== 'enterprise' && game && <section className="example-game" aria-label={`${game.name} visual concept`}>
        <div className="game-topbar"><strong>{game.name}</strong><button className="icon-button" aria-label="Close game" onClick={onBack}>×</button></div>
        <div className="example-game-view"><GameScene game={game.id} /><div className="example-hud"><span>{selected === 'crystal' ? 'MOVES  18' : selected === 'orbit' ? 'LEVEL  03' : selected === 'moon' ? 'ALTITUDE  240 m' : 'LAP  2 / 3'}</span><strong>{selected === 'crystal' ? '2,450' : selected === 'orbit' ? '1,280' : selected === 'moon' ? '860' : '00:42.68'}</strong></div></div>
        <div className="example-game-controls"><span>Visual concept · Gameplay not implemented</span></div>
      </section>}
    </div>
    <section className="mini-games-library" aria-label="Choose a mini game"><div className="library-heading"><h3>{selected ? 'Switch game' : 'Pick a game'}</h3><span>2 playable · 5 concepts</span></div><div className="mini-games-list">
      {games.map(game => <button key={game.id} className={`mini-game-card ${selected === game.id ? 'selected' : ''}`} onClick={() => choose(game.id)} aria-label={`Open ${game.name}${game.id === 'skyline' || game.id === 'enterprise' ? '' : ' concept'}`} aria-pressed={selected === game.id}>
        <span className="mini-game-cover"><GameScene game={game.id} /></span><span className="mini-game-copy"><strong>{game.name}{game.id !== 'skyline' && game.id !== 'enterprise' && <span className="concept-badge">Concept</span>}</strong><span>{game.genre}</span><small>{game.id === 'skyline' && best ? `Best: ${best.toLocaleString()}` : game.description}</small></span><span className="mini-game-play"><Icon name="right" size={18} /></span>
      </button>)}
    </div></section>
  </aside>;
}

// Original static in-game compositions for the five presentation examples.
// Skyline Sprint and Pocket Enterprise are playable; the examples have no game logic.
function GameScene({ game }: { game: GameId }) {
  const neon = game === 'neon';
  return <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <rect width="400" height="300" fill={game === 'crystal' ? '#191c36' : game === 'rally' ? '#718d62' : '#131d35'} />
    {game === 'enterprise' && <><rect width="400" height="300" fill="#b7d3dc" /><path d="M140 70H260L370 300H30Z" fill="#536d77" /><rect x="103" y="83" width="89" height="45" rx="4" fill="#258bc5"/><rect x="208" y="83" width="89" height="45" rx="4" fill="#c65455"/><text x="148" y="116" textAnchor="middle" fontSize="30" fill="white">×2</text><text x="252" y="116" textAnchor="middle" fontSize="30" fill="white">−20</text>{Array.from({length:18},(_,i)=><ellipse key={i} cx={145+i%4*30} cy={190+Math.floor(i/4)*20} rx="13" ry="16" fill="#edb845" stroke="#ffdf87" strokeWidth="3"/>)}</>}
    {game === 'skyline' && <>
      <rect width="400" height="200" fill="#cf9e99" /><circle cx="295" cy="70" r="35" fill="#ffe0af" />
      {[30, 90, 280, 340].map((x,i) => <rect key={x} x={x} y={80+i*15} width="45" height="160" fill={i%2 ? '#788192' : '#5e6d84'} />)}
      <path d="M165 125H235L345 300H55Z" fill="#38515c" /><path d="M188 125L160 300M212 125L240 300" stroke="#d5b093" strokeWidth="3" />
      {[170,200,230].map(x => <circle key={x} cx={x} cy="175" r="5" fill="#ffe093" />)}
      <rect x="187" y="211" width="26" height="33" rx="4" fill="#70ded0" /><rect x="191" y="194" width="18" height="18" fill="#f9e7c6" /><path d="M194 244L190 265M207 244L212 264" stroke="#243b51" strokeWidth="10" />
    </>}
    {(neon || game === 'rally') && <>
      {neon ? <>{[12,65,121,258,316,367].map((x,i) => <g key={x}><rect x={x} y={40+i%3*21} width="30" height="150" fill={i%2 ? '#2c244d' : '#233c55'} /><path d={`M${x+4} 80h22m-22 14h22m-22 14h22`} stroke={i%2 ? '#f26da9' : '#54cbd8'} strokeWidth="3" /></g>)}<circle cx="212" cy="70" r="26" fill="#ac4e82" /></> : <>{Array.from({length:18},(_,i) => <circle key={i} cx={i*31%400} cy={i*53%300} r="12" fill="#405e47" />)}<path d="M200 -20C35 35 335 70 209 145S70 220 190 320" fill="none" stroke="#ad9980" strokeWidth="105" /></>}
      {neon ? <><path d="M166 132H234L365 300H35Z" fill="#202737" /><path d="M166 132L35 300M234 132L365 300" stroke="#ff60b8" strokeWidth="4" /><path d="M200 145V160M200 175V201M200 225V270" stroke="#65deef" strokeWidth="3" /></> : <path d="M200 -20C35 35 335 70 209 145S70 220 190 320" fill="none" stroke="#424951" strokeWidth="76" strokeDasharray="600" />}
      <g transform={neon ? 'translate(173 212)' : 'translate(165 190) rotate(18 26 35)'}><rect x="-5" y="12" width="10" height="18" rx="3" fill="#0a101a" /><rect x="47" y="12" width="10" height="18" rx="3" fill="#0a101a" /><rect width="52" height="74" rx="12" fill={neon ? '#bb64e1' : '#f6b849'} /><path d="M9 14H43L46 37H6Z" fill="#172d43" /><rect x="6" y="61" width="12" height="5" fill="#ff7798" /><rect x="34" y="61" width="12" height="5" fill="#ff7798" /></g>
    </>}
    {game === 'orbit' && <>
      {Array.from({length:28},(_,i) => <circle key={i} cx={i*73%400} cy={i*47%300} r={i%3 ? 1 : 2} fill="#b3c3e2" />)}
      {Array.from({length:35},(_,i) => i !== 29 && i !== 30 && i !== 24 && <rect key={i} x={37+i%7*47} y={43+Math.floor(i/7)*23} width="42" height="16" rx="3" fill={['#ab86ed','#6f9fe0','#54c6c5','#e4b66f','#e97ea6'][Math.floor(i/7)]} />)}
      <path d="M123 202L180 172L241 221" fill="none" stroke="#a5def1" strokeWidth="2" strokeDasharray="5 7" opacity=".5" /><circle cx="241" cy="221" r="7" fill="#fff" /><rect x="204" y="263" width="80" height="9" rx="5" fill="#78d8ed" />
    </>}
    {game === 'moon' && <>
      {Array.from({length:24},(_,i) => <circle key={i} cx={i*73%400} cy={i*47%300} r="1.5" fill="#bdc6db" />)}<circle cx="320" cy="63" r="36" fill="#b6c9d5" /><circle cx="309" cy="54" r="8" fill="#8fa7bc" /><circle cx="330" cy="76" r="13" fill="#99aec2" />
      {[{x:12,y:266,w:122},{x:158,y:214,w:92},{x:282,y:164,w:110},{x:110,y:114,w:85}].map(p => <g key={p.x}><rect x={p.x} y={p.y} width={p.w} height="11" rx="4" fill="#90aaa5" /><path d={`M${p.x+8} ${p.y+11}l16 20h${p.w-48}l16 -20`} fill="#485c74" /></g>)}
      <g transform="translate(191 169)"><rect x="-10" y="15" width="30" height="25" rx="7" fill="#e3e6d9" /><circle cx="5" cy="6" r="14" fill="#e3e6d9" /><rect x="-4" y="0" width="19" height="12" rx="6" fill="#405d79" /><path d="M-5 40L-11 47M14 40L20 47" stroke="#e3e6d9" strokeWidth="7" /></g><path d="M126 91l5-10 5 10-5 9Z" fill="#f1c679" />
    </>}
    {game === 'crystal' && <>
      <rect x="42" y="31" width="316" height="248" rx="9" fill="#252b4a" />
      {Array.from({length:48},(_,i) => { const x=62+i%8*38, y=51+Math.floor(i/8)*39, color=['#71d1c3','#b18ae8','#f2bd68','#e983a3','#77aef0'][(i*7+Math.floor(i/8))%5]; return <g key={i}><rect x={x-16} y={y-16} width="33" height="34" rx="4" fill="#191e38" /><path d={`M${x} ${y-13}l13 13-13 14-13-14Z`} fill={color} /><path d={`M${x} ${y-13}v27l-13-14Z`} fill="#fff" opacity=".18" /><path d={`M${x-6} ${y-2}l6-7 5 7`} fill="none" stroke="#fff" opacity=".5" /></g>; })}
    </>}
  </svg>;
}
