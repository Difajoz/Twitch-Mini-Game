# Submission assessment — October 31, 2026

My assessment: the core prototype is implemented; submission readiness and competitive differentiation remain unfinished. Passing tests is useful evidence, but does not establish a compelling idea, production reliability, or eligibility.

## Priorities before submission

1. **Describe the actual scope honestly.** Skyline Sprint is playable. Five other cards open static presentation scenes. Presenting those as five functioning games would conflict with the requirement that the project work as depicted. Recommend an unobtrusive concept designation in a judging build, or focusing the video entirely on the runner and explicitly identifying concepts in the description. This is feedback, not an unauthorized UI change.
2. **Prove the Twitch connection on the judging setup.** Local playback was previously verified, but the latest layout QA did not establish new sustained playback. Production hostname playback is unverified; live metadata credentials are absent. Show a real live stream with the actual runner, and check channel change, blocked playback, offline state and retry. An embed is a real connection, but the theme fit could be stronger when game behavior is independent of Twitch. Acceptance is the organizers' decision.
3. **Make the project reproducible.** The source has no remote or commits yet at the start of this review. Push it, test a fresh clone, provide exact setup instructions, and ensure judges can access it. A hosted demo is convenient but does not replace the repository.
4. **Protect the demo's credibility and asset permissions.** Use our own broadcast or permissioned footage. The copied Twitch presentation and third-party marks/remote assets warrant careful review for a public video. The asset record documents sources; it does not grant permission. Prefer stronger Sidequest identity rather than presenting the entire product as Twitch's own UI.
5. **Do one sustained usability session.** Check laptop frame rate while playing video, repeated restarts, focus pauses, sidebar reopen and fullscreen. The current right rail remains narrow on phones and controls require a keyboard; position this as a desktop prototype. Twitch's own fullscreen isolates the player; the app's Stream + games fullscreen includes the rail. Explain that distinction clearly.
6. **Reconcile documentation.** README and the newest build status describe the current sidebar; older planning/status passages describe removed standalone and left/right layouts. Consolidate these before final publication so judges know which behavior to expect.

## Fit to the four equally weighted judging criteria

| Criterion | Current evidence | Main weakness / recommended next step |
| --- | --- | --- |
| Innovation / Idea | A low-friction solo activity beside a real broadcast. | A runner alongside a stream may feel familiar. Explain the specific viewer need and why the watch/play interaction matters. |
| Potential Impact | No streamer installation or account authorization; short sessions. | No user evidence yet. Observe a few viewers and ask whether playing helps them stay engaged or distracts them from the stream; report findings without invented retention claims. |
| Technological Implementation | Real 3D simulation, fixed-step updates, scoped input, retained sessions, 21 passing tests and successful production build. | Live API path and hosted reliability remain unproven. Show concrete Codex decisions and validation. |
| Design | Purple controls, persistent stream, half-height active game and scrollable selection below. | Static cards look functional; cloned branding dilutes identity; tiny game HUD and narrow-screen usability need review. |

These are qualitative judgments, not predictions of judges' scores.

## What I would add

First choose reliability and clarity over more games. After that, the strongest bounded addition would be a **stream break mode**: an explicit viewer-controlled short session intended for a streamer's break, with an easy return to watching. It fits the current solo scope without chat commands or streamer installation. Validate demand before implementing; do not claim an automatic break/ad detector exists.

A real metadata-backed stream selector is another useful improvement because its server-side implementation already exists. Configure and verify it before expanding features. Touch controls, shops, multiplayer, progression systems and additional game simulations are lower priority for this deadline.

## Submission materials still needed

- Accessible runnable repository and verified installation instructions.
- Accurate feature description and explanation of how Codex was used.
- Correct implementation session ID.
- English demo under three minutes, real Twitch footage, actual Codex-building footage, and permissioned material.
- Final review of deadline, access and continued availability through judging.

Sources checked October 31, 2026: [Official rules](https://twitchcon-codex.devpost.com/rules), [FAQ](https://twitchcon-codex.devpost.com/resources). The four criteria and functionality requirements come from those sources; product assessments and priorities above are my recommendations.
