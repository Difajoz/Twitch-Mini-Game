// Public previews observed on Twitch on 2026-10-31, not live API results.
export type PreviewChannel = { login: string; name: string; category: string; title: string; avatar: string; viewers: string; tags: string[] };
const avatar = (id: string) => `https://static-cdn.jtvnw.net/jtv_user_pictures/${id}-profile_image-70x70.png`;
export const channels: PreviewChannel[] = [
  { login: 'milqka', name: 'milqka', category: "I'm Only Sleeping", title: '🎃 💀 ХЭЛЛОУИН БУТКЕМП 👻', avatar: avatar('cd3d96b0-15be-47a7-b7fa-57179bb40857'), viewers: '121', tags: ['хэллоуин', 'Русский', 'DropsВключены'] },
  { login: 'cozart_2s1', name: 'Cozart_2s1', category: 'Counter-Strike', title: '5000Elo 😈 @m0NESYof w @donk1437', avatar: avatar('98e64572-7435-4a81-af5c-e30848d82282'), viewers: '2.6K', tags: ['Русский', 'Українська', 'English'] },
  { login: 'keliencs', name: 'keliencs', category: 'Counter-Strike', title: 'concentration. | !tg !fonbet', avatar: avatar('c7b8d2d9-af3e-4233-8b68-137474c2b170'), viewers: '537', tags: ['Русский', 'English', 'FPL'] },
  { login: 'arthua247', name: 'arthua247', category: 'League of Legends', title: 'League of Legends', avatar: avatar('23ae538c-e9a0-40da-b01a-dae6ab618218'), viewers: '132', tags: [] },
  { login: 'eternity_league2', name: 'eternity_league2', category: 'Counter-Strike', title: 'Eternity League', avatar: avatar('8dfe8d23-cb63-4ec2-a4cc-ef4592c91a80'), viewers: '8', tags: [] },
  { login: 'madlife516', name: 'MadLife516', category: 'Counter-Strike', title: 'Counter-Strike', avatar: avatar('fa4a952b-52ec-4b3c-89ed-ae2b219b6fa2'), viewers: '1.5K', tags: [] },
  { login: 'eslcs', name: 'ESLCS', category: 'Counter-Strike', title: 'Counter-Strike', avatar: avatar('c1ecbcd5-b8b6-4e0c-9d5f-e01d610aa97d'), viewers: '206', tags: [] },
  { login: 'meetenshow', name: 'meetenshow', category: "I'm Only Sleeping", title: "I'm Only Sleeping", avatar: avatar('e346e52a-14b0-4b6b-aa26-5dd05f5f07a2'), viewers: '157', tags: [] },
  { login: 'merabella', name: 'merabella', category: 'Counter-Strike', title: 'Counter-Strike', avatar: avatar('4809bcb0-2941-413e-bb3c-545107d25e97'), viewers: '170', tags: [] },
  { login: 'hypedcs_', name: 'hypedcs_ +1', category: 'Counter-Strike', title: 'Counter-Strike', avatar: avatar('4a474423-f05b-469a-a4cd-cf34100a159c'), viewers: '257', tags: [] },
];
export const featured = [
  { login: 'nightngaletv', name: 'NightngaleTV', category: 'Hunt: Showdown 1896', avatar: avatar('b990b0b5-c8a7-4eb4-91d1-edf2ad216994'), tags: ['chill', 'Progression'] },
  { login: 'thecarpentermusic', name: 'TheCarpenterMusic', category: 'Music', avatar: '', tags: ['Music', 'English'] },
  { login: 'nyybeats', name: 'NyyBeats', category: 'Music', avatar: '', tags: ['Music', 'chill'] },
];
export const irlChannels: PreviewChannel[] = [
  { login: 'dimanjapan', name: 'DimanJapan', category: 'Just Chatting', title: 'Хеллоуин в Токио.', avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/b9312d6b-3d26-492e-880c-aa6c62527624-profile_image-50x50.png', viewers: '833', tags: ['Аниме', 'DropsВключены', 'Япония'] },
  { login: 'sugarhillddotlive', name: 'sugarhillddotlive', category: 'Just Chatting', title: 'PENNYWISE DDOT ON A MISSION', avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/3d21df6d-cc81-4f8e-b067-f1935b74bba8-profile_image-50x50.png', viewers: '282', tags: ['English', 'DropsEnabled'] },
  { login: 's0lne4nyy', name: 's0lne4nyy', category: 'Just Chatting', title: 'АЛКОСТРИМ В МИНСКЕ', avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/bbadce7a-68ff-442f-ac50-fc5224e16efc-profile_image-50x50.png', viewers: '135', tags: ['Stream-o-Ween', 'Русский'] },
];
export const categories = [
  { name: 'Counter-Strike', slug: 'counter-strike', id: '32399', viewers: '17.9K', tags: ['FPS', 'Shooter'] },
  { name: 'League of Legends', slug: 'league-of-legends', id: '21779', viewers: '74.9K', tags: ['RPG', 'Strategy'] },
  { name: 'Chess', slug: 'chess-1', id: '743', viewers: '1.3K', tags: ['Strategy', 'Action'] },
  { name: 'Just Chatting', slug: 'just-chatting', id: '509658', viewers: '218K', tags: ['IRL'] },
  { name: 'Clash Royale', slug: 'clash-royale', id: '491168_IGDB', viewers: '3.7K', tags: ['Mobile Game', 'RTS'] },
  { name: 'GeoGuessr', slug: 'geoguessr', id: '369418_IGDB', viewers: '116', tags: ['Strategy'] },
];
export function categoryUrl(name: string) {
  const slug = categories.find(item => item.name === name)?.slug || ({ "I'm Only Sleeping": 'im-only-sleeping', 'Hunt: Showdown 1896': 'hunt-showdown', Music: 'music' } as Record<string, string>)[name];
  return slug ? `https://www.twitch.tv/directory/category/${slug}` : `https://www.twitch.tv/directory/all/tags/${encodeURIComponent(name)}`;
}
