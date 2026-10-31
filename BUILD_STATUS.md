# First playable build — October 31, 2026

## Pocket Enterprise — second playable game

Implemented a separate 34-second, six-gate coin runner with a saved business street. Two-lane movement supports arrows/A/D, visible buttons and pointer drag. Arithmetic gains/losses, pickups, one-time run settlement, three ordered shop unlocks, two upgrades per shop and capped order bonuses are working. State is separate from Skyline. Web Locks serialize profile transactions across supported browser tabs; failures and unsupported storage/locking show explicit notices.

Original Three.js visuals include coin formation reflow and gate-sourced additions, falling/tumbling losses, sequential curved flights into short palm stacks, rapid coin payment into the chosen shop, staged shop growth, colored storefronts and distinct counter items. Representative coin counts keep rendering bounded. Transactions commit separately from visual counters. Payment runs for 0.8 seconds; animations freeze while the panel is hidden. No imported game assets, rainbow effects, sound or offline earnings.

Verification: all 27 tests pass, including all 64 six-gate routes across four round arrangements, economy and invalid-save tests. Browser QA completed real runs for 155 and 230 coins, banked 385, bought Coffee House for 250 and verified the remaining 135 plus level-one shop after reload. App fullscreen preserved the run; a discovered canvas sizing issue on exit was fixed and rechecked (316px game/scene width and 316px scroll width inside a 338px rail). The latest reference Twitch channel was offline, so this change does not claim new live-video performance verification. Production build and TypeScript pass; longer human gameplay/performance feedback remains useful.

The catalog now contains two playable games and five static concepts. The new game retains its session across library switches and rail close/reopen; only city progress, not active runs, persists through reload.

Implemented in Codex chat `01a19028-1860-7ab2-a176-689914c0ff29`.

## Twitch-style redesign — October 31 follow-up

The user requested a faithful recreation of Twitch's visible website and purple mini-game controls. The original green landing design has been replaced with Twitch's dark palette, Inter typography, 50px navigation, collapsible 240px sidebar, centered search, featured carousel, public channel previews, category covers, tag pills, channel navigation, account links and menu treatments. Mini-game launch, resume, replay and panel controls now match the purple theme. The independent-app identification remains visible.

The real Twitch homepage and BobRoss channel page were inspected in the browser. Reference channel names, avatar/thumbnail/cover URLs and captured viewer counts are recorded in `src/lib/twitch-reference.ts`. Directory cards are labeled PREVIEW, and counts explicitly say they are captured values. These are not claimed as current API results. Log In, Sign Up, Follow and Subscribe lead to Twitch; no imitation authentication or payment forms are implemented.

An optional official Twitch chat iframe uses the actual parent hostname and Twitch's dark presentation. Chat content is supplied by Twitch, with no simulated messages. Its panel can be collapsed. Chat is independent of gameplay and does not control the runner.

Browser verification now includes **real live NightngaleTV video playing alongside the running 3D game**. The player continued through a game-side change and its normal Twitch ad break. This closes the earlier local live-playback availability gap; production-domain playback and credentialed API verification remain open. The redesigned page also successfully loaded the official chat room. Search validation, channel-URL normalization, channel tabs, the navigation menu, sidebar collapse, and purple game launch were checked. At 390 × 844, the game stacks, the document has no horizontal overflow, and the primary button computes to `rgb(145, 70, 255)`. Chat-induced narrow content switches to one column while keeping its official player scroll area. The production build and TypeScript checks pass.

## Delivered locally

- Next.js / TypeScript shell with a single honest playable shelf card below the player.
- Standalone mode and stream-adjacent mode using the same retained game instance.
- Actual Three.js perspective runner, original geometric character and sunset rooftops.
- Three lanes, jump, slide, low barriers, overhead arches, cargo blockers and gaps.
- Token trails, distance, score, gradual speed increase, collision results and immediate replay.
- Explicit ready/running/paused/over states; local best score and side/motion preferences.
- Audio defaults muted; original quiet synthesized sound cues behind an explicit toggle.
- Focus-scoped keyboard input, window/tab blur pauses, close/reopen pause and explicit resume.
- CSS side/size changes preserving the player and game DOM instances; stacked narrow layout.
- Real official interactive Twitch player with hostname-derived parent, ready/online/offline/blocked playback handling, retry and channel changes via `setChannel`.
- Server-only Twitch API path with app authentication, token recovery, timeouts and bounded caching/coalescing. Its credentials are not configured.
- Setup instructions, environment example, dependency lockfile and asset/source record.

## Verified

- Production `next build` passes, including Next.js TypeScript checks.
- Standalone `tsc --noEmit` passes.
- 20 automated tests pass. They cover movement/action transitions, all hazard collisions, jump/slide at 12/18/24 m/s, token accounting, paused states, frame cadence equivalence, input parsing and API behavior using explicit test responses.
- The cross-row test drives actual simulation movement/collision through 64 seeds, 5 km per seed, at maximum speed. Other tests check token trail safety. This proves a bypass route for the deliberately conservative row library; it does not establish fairness for future complex patterns.
- Production server returns HTTP 200.
- Browser: 3D canvas renders, lane change collects tokens, run reaches collision/results, replay resets distance/tokens, best remains visible.
- Browser: Escape pauses, explicit resume works, typing in channel field pauses, closing/reopening retains the paused distance/token count.
- Browser: official Twitch embed loads; `twitch` and `monstercat` reported offline. The player retained its iframe/AX identity through left/right switching, size changes and `setChannel` changes. No deliberate reload is used for those operations.
- Browser: 390 × 844 breakpoint stacks the panels, contains document overflow and retains a 400 × 300 iframe inside its scroll area. Keyboard support is disclosed; touch controls are not implemented.
- Browser: saved best score and layout preference survive reload. Audio starts muted.

