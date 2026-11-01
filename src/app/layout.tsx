import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sidequest — Watch & play',
  description: 'Keep your Twitch stream in view while playing Skyline Sprint or Pocket Enterprise. An independent viewer companion built with Codex.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
