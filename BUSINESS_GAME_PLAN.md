# Pocket Enterprise — proposed second playable game

Planning only. No implementation or publishing authorized by this document. Working title; original art, branding, UI and level layouts.

## Research and interpretation

The closest match is Rollic's Money Rush. The publisher's store descriptions explain a loop of rolling coins, choosing arithmetic gates, converting the result into spendable currency, and building income-producing shops. This confirms the requested genre: a gate-choice runner connected to a small-business tycoon progression layer.

Primary sources inspected October 31, 2026:
- https://apps.apple.com/us/app/money-rush/id1580099513
- https://play.google.com/store/apps/details?hl=en_US&id=com.wixot.coinroll

These are publisher descriptions, not evidence of hands-on play. The specifications and balancing below are our proposals, not claims about the reference game's exact implementation. Borrow the broad mechanic, not its name, models, screenshots, audio or level designs.

## Core loop

You are a small-business owner with an empty shopping street. Run a rolling gold coin along a short track, pick gates, finish with a larger coin total, bank the earnings, and spend them to open and improve shops. Return for another short run to fund the next business.

City → start run → collect coins → choose gates → finish and bank once → build/upgrade → repeat.

The businessman appears in the town scene beside the shops. On the track, the player controls a rolling coin and its growing coin group, rather than another running human. Skyline Sprint remains a separate game with separate progress.

## The runner

- Perspective 3D camera behind the coin, two side-by-side gate lanes. Automatic forward motion; left/right arrows or A/D choose a lane. Drag controls should use pointer capture and stay inside the game. Jumping/sliding are unnecessary here.
- Runs last approximately 35–45 seconds and contain six gate pairs, with at least three seconds of readable choice time per pair. Initial speed is fixed so the player can compare numbers while watching a stream.
- Start each run with 20 coins, freely supplied. Collect small coin groups between gates. No wallet debit is required to retry.
- Blue gates are gains: +10, +30, ×2. Red gates are losses: −10, −20, ÷2. Show the symbol and number prominently; color is additional information rather than the only cue. Swap left/right positions across rows.
- First pair teaches the requested example: blue ×2 versus red −20. Later pairs can be blue +30 versus blue ×2, or red −10 versus red ÷2. At 20 coins, +30 beats ×2; at 80 coins, ×2 wins. There is no universally correct lane.
- Passing a gate triggers exactly once when the lead coin crosses its scoring plane. Resolve the lane from the lead coin's actual position. Never split the visual group across both gates or apply both operations. A center seam uses an explicit deterministic nearest-lane rule, with the chosen lane highlighted before impact.
- Current coin count is an integer. Division rounds down; subtraction floors at zero. Reaching zero ends the run with no payout and a free retry. Previously banked money and businesses remain intact.
- Successful runs bank the final coin count at 1 coin = 1 in-game cash. Clearly distinguish current run coins from saved wallet cash. No real money or Twitch Bits.
- Begin with authored, bounded levels and at most two ×2 opportunities per run. Verify all reachable totals stay under the proposed 600-coin starting-tier maximum; do not hide a payout cap behind an apparently unlimited multiplier.
- Show compact gate feedback such as “40 → 80”, accompanied by the physical coin choreography specified below. Coin count and animated formation must agree; additions and losses cannot be represented by unexplained pop-in or disappearing meshes.

Example path, before optional floor pickups: 20 → ×2 = 40 → +30 = 70 → ×2 = 140 → −20 = 120 → +40 = 160. Final runs have six pairs; this short path only illustrates arithmetic.

## Visual direction and coin choreography

The visual goal is tactile, quick and readable: rolling metal, a formation that makes room, losses flung into empty space, and fast streams of coins between the track, the businessman's hand and his businesses. These are first-release requirements, not optional polish after the economy is finished.

### Art and camera