## Still to verify / configure

1. **Longer live playback / performance checks**. Real live playback beside the game is now verified locally in the redesign follow-up above. Test longer sessions and the eventual hosted domain.
2. **Credentialed Twitch API**: set our registered app’s client ID/secret in `.env.local`. Automated API tests use test responses; they are not live API evidence. Missing configuration currently returns HTTP 503 with `not_configured` and the UI says so.
3. **HTTPS deployment and actual production/preview hostname playback**. No hosting destination, source remote or deployment was configured in this build.
4. Longer human playtesting, narrow-panel camera tuning, laptop performance while decoding live video, blocked playback, tab-visibility and player-click interactions across browsers.
5. Final names, models and visual direction remain provisional. Token wallet, cosmetic progression, missions, power-ups, touch controls and additional stages are not part of this first build.

The offline embed emitted one warning from Twitch’s internal player bundle about its own listener count. No app-origin console exception was observed. Do not change Twitch’s player internals to suppress it.

Milestone 1 now has a playable local implementation and verified local live playback. Milestone 2 is partly implemented and awaits real credentials, hosting and further game-feel testing. No claim of release readiness is made.

## Continue

Run the commands in README.md. Start with a real live channel and our developer app credentials, verify the live/API path, then tune gameplay based on actual runs. Keep the simulation and renderer separate and preserve player identity during layout changes. Update this status with evidence as integration gates close.

## Compact fullscreen and game enhancements

Added native app fullscreen through the visible Watch + play fullscreen button. Browser verification measured 1344px stream and 576px game at 1920px fullscreen width (70/30), then successfully exited with the retained paused run. Normal layout measured 553px stream / 230px game, with a 420px canvas viewport. Shelf is bounded to 175px and has 641px of scroll content, including exactly five labeled, nonfunctional preview games in addition to Skyline Sprint.

The runner now starts 50% faster at 18m/s and tops out at 30m/s. Row spacing is 64m and opening distance 96m. Added one shield earned at ten tokens, visible shield geometry, a speed HUD, optional streak effects, and an original Web Audio synth loop. Music toggle and running-state startup were exercised in browser; subjective music quality still benefits from human listening. Sound was restored to muted after testing. Build and TypeScript pass; 21 automated tests pass, including shield accounting and 64 maximum-speed routes over 5km each.

## Right-hand mini-games sidebar revision — October 31, 2026

Supersedes the compact shelf and 70/30 fullscreen arrangement above. The homepage's Sidequest companion entry is now a clickable Mini games button. It opens a right-hand rail without hiding the homepage or stream. The selected game occupies the top half below the rail header; the scrollable six-game library occupies the lower half. Removing the selection restores the full-height list. The runner remains mounted and pauses across selection, sidebar close/reopen, and fullscreen transitions.

Normal width is now 35% of available content (previously 28%), with a 287.5px desktop minimum (previously 230px). App fullscreen is 62.5% stream / 37.5% games, a 25% increase from the prior 30% game allocation. The stream-adjacent Stream + games fullscreen button targets the entire app. Twitch's internal fullscreen control still targets only its own cross-origin player.

The five presentation games now have original static in-game compositions, HUDs and selectable cards instead of geometric placeholders and Preview only / Coming soon labels. Only Skyline Sprint has game logic. Removed the recently added speed streaks, wireframe shield geometry, camera tracking/banking and motion toggle. Shield simulation, basic status, music, original runner geometry and game speeds remain.

Validation: TypeScript and production build pass. All 21 existing tests pass using node --import tsx --test --test-isolation=none tests/channel.test.ts tests/simulation.test.ts (the ordinary test runner was blocked from spawning workers by the sandbox). Browser QA at 1066×1004 measured a 338.8px rail, with equal 453px game/library sections. Native app fullscreen at 1920×1200 measured a 1200px stream and 720px rail; game and library sections were each 576px. Switching Skyline → Neon Drift → Skyline retained the paused 9m run. New local preview is http://127.0.0.1:3001; port 3000 was serving the previous production build during QA. Metadata credentials remain absent; this revision does not assert new production or video playback verification.

## Walk-to-invest revision

Replaced Pocket Enterprise shop menus and mode tabs with free movement (WASD/arrows, pointer destination and held directional buttons). Runs must finish before the business street is accessible; payout automatically returns the businessman to town. Entering a shop pad invests available wallet cash, including saved partial funding; leaving and re-entering is required to invest again. A physical gold RUN pad starts the next run. Coins are larger, runner camera closer, gate signs taller and the large numeric choices are clickable. The visible game UI is reduced to currency, gate numbers, play/pause and movement icons. Existing saved cities migrate with zero initial partial funding.

## Faster Pocket Enterprise

Tripled runner simulation time and lateral responsiveness (34 seconds → about 11.3 seconds), tripled walking speed (4 → 12 units/second), expanded the business ground to 26×28 and walking bounds to x ±10, z −11…10. Shops/pads are spread farther apart; the town camera follows the businessman. Running coins rotate sideways about the vertical axis while collection stacks remain flat. All 31 tests pass, including the new timed-run regression and updated walking checks.
