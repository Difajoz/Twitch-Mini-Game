const reserved = new Set(['videos', 'directory', 'downloads', 'settings', 'subscriptions', 'search', 'inventory', 'wallet', 'login', 'signup', 'p', 'jobs', 'turbo', 'drops', 'collections']);
export function parseChannel(value: string): string | null {
  let channel = value.trim().replace(/^@/, '');
  if (/^(https?:\/\/)?(www\.|m\.)?twitch\.tv\//i.test(channel)) {
    try {
      const url = new URL(/^https?:\/\//i.test(channel) ? channel : `https://${channel}`);
      if (!['twitch.tv', 'www.twitch.tv', 'm.twitch.tv'].includes(url.hostname.toLowerCase())) return null;
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length !== 1) return null;
      channel = parts[0];
    } catch { return null; }
  }
  channel = channel.toLowerCase();
  return /^[a-z0-9_]{1,25}$/.test(channel) && !reserved.has(channel) ? channel : null;
}
