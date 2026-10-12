# To Mars

**Can today's most advanced rockets carry a crew to Mars?**

Pick a real launch vehicle, give it a crew and a departure window, and let a physics simulation run the whole chain — launch, orbital refuelling, trans-Mars injection, the cruise, and entry, descent and landing at Mars — then tell you whether the crew arrives alive, and if not, what broke first.

Live: deployed on Vercel from `main`. Layout inspired by [Robots in Space](https://robots-in-space.vercel.app/); different question.

## What it simulates

| Phase | Model |
|---|---|
| Launch | Planar ascent in the rotating-atmosphere frame, RK4 at 0.1 s. US Standard Atmosphere 1976. Pressure-dependent Isp per engine, Cd(Mach) drag on the stack base area, parallel boosters and sequential staging, a max-Q throttle bucket, gravity turn then a closed-loop insertion law; the pitch-kick angle is searched for the most propellant left in orbit. Crewed vehicles capped at 4 g. |
| Earth orbit | For Starship: a tanker campaign that fills the ship to what the trip needs (TMI burn + landing reserve + 5 %), with compounding boil-off, a launch cadence, and a window check. For everything else: the upper stage's residual propellant. |
| Transfer | Lambert's problem on JPL's approximate planetary elements (1800–2050). Departure Δv from the parking orbit via the Oberth effect plus a 2 % finite-burn allowance and 50 m/s of mid-course corrections. Checked against the NASA Glenn 2026 / 2028 / 2031 / 2033 minimum-C3 opportunities to within 1 %. |
| Cruise | Consumables at NASA's daily crew balance (0.89 kg O₂, 2.39 kg food, 3.5 kg water) reduced by ECLSS recovery; capsules carry their nominal free-flight life support (Orion 21 days, Apollo 14, Dragon ~7). Radiation at the MSL RAD cruise rate (1.8 mSv/day) against the 600 mSv career limit. |
| Entry & landing | Mars Climate Database density profile with a dust/density scale, lift with a simple bank rule (lift up until pull-out, then neutral), Sutton–Graves stagnation heating calibrated so the Earth LEO re-entries Starship has flown come out at 43–49 W/cm² against a 50 W/cm² tile limit, g-load vs a deconditioned-crew limit, and a supersonic-retropropulsion suicide burn with drag credit. Capsules without landing engines hit at terminal velocity. |

The verdict names the outcome (landed, crashed, burned up, stuck in Earth orbit, lost in transit, flyby), whether the crew is alive, and the first failing event with its numbers.

## The vehicles

Starship V3 (Super Heavy + Ship), SLS Block 1 + Orion, Falcon Heavy + Crew Dragon, New Glenn, Long March 10 + Mengzhou, and Saturn V + Apollo as the historical benchmark. Every number in `src/data/vehicles.ts` carries a confidence tag; unpublished masses (Starship dry masses above all) are sliders, not constants.

The 3D models are procedural (cylinders, ogives, fins, decals) built to the dimensions in the research notes: ring counts, engine arrangements, fin positions, liveries.

## What decides the Starship verdict

Four numbers nobody has measured yet: propellant delivered per tanker, daily boil-off, the launch cadence, and the heat flux the tiles can take at Mars. Three presets bracket them — *SpaceX claims*, *Independent estimates*, *Demonstrated so far* — and the window matters as much: the 2031 and 2033 opportunities arrive at 4.4–5.5 km/s v∞ (6.6–7.4 km/s entry), the 2026, 2028 and 2035 ones at 2.7–3.3 km/s.

## Research

The numbers come from a sourced research pass made in October 2026 — the state of every heavy launcher, crewed-Mars delta-v and mass budgets, atmosphere and EDL models, expert failure-mode analyses, visual geometry. Report (Turkish) and raw notes (English): [`docs/research/`](./docs/research/README.md).

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # anchor + mission tests (vitest)
npm run build      # typecheck + production build into dist/
```

Useful scripts: `npx tsx scripts/mission-check.ts [vehicleId] [presetId] [windowId]` prints a full mission timeline; `scripts/ascent-check.ts` the ascent only; `scripts/entry-calibration.ts` the Earth/Mars entry anchors; `node scripts/shot.mjs out.png 1440 900 6000 "?vehicle=sls-orion&t=125"` screenshots the built app at a mission time; `?model=<id>&view=side|nose|engines|mid&az=<deg>` opens a model viewer.

## Layout

```
src/
  sim/      physics core (atmosphere, ephemeris, orbit/Lambert, ascent, leo, transfer, cruise, entry, mission, worker)
  data/     vehicle catalogue with sources and confidence tags
  scene/    three.js stage: procedural vehicle models, phase scenes, plumes, rig
  ui/       sidebar, verdict panel, timeline/telemetry/trajectory/model tabs, HUD
  state/    zustand store + playback
docs/research/  the research behind the numbers
```

Stack: Vite 8, React 19, TypeScript, three.js via @react-three/fiber + drei, zustand, vitest.

## Not modelled (yet)

Launch abort outcomes, Mars rotation and winds, dust storms as random events, ECLSS hardware failures, landing-site hazards and tip-over, the return trip.
