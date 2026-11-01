# Optional Sidequest submission film

This is a separate Remotion project. It is not required to run the website. Install the root app dependencies first: its game engine is imported by the film.

```sh
cd video
npm ci
npm run typecheck
npm run dev -- --no-open
```

Open the Studio URL printed by Remotion and select **Sidequest**. The current main composition is 1336 frames at 30 fps: **44.533 seconds**, 1920 × 1080. `npm run build` bundles the project; rendering an MP4 is a separate command:

```sh
npx remotion render src/index.ts Sidequest out/sidequest.mp4
```

The repository preview works silently without the separately licensed stock soundtrack. The existing local edit is preserved: if `public/score-v11-cat-walk.wav` is available, the film uses it. Stock source recordings and edited standalone tracks are intentionally excluded from Git. Obtain permitted music directly from its provider, or supply an original soundtrack locally, before producing the final export. See `source-audio/CREDITS.md`, the archived licence and edit maps for the existing music provenance.

Tracked assets include the active main film's page frames, actual project clip, original generated illustrations and attribution icon. Unused raw capture sequences and private Codex chat captures remain local. Historical unregistered scene components may reference those local-only captures; the registered main composition and designed scenes do not require private chats.

The Codex workflow cards are explicitly labelled illustrations; they are not actual conversation footage. The library and advertising sequences describe concepts. For submission, include genuine footage of building with Codex and confirm permissions for visible broadcast material. See the root `SUBMISSION_REVIEW.md` for the remaining steps. No YouTube upload or submission is performed by running these commands.
