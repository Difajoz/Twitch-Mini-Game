# Solo game companion — implementation plan

Updated October 31, 2026. Status: first local implementation built; see BUILD_STATUS.md for verified behavior and remaining integration gates. This document covers the product and build. Hackathon background and submission requirements are supplied separately in NEXT_CHAT_CONTEXT.md.

## 1. Product definition

Build a standalone web app where viewers can play a solo game beside an official embedded Twitch stream. A game shelf sits below the video before a game is selected. Opening a game creates a side-by-side watch/play layout, with the viewer choosing left or right placement. The stream remains visible while they play.

The game also works independently, without a stream. No chat commands, multiplayer, streamer installation or channel authorization are required. The app has its own identity and does not modify Twitch's website or present itself as an official Twitch feature.

First release: one complete, polished 3D endless runner. Additional games can follow after the core experience is finished.

## 2. Game direction

### Confirmed experience

The user's gameplay reference is Subway Surfers: a real 3D runner viewed from behind the character, with automatic forward movement and three lanes. Preserve the familiar movement vocabulary and fast replay loop, using original characters, models, environments, obstacle arrangements, interface, animation and audio. Do not substitute a side-scroller or a shallow 2D perspective.

The game needs its own visual identity. Do not reuse the reference game's name as our title, extract its assets or reproduce its exact world and presentation. Final app title, game title, character and setting remain undecided. The previous courier-robot/floating-garden concept was a suggestion, not an approved theme.

### Core run loop

1. Show a ready screen with a character preview and concise controls.
2. Start on explicit input, with a forgiving opening stretch.
3. Run automatically through three lanes, collecting tokens and avoiding obstacles.
4. Increase pace gradually to a tested maximum.
5. End the run on a clear collision or missed gap; show score, distance, collected tokens and personal best.
6. Restart immediately or return to the shelf.

### Controls and movement

| Action | Desktop control | Behavior |
| --- | --- | --- |
| Change lane | Left/right arrows or A/D | Responsive movement between three fixed lane centers |
| Jump | Up arrow, W or Space | Consistent jump arc and readable landing |
| Slide | Down arrow or S | Brief lowered collision shape with clear animation |
| Pause | Escape or visible pause button | Freeze simulation and show explicit resume |

Allow lane changes during jumps and slides. Define input buffering, slide duration and action transitions centrally so movement can be tuned without rewriting the game. Swipe controls are a later enhancement.

### Obstacles and fairness

Use a small, readable set: low barriers to jump, overhead structures to slide beneath, solid blockers to dodge and clearly marked gaps to jump. Introduce these progressively. Collectible trails can guide choices but must not lead into unavoidable collisions.

Build authored track chunks and select among validated combinations. Reachability must account for current lane, speed, lane-change time, jump/slide timing and chunk boundaries; an empty lane by itself does not prove a pattern is possible. Keep a safe opening and minimum reaction window at maximum speed. Collision shapes must match what players perceive.

### Progression and expansion

The first build needs distance, score, collectible count, personal best and saved settings. The completed prototype should add a small persistent token balance and cosmetic unlock track if the core is stable. Keep in-run collections separate from saved totals to prevent duplicate rewards on restart.

Next priorities: one well-tested power-up, simple missions and changing stage segments. Candidates are a collectible magnet or a temporary shield, each with an obvious duration and effect. A second environment follows only when the first is polished. Multiple environments, a full shop and a large character roster are outside the initial build.

## 3. Visual and audio direction

Use stylized, readable 3D: an expressive original character, strong obstacle silhouettes, coherent lighting and restrained effects. Begin with original low-poly geometry and a simple animated character; upgrade models without blocking playable movement.

Use a trailing perspective camera that keeps upcoming choices visible in a narrow side panel. Tune field of view, lane spacing and obstacle visibility for the actual watch/play layout. Camera shake and motion effects should be optional. Distinguish hazards through shape as well as color.

Game audio starts muted with a visible toggle. Add original or appropriately licensed sounds after the run feels good. Avoid making the stream harder to hear. Maintain an asset/source/license record as assets are added.

## 4. App experience

October 31 implementation follow-up: the user changed the website's visual direction to a close recreation of Twitch's current dark/purple interface, including navigation, channel sidebar, directory cards and controls. The current local build follows that direction while retaining independent-app identification and the original runner. Optional chat uses Twitch's official embed. Public directory reference previews are dated and must not be presented as live API results.

### Watch mode

- Accept a Twitch channel name or supported channel URL and normalize it to a validated identifier.
- Show the official player, channel information and the game shelf below the video.
- Launch the runner beside the stream; default to the right, with a visible left/right switch.
- Preserve the Twitch player instance through game opening, closing and side changes.
- Keep the selected game session intact when its panel changes size or side.
- Closing an active game pauses it; offer resume or a deliberate new run on reopening.

A simple layout size toggle is sufficient initially. Add a bounded draggable splitter only if it improves usability without destabilizing playback or the canvas. The shelf contains one honest, playable game card; avoid filler cards presented as working games.

### Standalone mode

Offer a clear “Play without a stream” entry. Use the same game and progress, with a larger play area. Twitch outages or missing API credentials must not prevent standalone play.

### Focus and responsive behavior

Game controls operate only when the game panel is active, never while typing in a channel field. Clicking the player or leaving the page pauses the game; returning does not silently resume it. Handle browser tab visibility changes as well as ordinary focus changes.

