# Occupy Mars

**Can today's most advanced rockets carry a crew to Mars?**

Pick a real launch vehicle, give it a crew and a departure window, and let a physics simulation run the whole chain — launch, orbital refuelling, trans-Mars injection, the cruise, and entry, descent and landing at Mars — then tell you whether the crew arrives alive, and if not, what broke first.

Live: deployed on Vercel from `main`. Layout inspired by [Robots in Space](https://robots-in-space.vercel.app/); different question. The screen is the stage: a full-screen 3D mission with a webcast-style lower third (dials, the T+ clock, the timeline with its event marks, engine status), one verdict card, two drawers — *Mission settings* (graphics first, then the rocket, window, crew and assumptions; everything else under *Advanced*) and *Data* (timeline, telemetry, trajectory, vehicle) — a *Scoreboard* — every rocket against every departure window under each set of assumptions, 90 missions at a glance — and *Understand!*, a wiki that explains every stage in plain language. *Give us feedback* (under the wordmark and on the opening screen) writes to the owner. In seven languages: English, Türkçe, Español, Français, Deutsch, हिन्दी, 中文.

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

## The places

Every mission launches from Cape Canaveral (the site's premise; notional for Long March 10): LC-39A with the Starship tower and orbital launch mount, LC-39B with NASA's Mobile Launcher (the real model from [NASA-3D-Resources](https://github.com/nasa/NASA-3D-Resources), public domain), the FSS and transporter-erector for Falcon Heavy, the Apollo-era red LUT for Saturn V, LC-36 for New Glenn, a generic umbilical tower at SLC-37.

The ground is painted offline (`scripts/cape-assets.py`) in the azimuthal-equidistant projection the terrain patches use, so the textures land on the spherical caps without distortion, at four scales: the pad (2048², 0.5 m/px: aprons, flame trenches, roads, tank farms), the launch complex (2048²), the Cape (4096², 6 m/px: Merritt Island's scrub, pine flatwoods and marsh, the mosquito-control impoundments, citrus rows, dunes and surf, the lagoons in their turbid teal with shallows and sandbars, the SLF, the crawlerway, the parkways and causeways, the industrial area, Port Canaveral, the Cocoa Beach grid), and a 2000 km regional tile for the view from altitude (NASA Blue Marble sharpened with Natural Earth coastlines, lakes, rivers, the 200 m shelf and urban areas, with a cloud deck that casts shadows). The geography is traced by hand from maps, not from imagery, so positions are good to a few hundred metres. Under it all is the real globe, so from 100 km the coast curves away to the Gulf and the Bahamas.

The air is a physically based atmosphere (Rayleigh + Mie single scattering, `src/scene/atmosphere.ts`, injected into every ground material and the sky): blue sky and a pale horizon band at the pad, aerial perspective on distant ground, the thin blue limb and black sky above 100 km, the stars fading in on the way. The chase camera knows where the horizon is and frames the limb as the rocket pitches over.

In orbit the Earth is the NASA Blue Marble at 4k with a roughness map for the sun's glint on the oceans, NASA's real cloud cover (its edges broken up close by noise) and city lights that come on across the night side, a limb that reddens at the terminator and keeps the airglow's green line at night, point stars and the Moon at its true angular size. Each tanker docking and the departure burn are flown over the Bahamas in early afternoon, where the ascent's 0.5 km/px regional tile and its cumulus deck take over from the globe: the docking shot dollies in on the pair as the tanker closes, the burn shot starts behind the glowing engines and swings out along the hull. The ship passes through the planet's shadow on the night side, its light reddening as the sun sets behind the limb (`scripts/orbit-earth-assets.py` builds the cloud and night maps).

The landing is at Gusev crater, the Spirit landing site: the regional terrain is JPL's 3D-printable DEM of Gusev (MOLA/HRSC-derived), the near field uses the HiRISE-derived DEM of Victoria crater, and the planet below is the NASA/JPL global colour mosaic — all from NASA-3D-Resources, rasterised to 16-bit heightmaps in `public/assets/mars`. Secondary craters, dunes, dust-devil tracks, regolith and the rock field are procedural; the colour maps are rasterised in a worker. The weather at arrival (season, dust storm, surface wind) is drawn from the storm record, seeded by the date.

## What you see and hear

- **Flames.** Every plume is a shaped hull with a volumetric flame shader (`src/scene/Plume.tsx`): turbulent noise, axial streaks, shock diamonds, a white-hot core fading through yellow to orange, soot per propellant (methalox, kerolox, hydrolox, solids, hypergolics). The sea-level column lengthens into a translucent vacuum bell as the air thins; at liftoff the fireball on the deck lights the deluge steam orange.
- **The lower third** (`src/ui/LowerThird.tsx`) opens the way a SpaceX webcast does: dials sweeping round, the timeline drawing itself, the engine grids lighting at ignition, the clock. Playback pacing is per phase — the first seconds of a launch at real time, the entry slowed by altitude so the heating and the flip play at a film's pace.
- **Sound** is synthesised with Web Audio (`src/audio/`), no samples: a filtered-noise roar and sub rumble scaled by thrust and air density, crackle, the hiss of entry plasma, thuds at ignition and touchdown. It starts with the Start click and the top bar has a mute.
- **Staging.** Starship hot-stages — the ship lights while still attached and flame bursts out of the booster's vented ring — then the booster flips tail-first and lights for its boostback while the camera holds both. Through Mach 1 a condensation collar wraps the shoulders.
- **The cruise** opens on the ship leaving Earth — the planet below it at first, then swinging round behind and shrinking to a marble with the Moon beside it, at its true size for the distance on the escape hyperbola — and closes on Mars growing ahead until it fills the view at the entry interface (veiled when a dust storm is on). The months between are the map of the inner solar system.
- **Entry, descent and landing** at Mars as a film: tiles glowing on the windward side, a plasma sheath and ionised wake, sparks, shake, scripted camera shots for the glide, the flip and the touchdown. After a crewed Starship landing there is a closing sequence — the hatch, the elevator, the first steps, the flag, a habitat, solar blankets.
- **The wiki** (`src/wiki/chapters.ts`) — fourteen chapters from "why a city on Mars" to the physics behind the site, linked from the timeline's event marks and `?wiki=<chapter>`.

## What decides the Starship verdict

Four numbers nobody has measured yet: propellant delivered per tanker, daily boil-off, the launch cadence, and the heat flux the tiles can take at Mars. Three presets bracket them — *SpaceX claims*, *Independent estimates*, *Demonstrated so far* — and the window matters as much: the 2031 and 2033 opportunities arrive at 4.4–5.5 km/s v∞ (6.6–7.4 km/s entry), the 2026, 2028 and 2035 ones at 2.7–3.3 km/s.

## Research

The numbers come from a sourced research pass made in October 2026 — the state of every heavy launcher, crewed-Mars delta-v and mass budgets, atmosphere and EDL models, expert failure-mode analyses, visual geometry. Report (Turkish) and raw notes (English): [`docs/research/`](./docs/research/README.md).

## Languages

Every word on screen comes from a catalog in `src/i18n/<lang>/` — `ui.ts` (the interface), `sim.ts` (everything the simulation says), `data.ts` (the vehicles', assumption sets' and windows' texts) and `wiki.ts` — typed against the English ones in `src/i18n/en/`, so a missing or misshapen key fails the build. The simulation does not produce English sentences directly: each event, phase, verdict and stat is a message (a key and its parameters, which may be other messages or a vehicle's text) rendered once in English for the log and the scripts, and again in the reader's language by the interface. Numbers and dates are formatted per locale (`src/i18n/numbers.ts`; English keeps `toFixed`). Each language has its own address — `/en/`, `/tr/`, `/es/`, `/fr/`, `/de/`, `/hi/`, `/zh/` — with its own title, description and link-preview image (the build writes a page per language, with hreflang links between them); the bare `/` opens in the viewer's saved choice or the browser's language and moves to that address, and choosing a language moves it too. English is built in and every other language is its own chunk, preloaded by its page and loaded before the first paint. Noto Sans Devanagari loads with Hindi; Chinese uses the system's CJK face. `src/i18n/tests/i18n.test.ts` checks that every language has every key and renders every message of 19 missions covering every outcome.

## Performance

The scene runs on three graphics tiers — high, medium, low — chosen for the device (phones start on low) and stepped down automatically if the opening screens or the first seconds of the climb cannot hold 30 fps; *Graphics* on the ship-choice screen, or in *Mission settings*, pins a choice. The tiers trade pixel ratio, multisampling, shadows, the logarithmic depth buffer, the sky's ray-march samples, the flame's layers, sprite and mesh density, texture resolution (half-size maps on low) and the frame-rate cap (30 fps on low, lower on the opening screens). A frame happens only when it is worth one: the canvas runs on demand, advanced by one loop at the tier's cap while the mission plays, 15 fps when paused, 4 under the wiki or the scoreboard — the mission clock and every scene's per-frame work included, so a 120 Hz phone does not do them 120 times a second. The models' and pads' static meshes are merged into one draw call per material (Super Heavy: 104 → 13). On the low tier the flames are coarser meshes without point lights, a tablet renders about a megapixel, and a device that still cannot hold 25 fps renders fewer pixels. Lights never switch on or off mid-scene (that recompiles every lit material — the stall at liftoff), and the audio sleeps while muted or in a hidden tab. The ground and Earth maps ship as KTX2 (Basis Universal), transcoded in the browser to the GPU's own compressed format, so they stay at 4–8 bits per texel in video memory: the pad scene takes ~90 MB on high and ~40 MB on low instead of ~300 and ~100 (`?ktx2=0` loads the original JPEGs to compare). `?quality=high|medium|low` forces a tier; `?debug=1` logs draw calls, triangles and texture bytes to the console.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # anchor + mission tests (vitest)
npm run build      # typecheck + production build into dist/
```

`?lang=en|tr|es|fr|de|hi|zh` opens the site in a language. Useful scripts: `npx tsx scripts/mission-check.ts [vehicleId] [presetId] [windowId]` prints a full mission timeline; `scripts/ascent-check.ts` the ascent only; `scripts/entry-calibration.ts` the Earth/Mars entry anchors; `node scripts/shot.mjs out.png 1440 900 6000 "?vehicle=sls-orion&t=125&still=1" ["js:.top__right .pill:last-child|…"]` screenshots the built app at a mission time (optionally after clicks; `still=1` freezes the lower third's opening animation); `?preset=<id>&window=<id>` preselect assumptions; `?wiki=<chapter>` opens the wiki; `?mission=<…>` is a shared mission (the Share button on the verdict card makes these); `?board=1` opens the scoreboard (`npx tsx scripts/scoreboard.ts` recomputes it — a test fails when it is stale); `?clean=1` hides the overlays; `?model=<id>&view=side|nose|engines|mid&az=<deg>` opens a model viewer; `?terrain=mars|cape&pad=<padId>&alt=<m>&az=<deg>&pitch=<deg>` a terrain viewer. `python3 -I scripts/cape-assets.py region|cape|complex|pad` repaints the Cape textures (`region` needs the Natural Earth 10m GeoJSON and the Blue Marble JPEG; the rest is self-contained), then `python3 -I scripts/texture-variants.py` makes the half-size variants for the low graphics tier and `python3 -I scripts/ktx2.py --basisu <path to basisu>` their KTX2 versions. `npx tsx scripts/og-image.ts` re-renders the link preview images (one per language) from the built site.

## Layout

```
src/
  sim/      physics core (atmosphere, ephemeris, orbit/Lambert, ascent, leo, transfer, cruise, weather, entry, mission, worker)
  data/     vehicle catalogue with sources and confidence tags
  scene/    three.js stage: procedural vehicle models, phase scenes, the flame shader (Plume.tsx), the rig;
            Cape Canaveral (capeSite.ts, pads.tsx, CapeCanaveral.tsx), the globe and the sky under the climb
            (EarthBelow.tsx, atmosphere.ts), the Earth in orbit, the Mars site (marsSite.ts + worker), the first steps
  ui/       intro (why Mars → choose the ship → countdown), top bar, verdict card, the lower third (dials, clock, timeline, engines), drawers, the wiki
  audio/    Web Audio synthesis and the driver that follows the sim
  i18n/     languages: message keys, number formats, the language store; en/ (the source catalogs) and tr es fr de hi zh
  wiki/     the chapters' order and the timeline marks that open them (texts in i18n/<lang>/wiki.ts)
  state/    zustand store + playback pacing
scripts/    checks, screenshots, and the offline asset builders (cape-assets.py, orbit-earth-assets.py, stl2height.py)
docs/research/  the research behind the numbers
```

Stack: Vite 8, React 19, TypeScript, three.js via @react-three/fiber + drei, zustand, vitest.

## Not modelled (yet)

Launch abort outcomes, ECLSS hardware failures, tip-over on landing, the return trip.