- Use a stylized miniature business district with solid silhouettes, warm gold coins, an ivory/slate track and strongly readable blue/red gates. Coins have thickness, a beveled rim and an original stamped mark, with restrained metallic highlights. Use original character and shop models.
- Give the businessman an expressive but simple design: rolled sleeves, vest, an open palm and a slightly oversized head/hands so the collection animation reads at sidebar size. Keep his face visible during the finish handoff.
- Use a steady trailing runner camera. At the finish, ease into a three-quarter view that shows the palm and coin stack together. In town, show the businessman and selected shop in the same composition so spending has a visible origin and destination.
- No rainbow trails, constant sparkles, flashing screen washes, large particle explosions or camera shake per coin. Effects must not compete with the stream, cover gate labels or make motion harder to read.

### Addition: the formation opens up

1. Before a floor pickup, nearby coins slide outward or backward into their new slots, creating an actual gap. The collected coin rolls from its visible pickup position into that gap, rather than appearing inside another coin.
2. At a positive gate, the existing formation smoothly fans out and lengthens. New coins enter in a short staggered stream from the gate's base slot, roll into those reserved spaces and settle with a small tilt. Multipliers produce a clearly larger stream, rather than simply enlarging every coin.
3. Preserve each surviving coin's identity and stable slot order. Use short eased movement and light spring settling; avoid random rearrangement, interpenetration and a swarm that obscures the lead coin.
4. Suggested timing: 80–120ms to begin making room, 180–280ms travel/settle per coin, overlapping starts. The whole gate response completes within roughly 350–550ms and never stops forward movement or lane control.

### Loss: coins are thrown into the void

1. Select the lost coins from the formation's outside/rear. Give each an outward/upward impulse, a brief tumble and a downward arc beyond the track edge. The empty space outside the track should make their departure clear.
2. Eject them in a rapid stagger with slight deterministic variation in angle/spin. A division gate causes a larger, coherent peel-off; a small subtraction removes a short burst. They do not flash out of existence on the road.
3. Remaining coins close the empty slots with a quick inward movement. Their path stays controllable and visually connected; the whole formation is not knocked sideways.
4. Suggested timing: 250–450ms for the visible throw and reflow. Recycle lost coins only once below/outside the visible scene, with a hard lifetime for performance. If the total reaches zero, let the final coins fall for at most 450ms before showing the retry action.

### Finish: stack onto the businessman's hand

1. The track visibly terminates at a collection point beside the businessman. He extends an open palm; the leading coin takes a short curved path onto it and lands flat.
2. Remaining coins follow one after another, with overlapping flights. Each lands above the previous one in a tidy stack. Add a small hand/stack dip on contact and slight settling of the upper coins; do not bounce the entire character for every arrival.
3. The formation shrinks as coins leave, so there is a clear transfer rather than coins being duplicated at both ends. The animated earnings counter follows arriving value and resolves to the exact payout.
4. Start the handoff within 150ms of the finish; aim for a 650–1,000ms transfer and a complete finish-to-invest transition within 1.3 seconds. A larger reward makes a denser/faster stream, not a longer wait. The hand may form a few short neighboring stacks at high totals so it does not become an implausibly tall tower.

### Purchase: pay from the hand, one coin after another

1. On an affordable purchase, reserve/commit the exact cost once, then tilt the businessman's palm toward the selected shop's purchase pad, till or open counter. The hand-held stack acts as the town wallet's visual representation and persists into this shot.
2. Coins peel from the top, drop in a rapid sequence along a short arc and land at the purchase point. The visible stack shrinks while the payment counter fills. No simultaneous vanishing pile followed by a completed building.
3. Link payment to construction: reveal the base, counter/equipment and sign in two or three quick stages as the paid fraction advances. End with a small sign flip to OPEN, a restrained character nod and the first customer entering. Upgrade purchases similarly add the relevant equipment or facade change.
4. Aim for 500–850ms payment and a finished shop/upgrade within 1.2 seconds of clicking. Purchase duration is bounded regardless of cost. No hold-to-pay input and no forced seconds-long build timer. Only genuinely affordable purchases start the animation.

### Fast pacing, sound and accessibility

