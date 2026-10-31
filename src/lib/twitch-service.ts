import { parseChannel } from './channel';
export type ChannelMetadata = { login: string; name: string; live: boolean; title: string; category: string; viewers: number | null; avatar: string };
export class TwitchService {
  private token: { value: string; expires: number; validated: number } | null = null;
  private tokenRequest: Promise<string> | null = null;
  private cache = new Map<string, { until: number; value: ChannelMetadata | null }>();
  private pending = new Map<string, Promise<ChannelMetadata | null>>();
  private active = 0;
  constructor(private config: () => { id?: string; secret?: string }, private request: typeof fetch = fetch) {}
  private async accessToken(): Promise<string> {
    if (this.token && this.token.expires > Date.now() + 60000) {
      if (Date.now() - this.token.validated < 3600000) return this.token.value;
      const response = await this.request('https://id.twitch.tv/oauth2/validate', { headers: { Authorization: `OAuth ${this.token.value}` }, signal: AbortSignal.timeout(8000) });
      if (response.ok) { this.token.validated = Date.now(); return this.token.value; }
      this.token = null;
    }
    if (this.tokenRequest) return this.tokenRequest;
    this.tokenRequest = (async () => {
      const { id, secret } = this.config();
      if (!id || !secret) throw new Error('not_configured');
      const response = await this.request('https://id.twitch.tv/oauth2/token', {
        method: 'POST', body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: 'client_credentials' }), signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error('token_unavailable');
      const data = await response.json();
      if (typeof data.access_token !== 'string' || !Number.isFinite(data.expires_in)) throw new Error('token_unavailable');
      this.token = { value: data.access_token, expires: Date.now() + data.expires_in * 1000, validated: Date.now() };
      return this.token.value;
    })();
    try { return await this.tokenRequest; } finally { this.tokenRequest = null; }
  }
  private async helix(path: string, retry = true): Promise<{ data: Record<string, unknown>[] }> {
    const token = await this.accessToken();
    const response = await this.request(`https://api.twitch.tv/helix/${path}`, { headers: { 'Client-Id': this.config().id!, Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000), cache: 'no-store' });
    if (response.status === 401 && retry) { this.token = null; return this.helix(path, false); }
    if (!response.ok) throw new Error('metadata_unavailable');
    const data = await response.json();
    if (!Array.isArray(data.data)) throw new Error('metadata_unavailable');
    return data;
  }
  async channel(login: string): Promise<ChannelMetadata | null> {
    if (parseChannel(login) !== login) throw new Error('invalid_channel');
    const { id, secret } = this.config();
    if (!id || !secret) throw new Error('not_configured');
    const cached = this.cache.get(login);
    if (cached && cached.until > Date.now()) return cached.value;
    const existing = this.pending.get(login); if (existing) return existing;
    if (this.active >= 4) throw new Error('busy');
    this.active++;
    const task = (async () => {
      const users = await this.helix(`users?login=${encodeURIComponent(login)}`);
      const user = users.data[0]; let value: ChannelMetadata | null = null;
      if (user) {
        const [streams, channels] = await Promise.all([this.helix(`streams?user_login=${encodeURIComponent(login)}`), this.helix(`channels?broadcaster_id=${encodeURIComponent(String(user.id))}`)]);
        const stream = streams.data[0], channel = channels.data[0];
        value = { login, name: String(user.display_name), avatar: String(user.profile_image_url), live: !!stream, title: String(stream?.title ?? channel?.title ?? ''), category: String(stream?.game_name ?? channel?.game_name ?? ''), viewers: typeof stream?.viewer_count === 'number' ? stream.viewer_count : null };
      }
      if (this.cache.size >= 128) this.cache.delete(this.cache.keys().next().value!);
      this.cache.set(login, { until: Date.now() + 60000, value }); return value;
    })();
    this.pending.set(login, task);
    try { return await task; } finally { this.pending.delete(login); this.active--; }
  }
}
