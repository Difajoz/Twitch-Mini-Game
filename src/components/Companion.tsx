'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import TwitchPlayer from './TwitchPlayer';
import MiniGames, { type GameId } from './MiniGames';
import { Icon, TwitchLogo } from './Icons';
import { parseChannel } from '@/lib/channel';
import { defaults, loadPreferences, savePreferences, type Preferences } from '@/lib/storage';
import { categories, categoryUrl, channels, featured, irlChannels, type PreviewChannel } from '@/lib/twitch-reference';
const external = { target: '_blank', rel: 'noreferrer' } as const;
export default function Companion() {
  const shell = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');
  useEffect(() => { const sync = () => setFullscreen(document.fullscreenElement === shell.current); document.addEventListener('fullscreenchange', sync); return () => document.removeEventListener('fullscreenchange', sync); }, []);
  const toggleFullscreen = async () => {
    try { setFullscreenError(''); if (document.fullscreenElement) await document.exitFullscreen(); else { setOpen(true); setChat(false); await shell.current?.requestFullscreen(); } }
    catch { setFullscreenError('Fullscreen is unavailable in this browser. Try opening the app in a browser tab.'); }
  };
  const [preferences, setPreferences] = useState<Preferences>(defaults), [loaded, setLoaded] = useState(false);
  const [channel, setChannel] = useState(featured[0].login), [input, setInput] = useState(''), [inputError, setInputError] = useState('');
  const [open, setOpen] = useState(false), [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [collapsed, setCollapsed] = useState(false), [menu, setMenu] = useState<'more' | 'user' | null>(null), [chat, setChat] = useState(false), [parent, setParent] = useState('');
  const [view, setView] = useState<'browse' | 'channel'>('browse'), [featureIndex, setFeatureIndex] = useState(0), [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!menu) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Element && !event.target.closest('.menu-anchor')) setMenu(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      shell.current?.querySelector<HTMLButtonElement>('.menu-anchor button[aria-expanded="true"]')?.focus();
      setMenu(null);
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [menu]);
  useEffect(() => { setPreferences(loadPreferences()); setLoaded(true); setParent(window.location.hostname); }, []);
  useEffect(() => { if (loaded) savePreferences(preferences); }, [preferences, loaded]);
  const onBest = useCallback((score: number) => setPreferences(p => ({ ...p, best: Math.max(score, p.best) })), []);
  const launch = () => { setChat(false); setOpen(true); };
  const selectChannel = (login: string) => { setChannel(login); setInput(''); setView('channel'); setInputError(''); setMenu(null); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const watch = (event: React.FormEvent) => {
    event.preventDefault(); const normalized = parseChannel(input);
    if (!normalized) { setInputError('Enter a Twitch channel name or channel URL.'); return; }
    selectChannel(normalized);
  };
  const rotate = (direction: number) => { const next = (featureIndex + direction + featured.length) % featured.length; setFeatureIndex(next); setChannel(featured[next].login); };
  const browse = () => { setView('browse'); setChat(false); setMenu(null); window.scrollTo({ top: 0, behavior: 'instant' }); };
  return <div ref={shell} className={`app-shell ${fullscreen ? 'watch-fullscreen' : ''} ${collapsed ? 'nav-collapsed' : ''} ${chat ? 'chat-visible' : ''} ${open ? 'games-open' : ''}`}>
    <header className="site-header">
      <div className="nav-start"><button className="twitch-home" onClick={browse} aria-label="Twitch-style home"><TwitchLogo /></button><button className={`browse-link ${view === 'browse' ? 'active' : ''}`} onClick={browse}>Browse</button><div className="menu-anchor"><button className="icon-button" aria-label="More Options" aria-expanded={menu === 'more'} onClick={() => setMenu(menu === 'more' ? null : 'more')}><Icon name="more" /></button>{menu === 'more' && <div className="nav-menu"><h3>GENERAL</h3>{[['About', 'https://www.twitch.tv/p/en/about/'], ['Blog', 'https://blog.twitch.tv/'], ['Developers', 'https://dev.twitch.tv/'], ['Download Apps', 'https://www.twitch.tv/downloads'], ['Help', 'https://help.twitch.tv/'], ['Safety', 'https://safety.twitch.tv/']].map(([name, url]) => <a key={name} href={url} {...external}>{name}<Icon name="external" size={13} /></a>)}<div className="menu-divider" /><button onClick={() => { launch(); setMenu(null); }}>Mini games<Icon name="game" size={16} /></button></div>}</div></div>
      <form className="header-search" onSubmit={watch}><input ref={inputRef} value={input} onChange={e => { setInput(e.target.value); setInputError(''); }} placeholder="Search" aria-label="Twitch channel name or URL" aria-describedby={inputError ? 'channel-error' : undefined} spellCheck={false} /><button type="submit" aria-label="Search channel" title="Search channel"><Icon name="search" size={23} /></button></form>
      <div className="nav-end"><a className="icon-button prime-link" href="https://gaming.amazon.com/" {...external} title="Prime Gaming" aria-label="Prime Gaming"><Icon name="crown" /></a><a className="button secondary" href="https://www.twitch.tv/login" {...external}>Log In</a><a className="button primary" href="https://www.twitch.tv/signup" {...external}>Sign Up</a><div className="menu-anchor"><button className="icon-button" aria-label="User Menu" aria-expanded={menu === 'user'} onClick={() => setMenu(menu === 'user' ? null : 'user')}><Icon name="user" /></button>{menu === 'user' && <div className="nav-menu user-menu"><h3>SIDEQUEST · INDEPENDENT APP</h3><div className="menu-theme"><Icon name="globe" size={17} /><span>English</span></div><div className="menu-theme"><Icon name="settings" size={17} /><span>Dark Theme</span><span className="toggle-on" /></div><div className="menu-divider" /><button onClick={() => { launch(); setMenu(null); }}><Icon name="game" size={17} />Mini games</button><a href="https://www.twitch.tv/login" {...external}><Icon name="user" size={17} />Log In on Twitch<Icon name="external" size={13} /></a></div>}</div></div>
    </header>
    <aside className="left-sidebar" aria-label="Channel navigation"><div className="sidebar-heading"><h2 title="Listings observed on Twitch on October 31, 2026">Channels from Twitch</h2><button className="icon-button" title={collapsed ? 'Expand Side Nav' : 'Collapse Side Nav'} aria-label={collapsed ? 'Expand Side Nav' : 'Collapse Side Nav'} onClick={() => setCollapsed(c => !c)}><Icon name={collapsed ? 'expand' : 'collapse'} /></button></div><div className="sidebar-list">{channels.map(item => <button key={item.login} className={`sidebar-channel ${channel === item.login ? 'current' : ''}`} title={`${item.name} · ${item.category} · ${item.viewers} viewers at reference capture`} onClick={() => selectChannel(item.login)}><img src={item.avatar} width="30" height="30" alt="" /><span className="sidebar-channel-copy"><strong>{item.name}</strong><span>{item.category}</span></span><span className="sidebar-viewers"><i />{item.viewers}</span></button>)}</div><div className="sidebar-info"><p>Join the <strong>Twitch</strong> community!</p><span>Discover the best live streams anywhere.</span><a className="button primary" href="https://www.twitch.tv/signup" {...external}>Sign Up</a></div><button className="sidebar-app" onClick={launch} aria-expanded={open} aria-controls="mini-games-sidebar"><Icon name="game" size={17} /><span>Mini games</span><Icon name="right" size={16} /></button><p className="sidebar-source">Preview listings · Oct 31, 2026<br />Counts are from the reference capture.</p></aside>
    <main className={`main-content ${view === 'channel' ? 'channel-view' : 'browse-view'}`}>
      {inputError && <div className="form-error" id="channel-error" role="alert">{inputError}<button onClick={() => setInputError('')} aria-label="Dismiss search error"><Icon name="close" size={15} /></button></div>}
      <div className="companion-toolbar"><button className="button secondary fullscreen-toggle" onClick={toggleFullscreen}>{fullscreen ? 'Exit fullscreen' : 'Watch + play fullscreen'}</button>{fullscreenError && <span role="alert">{fullscreenError}</span>}<div><span className="companion-label"><Icon name="game" size={16} />Sidequest</span><span className="independent-label">Independent Twitch companion</span></div><div><button className={`button ${open ? 'primary' : 'secondary'}`} onClick={() => open ? setOpen(false) : launch()} aria-expanded={open} aria-controls="mini-games-sidebar"><Icon name="game" size={17} />Mini games</button><button className={`toolbar-button ${chat ? 'selected' : ''}`} onClick={() => { setOpen(false); setChat(c => !c); }} aria-label={chat ? 'Hide stream chat' : 'Show stream chat'} title={chat ? 'Hide stream chat' : 'Show stream chat'}><Icon name="chat" size={17} /></button></div></div>
      <div className="workspace">
        <section className="watch-column" aria-label="Watch stream">
          <div className={`featured-stage ${view === 'browse' && !open ? 'carousel-stage' : ''}`}>
            <button className="carousel-arrow previous" aria-label="Previous video" onClick={() => rotate(-1)} style={view !== 'browse' || open ? { display: 'none' } : undefined}><Icon name="left" size={24} /></button>
            <div className="carousel-back back-left" style={view !== 'browse' || open ? { display: 'none' } : undefined}><img src={`https://static-cdn.jtvnw.net/previews-ttv/live_user_${featured[(featureIndex + 2) % featured.length].login}-320x180.jpg`} alt="Previous featured channel preview" /></div>
            <div className="stream-card"><TwitchPlayer channel={channel} active compact={view === 'browse' && !open} fullscreen={fullscreen} onFullscreen={toggleFullscreen} /></div>
            <div className="carousel-back back-right" style={view !== 'browse' || open ? { display: 'none' } : undefined}><img src={`https://static-cdn.jtvnw.net/previews-ttv/live_user_${featured[(featureIndex + 1) % featured.length].login}-320x180.jpg`} alt="Next featured channel preview" /></div>
            <button className="carousel-arrow next" aria-label="Next video" onClick={() => rotate(1)} style={view !== 'browse' || open ? { display: 'none' } : undefined}><Icon name="right" size={24} /></button>
          </div>
          {view === 'channel' && <nav className="channel-tabs" aria-label="Channel sections"><span className="selected">Home</span>{['About', 'Schedule', 'Videos', 'Clips'].map(tab => <a key={tab} href={`https://www.twitch.tv/${channel}/${tab.toLowerCase()}`} {...external}>{tab}</a>)}<a className="channel-external" href={`https://www.twitch.tv/${channel}`} {...external} aria-label="Open channel on Twitch"><Icon name="external" size={16} /></a></nav>}
        </section>

      </div>
      <div className="discovery-content">
        <div className="section-title"><h2><a href="https://www.twitch.tv/directory/all" {...external}>Live on Twitch</a></h2><span title="Listings observed on the official Twitch homepage, not returned by the live API.">Reference previews · Oct 31</span></div><div className="stream-grid">{channels.slice(0, expanded ? 6 : 3).map(item => <StreamCard item={item} key={item.login} select={selectChannel} />)}</div><div className="show-more-row"><span /><button className="text-button" onClick={() => setExpanded(e => !e)}>{expanded ? 'Show less' : 'Show more'} <span>{expanded ? '⌃' : '⌄'}</span></button><span /></div>
        <div className="section-title"><h2><a href="https://www.twitch.tv/directory" {...external}>Categories</a> we think you’ll like</h2></div><div className="category-grid">{categories.map(item => <article className="category-card" key={item.slug}><a className="category-cover" href={`https://www.twitch.tv/directory/category/${item.slug}`} {...external}><img src={`https://static-cdn.jtvnw.net/ttv-boxart/${item.id}-188x250.jpg`} alt={`${item.name} cover image`} loading="lazy" /></a><div className="category-copy"><a href={`https://www.twitch.tv/directory/category/${item.slug}`} {...external}>{item.name}</a><span>{item.viewers} viewers at capture</span><div className="tags">{item.tags.map(tag => <a key={tag} href={`https://www.twitch.tv/directory/all/tags/${encodeURIComponent(tag)}`} {...external}>{tag}</a>)}</div></div></article>)}</div>
        <div className="section-title"><h2><a href="https://www.twitch.tv/directory/collection/just-chatting-irl-streams" {...external}>Just Chatting & IRL</a></h2></div><div className="stream-grid">{irlChannels.map(item => <StreamCard item={item} key={item.login} select={selectChannel} />)}</div><div className="show-more-row"><span /><a href="https://www.twitch.tv/directory/collection/just-chatting-irl-streams" {...external}>Show all ⌄</a><span /></div>
      </div>
      <footer><TwitchLogo /><div><strong>Sidequest · Independent Twitch companion</strong><p>Interface recreated from the Twitch reference. Not affiliated with Twitch. Account actions open Twitch.</p><p>Directory previews and counts were captured October 31, 2026. The official player shows current channel availability.</p></div><a href="https://www.twitch.tv/" {...external}>Visit Twitch <Icon name="external" size={13} /></a></footer>
    </main>
    <MiniGames open={open} selected={selectedGame} onSelect={setSelectedGame} best={preferences.best} muted={preferences.muted} onBest={onBest} onMute={() => setPreferences(p => ({ ...p, muted: !p.muted }))} onClose={() => setOpen(false)} onBack={() => setSelectedGame(null)} />
    <aside className="chat-column" style={!chat ? { display: 'none' } : undefined} aria-label="Stream chat"><div className="chat-header"><button className="icon-button" onClick={() => setChat(false)} aria-label="Collapse Chat"><Icon name="expand" size={18} /></button><strong>Stream Chat</strong><a className="icon-button" href={`https://www.twitch.tv/${channel}/chat`} {...external} aria-label="Open chat on Twitch"><Icon name="external" size={17} /></a></div>{parent && chat && <iframe key={channel} src={`https://www.twitch.tv/embed/${channel}/chat?parent=${encodeURIComponent(parent)}&darkpopout`} title={`${channel} official Twitch chat`} />}</aside>
  </div>;
}
function StreamCard({ item, select }: { item: PreviewChannel; select: (login: string) => void }) {
  return <article className="discovery-card"><button className="stream-thumbnail" onClick={() => select(item.login)} aria-label={`Watch ${item.name}`}><img src={`https://static-cdn.jtvnw.net/previews-ttv/live_user_${item.login}-640x360.jpg`} alt={`${item.name} channel preview`} loading="lazy" /><span className="preview-badge">PREVIEW</span><span className="viewer-count" title="Viewer count when the Twitch reference was captured">{item.viewers} viewers at capture</span></button><div className="stream-copy"><button className="discovery-avatar" onClick={() => select(item.login)} aria-label={`Open ${item.name}`}><img src={item.avatar} alt="" width="40" height="40" loading="lazy" /></button><div><button className="stream-title" title={item.title} onClick={() => select(item.login)}>{item.title}</button><button className="stream-name" onClick={() => select(item.login)}>{item.name}</button><a className="stream-category" href={categoryUrl(item.category)} {...external}>{item.category}</a><div className="tags">{item.tags.map(tag => <a key={tag} href={`https://www.twitch.tv/directory/all/tags/${encodeURIComponent(tag)}`} {...external}>{tag}</a>)}</div></div></div></article>;
}
