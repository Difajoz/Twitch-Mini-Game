'use client';
import { useEffect, useRef, useState } from 'react';
import type { ChannelMetadata } from '@/lib/twitch-service';
import { categoryUrl, channels, featured, irlChannels } from '@/lib/twitch-reference';
import { Icon } from './Icons';
type Player = { setChannel: (channel: string) => void; pause: () => void; addEventListener: (event: string, callback: () => void) => void; removeEventListener?: (event: string, callback: () => void) => void };
declare global { interface Window { Twitch?: { Player: { new (target: string, options: Record<string, unknown>): Player; READY: string; ONLINE: string; OFFLINE: string; PLAYBACK_BLOCKED: string } } } }
let loading: Promise<void> | null = null;
function loadPlayer() {
  if (window.Twitch) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script'); script.src = 'https://player.twitch.tv/js/embed/v1.js'; script.async = true;
    script.onload = () => resolve(); script.onerror = () => { loading = null; script.remove(); reject(new Error('unavailable')); };
    document.head.appendChild(script);
  }); return loading;
}
export default function TwitchPlayer({ channel, active, compact = false, fullscreen = false, onFullscreen }: { channel: string; active: boolean; compact?: boolean; fullscreen?: boolean; onFullscreen: () => void }) {
  const target = useRef<HTMLDivElement>(null), player = useRef<Player | null>(null), latest = useRef(channel);
  const ready = useRef(false);
  const visible = useRef(active);
  const [status, setStatus] = useState('Loading the official player…');
  const [metadata, setMetadata] = useState<ChannelMetadata | null>(null);
  const [message, setMessage] = useState('Fetching channel details…');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { latest.current = channel; if (ready.current) player.current?.setChannel(channel); setStatus('Connecting to channel…'); }, [channel]);
  useEffect(() => { visible.current = active; if (!active && ready.current) player.current?.pause(); }, [active]);
  useEffect(() => {
    let cancelled = false; ready.current = false; const subscriptions: [string, () => void][] = []; let owned: Player | null = null;
    loadPlayer().then(() => {
      if (cancelled || !target.current || !window.Twitch) return;
      const api = window.Twitch.Player;
      const initialChannel = latest.current;
      owned = new api(target.current.id, { channel: initialChannel, parent: [window.location.hostname], width: '100%', height: '100%', autoplay: false, muted: false });
      player.current = owned;
      const listen = (event: string, label: string) => { const callback = () => setStatus(label); owned!.addEventListener(event, callback); subscriptions.push([event, callback]); };
      const onReady = () => { ready.current = true; if (latest.current !== initialChannel) owned?.setChannel(latest.current); if (!visible.current) owned?.pause(); setStatus('Ready · press play in the Twitch player'); };
      owned.addEventListener(api.READY, onReady); subscriptions.push([api.READY, onReady]);
      listen(api.ONLINE, 'Channel online'); listen(api.OFFLINE, 'Channel offline'); listen(api.PLAYBACK_BLOCKED, 'Press play in the Twitch player to start');
    }).catch(() => { if (!cancelled) setStatus('Twitch could not load. Check your connection or content blocker, then retry.'); });
    return () => { cancelled = true; ready.current = false; subscriptions.forEach(([event, callback]) => owned?.removeEventListener?.(event, callback)); player.current = null; target.current?.replaceChildren(); };
  }, [attempt]);
  useEffect(() => {
    const controller = new AbortController(); setMetadata(null); setMessage('Fetching channel details…');
    const update = async () => {
      try {
        const response = await fetch(`/api/channel?login=${encodeURIComponent(channel)}`, { signal: controller.signal });
        const body = await response.json(); if (controller.signal.aborted) return;
        if (!response.ok) { setMetadata(null); setMessage(body.error === 'not_found' ? 'Channel not found. Check its name or try another channel.' : 'Current channel details unavailable.'); return; }
        setMetadata(body.channel); setMessage('');
      } catch { if (!controller.signal.aborted) { setMetadata(null); setMessage('Channel details unavailable. Check your connection.'); } }
    };
    void update(); const interval = setInterval(() => void update(), 60000);
    return () => { controller.abort(); clearInterval(interval); };
  }, [channel]);
  const reference = [...featured, ...channels, ...irlChannels].find(item => item.login === channel);
  return <div className={`twitch-content ${compact ? 'compact-player' : ''}`}>
    <div className="stream-heading"><span className="eyebrow">OFFICIAL TWITCH PLAYER</span><a href={`https://www.twitch.tv/${channel}`} target="_blank" rel="noreferrer">Open on Twitch ↗</a></div>
    <div className="player-overflow"><div className="twitch-player" id="official-twitch-player" ref={target} /></div>
    <div className="player-status"><span>{status}</span><div><button className="text-button" onClick={() => setAttempt(a => a + 1)}>Retry player</button><button className="text-button stream-fullscreen" onClick={onFullscreen}>{fullscreen ? 'Exit fullscreen' : 'Stream + games fullscreen'} <Icon name="expand" size={14} /></button></div></div>
    <div className="channel-info"><div className="channel-avatar">{metadata?.avatar || reference?.avatar ? <img src={metadata?.avatar || reference?.avatar} alt="" width="50" height="50" /> : channel.slice(0, 1).toUpperCase()}</div><div className="channel-details"><div className="channel-name"><a href={`https://www.twitch.tv/${channel}`} target="_blank" rel="noreferrer">{metadata?.name || reference?.name || channel}</a> {metadata && <span className={metadata.live ? 'live-badge' : 'offline-badge'}>{metadata.live ? 'LIVE' : 'OFFLINE'}</span>}</div><p>{metadata?.title || message}</p>{(metadata?.category || reference?.category) && <a className="channel-category" href={categoryUrl(metadata?.category || reference?.category || '')} target="_blank" rel="noreferrer">{metadata?.category || reference?.category}{metadata?.viewers !== null && metadata?.viewers !== undefined ? ` · ${metadata.viewers.toLocaleString()} viewers` : ''}</a>}{reference && <div className="tags">{reference.tags.map(tag => <a key={tag} href={`https://www.twitch.tv/directory/all/tags/${encodeURIComponent(tag)}`} target="_blank" rel="noreferrer">{tag}</a>)}</div>}</div><div className="channel-actions"><a className="button primary" href={`https://www.twitch.tv/${channel}`} target="_blank" rel="noreferrer">♡ Follow</a><a className="button secondary" href={`https://www.twitch.tv/subs/${channel}`} target="_blank" rel="noreferrer">☆ Subscribe</a><a className="icon-button" href={`https://www.twitch.tv/${channel}`} target="_blank" rel="noreferrer" aria-label="Open on Twitch"><Icon name="more" size={18} /></a></div></div>
  </div>;
}