| Event | Total visual target | Input behavior |
| --- | --- | --- |
| Pickup / gate gain | 350–550ms | Keep steering immediately responsive |
| Gate loss | 250–450ms | Keep steering immediately responsive |
| Finish → hand → results/invest | At most 1.3s | Offer immediate Run again / Invest; selecting either completes the remaining presentation |
| Purchase → open shop | At most 1.2s | Other navigation remains available; prevent duplicate payment only |

- For small amounts, show individual coins literally. For large balances/prices, use a bounded representative stack and a dense stream of roughly 24–64 visible coins; the numeric counters remain exact. Do not animate thousands of separate one-unit drops or pretend that the physical model count always equals wallet cash. The flow must still read as coins arriving/leaving sequentially, not a single chunk teleporting.
- Use gold glints only at a gate, first stack landing and completed payment. Optional muted-by-default audio uses a short rolling texture and a capped/rate-limited sequence of soft metal clicks; never one loud sound per currency unit.
- Support reduced motion with direct short slides or fades, no spinning throws and no camera travel. All reward and purchase information remains visible in text. Skipping an animation must never change the amount earned or spent.
- Pause choreography when the game loses focus. On return, resume or finish its presentation without repeating its economic operation. Leaving the panel must never trap the user in a payment screen.

### Technical approach for the motion

- Use instanced coin geometry, pooled visual coins and a bounded effects queue. Animate controlled trajectories and slot targets; a full rigid-body physics engine is unnecessary. Stable IDs connect formation coins to pickups, ejections and handoff.
- Separate authoritative run/wallet values from display counters and presentation phases. Compute/apply each gate once; visual motion catches up within its fixed time budget. Rendered coin paths never determine whether cash is credited.
- Commit run settlement and purchases atomically before their success presentation. Rapid clicks, animation skip, focus loss and reload must not repeat a reward or payment. If saving fails, resolve according to the session-only policy before claiming persistent success.
- Camera framing, stack height, coin pool count and material highlights must work both at roughly 340px sidebar width and in app fullscreen. Keep all gate labels readable throughout reflow/ejection.

## Businesses and economy

First release: a compact original 3D street with three unlockable storefronts. No separate town walking simulation is needed. Select a building or its action card to buy or upgrade it.

| Business | Proposed opening cost | Shop presentation | Base order bonus per completed run |
| --- | ---: | --- | ---: |
| Coffee shop | 250 cash | Espresso machine, cups, outdoor counter | 10 cash |
| Cookie shop | 750 cash | Cookie trays, oven, striped awning | 20 cash |
| Burger shop | 1,800 cash | Grill counter, stools, original burger sign | 35 cash |

These values are initial tuning targets. Target the first shop within two successful introductory runs; unlock all three in roughly 8–12 minutes of mixed play. Verify against actual route payouts before fixing prices.

- Buy shops in order, then offer two upgrades per shop. Show purchase price and the exact benefit before spending. Each upgrade changes the facade or equipment so growth is visible.
- Keep running as the main money source, as requested: businesses add an order bonus after a successful run. Total shop bonus is capped at 25% of that run's gross earnings. The result screen separately lists run earnings, shop bonus and total deposited.
- Example: 160 run earnings + 10 coffee bonus = 170 deposited. If all shops nominally offer 65 cash on that same run, the bonus is limited to 40, and the interface explains the limit.
- No offline or real-time passive income in the first version. This is a deliberate proposal to avoid letting the city replace the runner as the main source. If idle income is wanted later, add it as a small, visibly capped supplement with separate clock/claim rules.
- Locked shops display cost and unlock requirement. Affordable actions are clear; unaffordable actions show the amount still needed. Avoid a shop interface that merely displays a price without explaining how to earn it.
- Opening a business and each upgrade play a short celebration; customers and small service animations make the street feel active. Keep this restrained and muted by default.

## Integration with the existing app

Add Pocket Enterprise as another genuinely playable library card, without replacing Skyline or any current example. Replace the hardcoded “6 games” with the actual catalog count.

