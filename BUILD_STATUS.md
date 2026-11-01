# Build status — November 1, 2026

This file supersedes older milestone reports and planning notes. The current app has a persistent Twitch-style interface and two playable Three.js games.

## Current implementation

- Official Twitch player, channel-name/URL search, retries, explicit offline/online status, optional official chat and links to Twitch account actions.
- Dated directory previews, collapsible navigation, featured carousel, categories, channel tabs and purple controls.
- Persistent right game sidebar; two playable games and five clearly labelled visual concepts.
- Skyline: 54–90 m/s rooftop runner, 120 Hz fixed-step simulation, swept collisions, tokens, one earned shield, best score, optional original synthesized sound/music, keyboard and compact pointer controls.
- Pocket Enterprise: approximately 11.3-second arithmetic-gate run, wallet settlement, free-walking business street, partial investment, ordered shop unlocks/upgrades, collision and local city persistence.
- Focus, window/tab visibility, panel close and game switch pause active runs; resume is explicit. Player and game instances survive layout changes.
- App fullscreen includes stream and games. Phones stack games below the stream. Twitch keeps its 400 × 300 minimum inside a contained scroll region.

## Final polish

Menus dismiss on outside click or Escape and restore trigger focus. Channel selection returns to the player. Player-script failures/timeouts offer retry. Dynamic games have bounded loading states. Skyline button icons preserve input focus and audio nodes disconnect after playback. Pocket Enterprise detects graphics-context loss, offers settlement retry and refreshes partial-investment signs. Save validation rejects malformed preferences and impossible city states. Game controls and shell use Twitch's purple/dark treatment. Short panels retain usable game space; narrow layouts contain overflow.

Root type checking excludes the optional video project and generates Next.js route types before checking, enabling a clean checkout to validate without starting the app. GitHub Actions runs install, tests, typecheck and build.

## Verification

- 42 automated tests pass. Coverage includes movement/actions, all Skyline hazards and swept edge collisions, shield isolation, fixed-step cadence, 64 seeds × 5 km at maximum speed, all six-gate paths across four coin-run arrangements, settlement idempotency, investment/upgrade accounting, business walls, malformed saves/preferences, channel parsing and simulated API failures/token retry.
- TypeScript and production Next.js build pass. The optional video project also passes its own TypeScript check and Remotion bundle.
- Browser: official Twitch SDK loaded, NightngaleTV reported offline, ESLCS reported online and playback was started through the official player.
- Browser: Pocket Enterprise finished a run, banked 155 coins and entered the walking town. Switching games preserved that wallet.
- Browser: Skyline started and paused at 14 m, retained its paused run across switches, and resumed through its own controls.
- Browser: menu Escape dismissal, invalid URL error and valid channel-URL normalization work.
- Browser: app fullscreen entered and exited with the retained game. Layout checks at 390 × 844, 1024 × 768 and 1440 × 900 contained document overflow; mobile player remained 400 × 300 and the game stacked below it.

## External limits

Live credentialed Twitch metadata and hosted-domain playback remain unverified. External channels, Twitch ads/content restrictions and network conditions remain controlled by Twitch. Long-duration human playtesting/performance evaluation is still useful.

The separate Remotion film is optional, not an app runtime dependency. It preserves the existing local music edit while allowing a silent repository preview. Unused private chat captures, raw unused capture sequences and standalone stock music are excluded from Git. Final video publication, broadcast permissions, genuine Codex build footage and the Devpost entry remain submission steps; see SUBMISSION_REVIEW.md.
