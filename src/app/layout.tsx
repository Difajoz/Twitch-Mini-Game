import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sidequest — Twitch-style watch & play',
  description: 'Watch a Twitch stream and take a solo rooftop run. Or just play. An independent viewer companion.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
