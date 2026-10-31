export type IconName = 'search' | 'more' | 'user' | 'crown' | 'collapse' | 'expand' | 'left' | 'right' | 'chat' | 'game' | 'close' | 'globe' | 'settings' | 'external';
const paths: Record<IconName, React.ReactNode> = {
  search: <><circle cx="9" cy="9" r="6" /><path d="m14 14 6 6" /></>,
  more: <><circle cx="12" cy="4" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="20" r="1" /></>,
  user: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-3c0-7 16-7 16 0v3" /></>,
  crown: <path d="m3 7 5 4 4-7 4 7 5-4-2 13H5Z" />,
  collapse: <><path d="m12 6-6 6 6 6M6 12h13M21 5v14" /></>,
  expand: <><path d="m12 6 6 6-6 6M18 12H5M3 5v14" /></>,
  left: <path d="m15 5-7 7 7 7" />,
  right: <path d="m9 5 7 7-7 7" />,
  chat: <path d="M3 3h18v14H10l-5 4v-4H3Z" />,
  game: <><path d="M6 6h12l4 13h-5l-3-4h-4l-3 4H2Z" /><path d="M8 8v6M5 11h6M16 10h.1M18 13h.1" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z" /></>,
  settings: <><circle cx="12" cy="12" r="4" /><path d="m9 2-1 4-4 1 1 4-2 3 3 3 1 4 4-1 3 2 3-3 4-1-1-4 2-3-3-3-1-4-4 1Z" /></>,
  external: <><path d="M13 3h8v8M21 3 10 14M9 5H3v16h16v-6" /></>,
};
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
export function TwitchLogo() { return <svg width="28" height="32" viewBox="0 0 24 28" aria-hidden="true"><path d="M4 0 0 5v19h6v4l5-4h6l7-7V0Z" fill="#9146ff" /><path d="M7 3 3 7v13h6v4l4-4h5l4-4V3Z" fill="#fff" /><path d="M10 6h2v8h-2Zm6 0h2v8h-2Z" fill="#9146ff" /></svg>; }
