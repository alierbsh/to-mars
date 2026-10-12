# Occupy Mars — working notes for Claude

- Vite 8 + React 19 + TS; three.js via @react-three/fiber + drei; zustand; vitest. `npm run build` runs `tsc -b` first — keep it type-clean.
- Physics lives in `src/sim/` and is pure TypeScript (no DOM) so it runs in the worker (`src/sim/worker.ts`) and in Node scripts/tests. Every number in `src/data/vehicles.ts` and `src/sim/*` should trace to `docs/research/` with a confidence tag (Y/O/D/T). Unpublished numbers become config sliders, not constants.
- Validation: `npm test` (anchor tests against NASA windows, USSA76, orbit propagation + mission-level expectations). `npx tsx scripts/mission-check.ts [vehicle] [preset] [window]` prints a full timeline; `scripts/ascent-check.ts`, `scripts/entry-calibration.ts` for the parts.
- Visual checks: build, then `node scripts/shot.mjs out.png W H waitMs "?vehicle=<id>&t=<missionSeconds>"` (headless Chromium with software WebGL, pre-installed at /opt/pw-browsers). `?model=<id>&view=side|nose|engines|mid&az=<deg>` shows a vehicle alone.
- 3D models are procedural in `src/scene/vehicles/*.tsx`; stage groups are named by the sim's stage ids and carry `plume:<stageId>` anchors; `VehicleRig` animates them. `SPACECRAFT_GROUP/BASE/LENGTH` in `src/scene/vehicles/index.tsx` must match the model geometry.
- Mission time (s) is the playback axis; phases carry their own playback rates (`PHASE_RATE` in the store).
- Site language is English; the research report is Turkish, the notes English. Don't link the repo from the site (owner's request).
- Commits: small and frequent, pushed to `main` (Vercel deploys from it).
