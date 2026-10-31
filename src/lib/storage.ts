export type Preferences = { best: number; side: 'left' | 'right'; muted: boolean; effects: boolean };
export const defaults: Preferences = { best: 0, side: 'right', muted: true, effects: true };
const key = 'sidequest:v1';
export function loadPreferences(): Preferences {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    return { best: Number.isFinite(data.best) && data.best >= 0 ? Math.floor(data.best) : 0,
      side: data.side === 'left' ? 'left' : 'right',
      // Audio always starts muted, even after an earlier session enabled it.
      muted: true, effects: typeof data.effects === 'boolean' ? data.effects : true };
  } catch { return { ...defaults }; }
}
export function savePreferences(data: Preferences) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* Session still works without storage. */ }
}