Target desktop first. Stack panels on narrow screens when side-by-side would make either unusable, and explain the desktop control requirement until touch support exists. Keep the stream on the page and preserve Twitch's minimum player dimensions. Do not advertise full mobile support until tested.

## 5. Twitch integration

Use the official interactive embedded player plus read-only channel metadata from Twitch's API. Display channel identity, stream title, category and live/offline state. These features support channel selection while gameplay remains independent.

Use our own registered Twitch developer app and an app access token for supported public-data endpoints. Streamer/viewer account authorization is not part of this scope. Keep the client secret and app token server-side; document required environment variables without committing credentials.

Handle blocked autoplay with click-to-play. Handle ready, online and offline player events, metadata failure and channel changes. Metadata failure must show an honest unavailable state; it must not fabricate live data or stop the game. Cache requests briefly, bound request frequency and recover from expired tokens.

Deployment requires HTTPS, correct parent hostname configuration and an unobscured official player. Video embeds must meet the documented 400 × 300 pixel minimum. Verify these on the actual deployed domain early, including any preview hostname used for testing.

References: [embed requirements](https://dev.twitch.tv/docs/embed/), [player documentation](https://dev.twitch.tv/docs/embed/video-and-clips/), [Get Streams](https://dev.twitch.tv/docs/api/reference/#get-streams), [app authentication](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow).

## 6. Technical approach

Recommended baseline: TypeScript, React through Next.js for the interface and server endpoints, and Three.js for actual 3D rendering. This replaces the earlier Phaser/2D recommendation. Render the game only in the browser. A direct Three.js scene is sufficient; a React renderer is optional if it simplifies implementation.

Keep responsibilities separate:

- App shell: navigation, shelf, panel placement, settings and accessible menus.
- Twitch adapter: player lifecycle, channel parsing, server requests and metadata states.
- Game simulation: movement, chunk selection, collision, scoring and run state.
- Game renderer: scene, camera, character animation, effects and resize handling.
- Persistence: versioned settings, personal best and progression, with safe defaults if browser storage fails.

Use a fixed-step simulation or another tested frame-rate-independent update method. Pause or clamp long frame gaps. Keep high-frequency movement outside React state. Recycle track chunks and objects; cap render pixel ratio and avoid expensive effects while decoding video. Release listeners, animation loops and GPU resources on disposal.

Model run states explicitly: ready, running, paused and game over. Expose a small host interface for pause, resume, resize and results. No account system, database, multiplayer service or runtime AI API is required.

References: [Three.js scene fundamentals](https://threejs.org/manual/pages/creating-a-scene.html), [Next.js route handlers](https://nextjs.org/docs/app/getting-started/route-handlers).

## 7. Build milestones

| Milestone | Deliverable | Completion gate |
| --- | --- | --- |
| 1 — First playable build | App shell, standalone entry, real Twitch embed, shelf, side switching; one 3D track and character with lanes, jump, slide, obstacles, collectibles and replay | A real run is playable locally; stream playback and side switching work without deliberate player reloads |
| 2 — Integration and game feel | Channel API metadata, focus/pause behavior, tuned camera, fair chunk generation, speed curve and persistent best score | Runs remain fair and readable; deployed playback and API integration work |
| 3 — Finish the prototype | Original presentation, sound toggle, local progression; power-up or stage variation if stable | Both modes feel complete and remain smooth together |
| 4 — Release verification | Fresh-checkout instructions, environment example, asset record, production checks and defect fixes | Repository and hosted app reproduce the demonstrated behavior |

Aim for milestones 1–2 on October 31, polish on November 1, and verification on November 2, leaving the evening free for submission work. These are targets, not promises; cut optional content when core work takes longer.

If Twitch credentials or hosting access are unavailable, complete the local game and embed setup, document the exact missing dependency and continue independent work. Do not replace the live connection with simulated evidence.

## 8. Verification and acceptance

The first build is ready for review when:

- The game is truly 3D with a trailing camera, three lanes, jump and slide.
- Obstacles, collectibles, scoring, game over and restart work end to end.
- Standalone and stream-adjacent play use the same game.
- The shelf is below the video, and the game can open on either side.
- Typing, player interaction and focus changes do not accidentally control the game.
- Game audio defaults to muted; pause and resume are explicit.
- Real Twitch playback is tested where available, with unresolved access dependencies reported precisely.
- Build/type checks pass and no secrets are committed.

Before release, also test live/offline/invalid channels, API failure, blocked autoplay, browser reload, saved progress, game resizing, side switching, ordinary laptop performance and narrow layouts. Check obstacle reachability across chunk boundaries and at maximum speed. Test collisions and movement at different frame rates.

Use focused automated checks for simulation rules, reachability, reward accounting and API error handling. Use browser testing for camera readability, game feel, video continuity and visual layout. Capture a reproducible failing sequence when a generated pattern is unfair.

## 9. Scope and decisions

Confirmed: solo independent gameplay; a 3D three-lane runner in the Subway Surfers gameplay style; original assets/models; a game shelf below the video; left/right placement; standalone mode; one polished game first.

Proposed technical defaults: Next.js, TypeScript and Three.js; official Twitch player plus read-only API metadata; keyboard-first controls; browser-local progress.

Open creative decisions: app/game name, character, setting, palette and final models. Choose coherent provisional originals for the first playable build and make them easy to replace. These decisions must not delay testing movement and real Twitch playback.

Main risks: simultaneously rendering 3D and video, narrow-panel readability, unfair generated patterns, and expanding content before the core works. Address them through an early playable build, performance checks and strict milestone gates.