Use the existing right-hand sidebar and fullscreen arrangement. Its upper half shows this game's active view; the lower half continues to show the game library. Inside the active game, provide two clear tabs: **Run** and **Businesses**. Do not put a second shop list into the library area or open a page-covering overlay.

The Businesses tab defaults to a compact street view, wallet, next purchase goal and selected business details. The Run tab shows coin total, track progress, pause, and large gate labels. End-of-run results offer **Run again** and **Invest earnings**.

Pause on clicking the stream, switching games, changing tabs, closing the sidebar, or hiding the browser tab. Resume deliberately. Preserve the run and town when resizing or entering app fullscreen. Never remount the Twitch player to launch this game.

For the smallest desktop rail, prioritize readable gates and a single selected business card; scroll only the business details if needed. Check a roughly 340px-wide rail and a 16px minimum gate label. Keep desktop-first status explicit until touch input and narrow layouts are verified.

## State, persistence and correctness

Keep a new business-run simulation separate from Skyline's simulation. Share only useful rendering/input infrastructure after checking it fits; do not modify Skyline's obstacle rules to implement gates.

Model states: town, ready, running, paused, results. Save a versioned, validated local profile containing wallet, shop levels, completed run ID and progression tier. Current runs may remain in memory; promise saved city progress, not cross-device accounts.

Run settlement must be idempotent: mark a unique run ID as paid in the same profile write that updates wallet and progression. Reopening results, repeated finish input and reload must not award the run twice. Stage state changes and persist them before displaying purchase success. If local storage fails, show a session-only progress notice; do not silently promise durable saves. Define multi-tab behavior so stale tabs cannot overwrite newer shop/wallet progress.

Use integer arithmetic with validated bounds; reject negative costs, invalid balances, unsupported save versions and out-of-range shop levels. Disable repeated purchase input during settlement. Keep cash earned in a run separate from banked cash.

## Build order

1. Implement/test a deterministic six-gate run: lane movement, pickups, arithmetic, zero-coins loss, finish, pause and restart.
2. Build the physical coin formation first: reserved slots and incoming coins, loss ejection into the void, bounded representative stacks and clear gate labels. Test it in the real sidebar beside video.
3. Add wallet settlement and saved progress, the businessman hand-stack finish, then three businesses and two upgrade tiers with fast sequential coin payment and staged construction.
4. Integrate game selection, Run/Businesses tabs, focus pauses, retained sessions and fullscreen.
5. Tune rewards, first-shop timing and upgrade costs through real runs; record a genuine run → bank → buy coffee shop sequence for the demo.

## Acceptance checks

- Arithmetic: all four operations, rounding, zero boundary, maximum reachable reward, and choosing a gate once at full speed.
- Fairness: every introductory level offers a survivable route; labels are visible early enough, neither color is tied to a fixed lane, and number comparisons can change the best choice.
- Economy: only successful settled runs pay; repeated results cannot duplicate cash; purchases cannot overdraw; saved shops survive reload; shop bonuses stay secondary.
- Lifecycle: pause/resume, tab/game switching, sidebar close/reopen and fullscreen preserve both games' states and the Twitch player.
- Performance: video plus the game remains responsive; mesh count remains bounded as coin count rises.
- Coin motion: additions visibly make space, lost coins leave by a throw/fall, surviving coins reflow without overlap, and no unexplained pop-in occurs at a gate.
- Transfer and spending: coins arrive on the palm sequentially, then leave the hand sequentially when purchasing. High amounts obey the same bounded animation time as small amounts; numeric counters always settle to exact values.
- Pacing and interruption: finish-to-invest takes no more than 1.3s, purchase-to-open no more than 1.2s; skip, repeated clicks, panel close and reload neither duplicate nor lose settled money. Reduced-motion mode preserves all information.
- End-to-end: complete two introductory runs, open coffee, earn its order bonus, buy an upgrade, reload and find the same wallet/building levels.

First release excludes additional shop types, staff hiring, real estate, loans, prestige/reset mechanics, offline accumulation, multiplayer and streamer/chat control. The objective is one complete runner-to-business loop that actually works and is clear in a short demo.
