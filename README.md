# Sidequest — Twitch Mini Games

Watch an official Twitch stream and play a short solo game beside it. Open **Mini games**, choose a game, and keep the broadcast in view. Built with Codex, Next.js, React, TypeScript and Three.js.

**Two games are playable:** Skyline Sprint and Pocket Enterprise. Five additional library cards are clearly marked visual concepts. Sidequest is an independent prototype, not a Twitch product or browser extension.

## Quick start

Use Node.js 24 and pnpm 11.25.0. Install pnpm if needed with `npm install --global pnpm@11.25.0`.

```sh
git clone https://github.com/Difajoz/Twitch-Mini-Game.git
cd Twitch-Mini-Game
pnpm install --frozen-lockfile
pnpm dev
```

Open [127.0.0.1:3000](http://127.0.0.1:3000). No API credentials are required for the official player or either game. Search for a Twitch channel name or channel URL and press Enter. Press Play inside Twitch to start the broadcast; offline channels show Twitch's own offline screen.

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm start
```

Type checking generates Next.js route types first, so it also works before the first build. The separate `video/` project is optional and is excluded from the app's TypeScript scope. Root installation does not install its dependencies.

## Play

**Skyline Sprint:** an original 3D rooftop runner with three lanes, jumps, slides, tokens, obstacles and increasing speed. Press the purple Play button. Use arrows or WASD; Space also jumps. Compact arrow buttons offer pointer/touch input. Escape pauses. Ten collected tokens grant one shield per run. Distance plus 25 points per token determines score; best score saves locally. Music and sound start muted.

**Pocket Enterprise:** steer a coin formation through six arithmetic gates during an approximately 11.3-second run. Use A/D, left/right arrows, the visible gate/steering buttons, or pointer drag. Finish to bank your coins and enter the business street. Walk with WASD/arrows, held direction buttons, or a pointer destination. Walk onto a shop pad to invest; partial payments persist. Leave and re-enter to invest again. Coffee House, Cookie Corner and Burger Club unlock in order and each has two upgrades. Walk onto the gold RUN pad for another run. Wallet and city progress save locally; there is no real-money currency or offline income.

Both games pause when you switch games, close the panel, leave the window, hide the tab, or move focus to the stream. Return and resume explicitly. Closing or switching the panel retains the current run in memory; reloading retains only saved best/city progress. Storage restrictions leave games usable with session-only progress. Web Locks synchronize supported browsers' city transactions across tabs.

**Neon Drift, Orbit Breaker, Pixel Rally, Moon Hopper and Crystal Match** are static visual concepts with no gameplay simulation. The UI and submission description identify them accordingly.

## Watch and layout

The dark surfaces, compact navigation, purple controls, menus and channel presentation follow Twitch's visual style. The right game rail preserves the existing player and game instances. **Watch + play fullscreen** includes stream and games; Twitch's own fullscreen button includes only its player. Phone layouts stack the game panel beneath the stream; desktop is the intended watch-and-play experience.

The official player remains at least 400 × 300 px. Narrow screens get a contained horizontal scroll area. The chat control opens official Twitch chat. Login, signup, follow and subscribe links open Twitch; this app collects no Twitch credentials or payments.

Directory cards and counts are **dated reference previews from October 31, 2026**, not a live directory. Thumbnails are requested from Twitch and may show offline placeholders. Selecting a card opens its actual channel. Without optional API credentials the page says current channel details are unavailable; this does not block playback or games.

## Optional Twitch metadata

Copy `.env.example` to `.env.local`, set `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` from your registered Twitch developer app, then restart the server. Credentials and tokens stay on the server; never use a `NEXT_PUBLIC_` prefix or commit `.env.local`.

The `/api/channel?login=channel_name` adapter returns current identity, title, category, live state and viewer count when configured. It uses upstream timeouts, a bounded 60-second cache, request coalescing, a four-channel concurrency limit, hourly token validation and one authentication retry. Missing configuration returns an explicit 503; unknown channels return 404 and invalid input returns 400. Automated tests use simulated API responses; live credentialed API verification is still outstanding.

Deploy as a Next.js Node server over HTTPS. Verify Twitch playback on the actual production/preview hostname; local playback alone does not prove hosted playback. If your host requires an external listener, use `pnpm exec next start --hostname 0.0.0.0 --port 3000`. No hosted demo is configured in this repository.

## Source map

| Area | Files |
| --- | --- |
| Twitch-style shell, search, menus, fullscreen | `src/components/Companion.tsx`, `src/app/globals.css` |
| Official player lifecycle and metadata | `src/components/TwitchPlayer.tsx`, `src/lib/twitch-service.ts`, `src/app/api/channel/route.ts` |
| Retained game library | `src/components/MiniGames.tsx` |
| Skyline simulation and rendering | `src/game/simulation.ts`, `src/game/renderer.ts`, `src/components/GamePanel.tsx` |
| Coin run, economy and business street | `src/game/enterprise.ts`, `src/game/enterprise-renderer.ts`, `src/components/EnterpriseGame.tsx` |
| Regression checks | `tests/` |
| Optional submission film | `video/` and its README |

Simulation and rendering are separate. Skyline advances at a fixed 120 Hz with swept collision checks; its procedural route tests exercise 64 seeds over 5 km each at maximum speed. Renderers cap pixel ratio, reuse game objects and release GPU resources. Pocket Enterprise settlements are idempotent, purchases cannot overdraw, and saved cities are validated before loading.

## Submission

See [SUBMISSION_REVIEW.md](SUBMISSION_REVIEW.md) for the remaining submission steps and [BUILD_STATUS.md](BUILD_STATUS.md) for current verification. [ASSETS.md](ASSETS.md) records asset provenance. Earlier plans are historical and may describe removed features.

Codex supported planning, the Twitch-style interface, game simulations and renderers, integration, regression tests and the separate Remotion film. The main implementation chat recorded in the project is `01a19028-1860-7ab2-a176-689914c0ff29`; confirm it is the chat containing most of your implementation before submitting.

References: [Twitch embeds](https://dev.twitch.tv/docs/embed/), [interactive player requirements](https://dev.twitch.tv/docs/embed/video-and-clips/), [Twitch authentication](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/).
