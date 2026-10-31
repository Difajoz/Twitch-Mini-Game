import { NextRequest, NextResponse } from 'next/server';
import { parseChannel } from '@/lib/channel';
import { TwitchService } from '@/lib/twitch-service';
const service = new TwitchService(() => ({ id: process.env.TWITCH_CLIENT_ID, secret: process.env.TWITCH_CLIENT_SECRET }));
export async function GET(request: NextRequest) {
  const login = parseChannel(request.nextUrl.searchParams.get('login') || '');
  if (!login) return NextResponse.json({ error: 'invalid_channel' }, { status: 400 });
  try {
    const channel = await service.channel(login);
    return NextResponse.json(channel ? { channel } : { error: 'not_found' }, { status: channel ? 200 : 404, headers: { 'Cache-Control': 'private, max-age=30' } });
  } catch (error) {
    const code = error instanceof Error && error.message === 'not_configured' ? 'not_configured' : 'metadata_unavailable';
    return NextResponse.json({ error: code }, { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } });
  }
}
