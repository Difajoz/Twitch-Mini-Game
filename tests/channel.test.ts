import test from 'node:test';
import assert from 'node:assert/strict';
import { parseChannel } from '../src/lib/channel';
import { TwitchService } from '../src/lib/twitch-service';
test('normalizes names and supported channel URLs', () => {
  for (const value of [' Some_Channel ', '@Some_Channel', 'https://www.twitch.tv/Some_Channel?ref=test', 'twitch.tv/Some_Channel/']) assert.equal(parseChannel(value), 'some_channel');
});
test('rejects unsupported URLs, reserved paths, invalid names and extra segments', () => {
  for (const value of ['', 'a b', 'https://twitch.tv.evil.test/name', 'https://evil.test/name', 'https://twitch.tv/videos/123', 'directory', 'x'.repeat(26), '<script>']) assert.equal(parseChannel(value), null, value);
});
test('missing credentials is an explicit error and makes no network requests', async () => {
  const service = new TwitchService(() => ({}), async () => { throw new Error('must not call'); });
  await assert.rejects(service.channel('twitch'), /not_configured/);
});
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
test('API caches concurrent metadata requests and retries expired token once', async () => {
  let tokens = 0, users = 0;
  const fake: typeof fetch = async input => {
    const url = String(input);
    if (url.includes('/oauth2/token')) { tokens++; return json({ access_token: `token${tokens}`, expires_in: 3600 }); }
    if (url.includes('/users?')) { users++; return users === 1 ? json({}, 401) : json({ data: [{ id: '1', display_name: 'Twitch', profile_image_url: 'https://example.com/avatar.png' }] }); }
    if (url.includes('/streams?')) return json({ data: [{ title: 'Real title', game_name: 'Game', viewer_count: 7 }] });
    if (url.includes('/channels?')) return json({ data: [] });
    throw new Error('Unexpected request');
  };
  const service = new TwitchService(() => ({ id: 'test', secret: 'test' }), fake);
  const [a, b] = await Promise.all([service.channel('twitch'), service.channel('twitch')]);
  assert.deepEqual(a, b); assert.equal(a?.live, true); assert.equal(a?.viewers, 7);
  await service.channel('twitch'); assert.equal(tokens, 2); assert.equal(users, 2);
});
test('upstream failures never fabricate a live or offline channel', async () => {
  const fake: typeof fetch = async input => String(input).includes('/oauth2/token') ? json({ access_token: 'test', expires_in: 3600 }) : json({}, 503);
  const service = new TwitchService(() => ({ id: 'test', secret: 'test' }), fake);
  await assert.rejects(service.channel('twitch'), /metadata_unavailable/);
});
test('offline channel preserves channel details and unknown channel returns null', async () => {
  const fake: typeof fetch = async input => {
    const url = String(input);
    if (url.includes('/oauth2/token')) return json({ access_token: 'test', expires_in: 3600 });
    if (url.includes('/users?login=unknown')) return json({ data: [] });
    if (url.includes('/users?')) return json({ data: [{ id: '1', display_name: 'Twitch', profile_image_url: '' }] });
    if (url.includes('/streams?')) return json({ data: [] });
    return json({ data: [{ title: 'Last broadcast', game_name: 'Art' }] });
  };
  const service = new TwitchService(() => ({ id: 'test', secret: 'test' }), fake);
  assert.equal((await service.channel('twitch'))?.live, false);
  assert.equal((await service.channel('twitch'))?.title, 'Last broadcast');
  assert.equal(await service.channel('unknown'), null);
});
