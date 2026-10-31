# Sidequest

A solo game companion beside an official Twitch stream. The first playable game, **Skyline Sprint**, is an original low-poly 3D rooftop runner. App and game names, art direction and character are provisional.

The current interface recreates Twitch's dark homepage/channel presentation at the user's request: 50px top navigation, collapsible channel sidebar, centered search, featured carousel, stream cards, category covers, channel tabs, menus and purple controls. The **Mini games** button opens a right sidebar while the homepage and stream remain visible. Selecting a game places it in the upper half of the bar, with the scrollable game library below. The original green marketing layout has been replaced.

Directory cards and sidebar counts are explicitly dated reference previews from the real Twitch homepage, not live API data. Their public image URLs are recorded in `src/lib/twitch-reference.ts`. Selecting a card opens the real official player. Log In, Sign Up, Follow and Subscribe open the corresponding Twitch destination; this app does not collect Twitch credentials or implement Twitch account services. The chat icon opens the official Twitch chat embed.

## Run locally

Requires Node.js 22.13+ and pnpm 11.25.0 (the package manager version used for this build). This build was verified with Node.js 24.22.1.

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:3000. Select a directory/sidebar channel, or enter a channel in the top search field and press Enter. Click **Mini games**, then **Skyline Sprint** to open the runner in the right sidebar. The embedded player starts on an explicit click. The game starts only after **Let’s run**.

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm start
```

The committed lockfile fixes dependency versions. On this Codex Windows machine, pnpm is bundled at `C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd` if it is not on PATH.

## Controls

| Action | Keys |
| --- | --- |
| Change lane | Left/right arrows or A/D |
| Jump | Up arrow, W, Space |
| Slide | Down arrow, S |
| Pause | Escape or pause button |

Click the game to focus it. Leaving its panel, clicking the Twitch player, hiding the browser tab or leaving the window pauses a running game. Resume explicitly. Closing the panel preserves a paused run. Reopening its game card returns to it. The right sidebar remains beside the stream and preserves the player and runner DOM nodes. On narrower screens the channel navigation collapses to leave room; keyboard required. A player narrower than 400px gets a local horizontal scroll area to retain Twitch’s minimum size.

Game sound starts muted. The speaker toggles quiet original synthesized token and collision cues. Speed streaks, the wireframe shield effect, camera tracking, and character banking have been removed. Best score persists locally when storage is available. There is no wallet, account or saved currency balance in this build; collected tokens add to the current run’s score only.

## Twitch setup

The official interactive player works without API credentials. Its `parent` uses the actual page hostname. No viewer or streamer login is required by this app. Twitch may impose its own playback or content restrictions.

For channel identity, title, category, live/offline state and viewer count:

1. Register our own app at the Twitch developer console.
2. Copy `.env.example` to `.env.local`.
3. Set `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`; restart the server.

These credentials and the app token stay on the server. No `NEXT_PUBLIC_` secrets. Requests use client credentials, a bounded 60-second metadata cache, concurrent request coalescing, upstream timeouts, a four-channel concurrency limit, and one token refresh retry after 401. Existing tokens are revalidated hourly. Missing credentials and failed API calls show an honest unavailable state rather than fabricated live data. The embed and standalone game remain independent.

Deploy as a standard Next.js Node server over HTTPS (for example a compatible Node host). Verify Twitch on the **actual production and preview hostnames**, not just localhost. Use an unobscured official player of at least 400 × 300 px. Credentials belong in the host’s secret environment settings. No deployment is configured in this first local build.

References: [Twitch embed requirements](https://dev.twitch.tv/docs/embed/), [interactive player](https://dev.twitch.tv/docs/embed/video-and-clips/), [app authentication](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/), [API](https://dev.twitch.tv/docs/api/reference/).

## Structure and fairness

- `src/components/Companion.tsx`: shell, stable Twitch player, sidebar launch and app fullscreen.
- `src/components/MiniGames.tsx`: right game sidebar, game library and static example game scenes.
- `src/components/TwitchPlayer.tsx`: official player lifecycle, events and channel metadata.
- `src/app/api/channel/route.ts` and `src/lib/twitch-service.ts`: server-only API adapter.
- `src/game/simulation.ts`: deterministic 120 Hz simulation, movement, collision, chunks and score.
- `src/game/renderer.ts`: Three.js geometry, character animation, recycled tiles and obstacle pools.
- `src/components/GamePanel.tsx`: game host, scoped input, focus/visibility pauses and explicit states.

The opening has 96 meters before the first hazard. Introductions use one hazard lane; later rows use two with a token-guided bypass lane. At maximum speed rows are approximately 2.13 seconds apart, allowing a complete two-lane transition and recovery. The fixed-step route tests exercise 64 seeds for 5 km each at maximum speed using actual collision and movement. The generator intentionally uses conservative rows rather than complex sequences at this milestone. Tests also cover jump, slide, gaps, collision, scoring, pausing, frame cadence, parsing and API failure/refresh behavior. Browser play is still necessary to assess feel and readability.

Long frame gaps pause rather than skipping obstacles. Pixel ratio is capped at 1.5, there is no postprocessing or realtime shadow map, GPU geometry/materials are shared, and track tiles and hazard objects are recycled. Render loops, event handlers, resize observers and GPU resources are released on disposal.

See [BUILD_STATUS.md](BUILD_STATUS.md) for verified results and outstanding integration checks, and [ASSETS.md](ASSETS.md) for sources.

## Runner tuning and sound

The runner starts at 18 m/s, rises to 30 m/s, and uses a 96m opening and 64m row spacing. Ten tokens award one shield per run. It absorbs one impact and briefly protects through that obstacle; it resets on a new run. A small text status identifies shield availability. The wireframe aura, speed streaks and motion toggle have been removed.

Enable the speaker for original quiet synthesized music and game effects. Music runs only during active gameplay, stops on pause/close/mute, and defaults muted. No external music samples are used. The current suite has 21 passing tests, including shield consumption and maximum-speed route tests.

## Mini games and fullscreen

The normal game rail takes 35% of the content area (up from 28%, a 25% increase), with a 287.5px desktop minimum. App fullscreen reserves 37.5% for the rail (up from 30%). The selected game and the game library each occupy half the sidebar below its header. Opening the library does not replace the homepage, and changing streams does not close the game.

Use **Stream + games fullscreen** immediately below the video, or **Watch + play fullscreen** above it, to fullscreen the entire app. Twitch's fullscreen control belongs to its cross-origin player and fullscreens only that player; it cannot include app content outside the embed.

Skyline Sprint and Pocket Enterprise are playable. Neon Drift, Orbit Breaker, Pixel Rally, Moon Hopper, and Crystal Match are static presentation examples with in-game scenes, HUDs and control hints. They can be selected in the library but intentionally have no gameplay simulation. Their visual treatment has no Coming soon or Preview only labels, as requested for the demo.

## Pocket Enterprise

Choose Mini games → Pocket Enterprise. Start a 34-second coin run and choose arithmetic gates with A/D, left/right arrows, the visible steering buttons, or pointer drag in the game. Blue gates add/multiply; red gates subtract/divide. A new run begins with 20 free coins. Finish to bank the remaining coins plus a small shop-order bonus. Reaching zero ends the run without spending your saved wallet.

Finish a run to enter the business street automatically. Move with WASD/arrows, the arrow controls, or click/drag toward a ground location. Walk onto a shop pad to invest automatically; partial funding saves and the pad shows the remaining cost. Leave and return to invest again. Open Coffee House (250), Cookie Corner (750), then Burger Club (1,800), each with two upgrade tiers. Walk onto the gold RUN pad to start another run; the street stays inaccessible until that run finishes. Shop order bonuses are capped at 25% of the completed run's coins, so running stays the main source of earnings. There is no offline income or real-money currency.

Coins spread into new formation slots, tumble off the track on losses, stack onto the businessman's hand at the finish, and stream from the hand to the selected business during purchases. Large values use representative visual coins while numeric balances remain exact. Purchases take approximately 0.8 seconds and can be left immediately; accounting does not depend on finishing an animation. The game is silent by design and honors reduced-motion preferences.

Wallet and shop levels save in browser local storage separately from Skyline's best score. Modern browsers synchronize transactions through Web Locks. Storage failures show a session-only notice; unsupported Web Locks show a single-tab warning. In-progress runs stay in memory and are not recovered after reloading. Clicking the stream, leaving the tab, closing the rail or switching games pauses a running game and stops walking; resume explicitly. Shop menus, mode tabs and explanatory overlays have been removed in favor of physical pads, numbers and icons. Coins and gate choices are enlarged.
