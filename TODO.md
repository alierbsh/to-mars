# Occupy Mars — to do

Owner's list (Muhammet) and the work queue. Tick things off in commits.

## Needs Muhammet (Vercel / accounts)
- [ ] **Vercel domain → Occupy Mars.** The free domain follows the Vercel *project name*: Vercel dashboard → the project → Settings → General → "Project Name" → `occupy-mars` → the site becomes `occupy-mars.vercel.app` (if that name is free; otherwise `occupymars`, `occupy-mars-sim`…). The old `*.vercel.app` URL stops working, the GitHub link stays. Custom domain (e.g. occupymars.space): Settings → Domains → Add, then the DNS records Vercel shows at the registrar.
- [ ] Optional: rename the GitHub repo to `occupy-mars` (Vercel follows the rename automatically; locally `git remote set-url origin git@github.com:alierbsh/occupy-mars.git`).

## Site
- [x] **Intro screen.** Why a city on Mars → "Start the physics, motors and engines" → choose the ship + time speed (10× recommended) → 5…1 countdown → ignition.
- [x] "Built by arbash" byline under the wordmark.
- [x] Starship landing: smoother flip and touchdown, engines cut at touchdown, landing dust.
- [x] Orion (and the other capsules) crashing on Mars: a proper impact — debris, dust, scorch, flash, camera shake.
- [x] Launch: ignition steam/exhaust clouds, close opening camera, QD arm / strongback moving at liftoff.
- [x] A real sea (water surface, waves, glint), scrub, cumulus, sun; Saturn V flame through the launch mount; the Earth in orbit (NASA map, clouds, limb glow, stars, Moon).
- [x] Mach diamonds in the plume; drag-to-orbit camera; EDL auto 2×; Mars detail (legs, shadows, rocks, dust devils, Spirit's lander); Cape detail (VAB flag + meatball, hangar, signs, birds, surf).
- [x] Water deluge at T−5, propellant venting through the countdown, frost on the tanks shedding at liftoff, bells glowing while firing, the catch arms open wide for launch.
- [ ] A parked crawler-transporter (the NASA model is 1.6 MB even Draco-compressed, 280 k triangles — too heavy for a speck 5 km away; needs decimation first).
- [x] Starship Mars ship: landing legs.

## Muhammet's list, 13 Oct — take time over each one
- [x] **The Earth through the whole launch.** A real globe (NASA Blue Marble + ocean roughness) under a 2000 km Florida/Gulf/Bahamas tile drawn from Natural Earth; a physically based atmosphere (Rayleigh + Mie single scattering in GLSL, `scene/atmosphere.ts`) — blue sky at the pad, the pale horizon band, the thin blue limb and black sky at 100 km, aerial perspective on distant ground; a cloud deck with shadows; stars fading in above 35 km; a horizon-aware chase camera that frames the limb as the rocket pitches over.
- [x] **Starship's flame, like the real thing.** `scene/Plume.tsx`: a shaped hull with a volumetric flame shader (fbm noise, axial streaks, shock-diamond knots, white core → yellow → orange, soot per propellant), three blended layers, a sea-level column that lengthens into a translucent vacuum bell, the fireball on the deck at liftoff lighting the steam orange. Methalox / kerolox / hydrolox / solid / hypergolic looks; plasma look reused for the entry wake.
- [x] **The Cape as if from satellite imagery.** `scripts/cape-assets.py` paints the ground offline (4096² lagoon tile at 6 m/px, 2048² complex and pad tiles) from hand-traced geography in the AE projection: Merritt Island land cover (scrub, pine flatwoods, marsh, the impoundments, citrus rows, dunes, beach, surf), the lagoons in their turbid teal with shallows, the SLF, the crawlerway, the parkways and causeways, the industrial area, Port Canaveral, the Cocoa Beach grid, pad aprons, with painted water holes and a water colour map. The geography is traced by hand (±100–300 m), not from imagery — the towns and the industrial area could still be richer.
- [x] **The lower third opens like a SpaceX webcast.** `ui/LowerThird.tsx`: speed / altitude dials that sweep round, the timeline drawing itself with its event marks, engine dot grids per stage lighting at ignition, propellant bars, the T+ clock — all animated in at ignition (keyed on `openSeq`); `?still=1` forces the end state for screenshots.
- [x] **Sound.** `audio/sound.ts` synthesises it with Web Audio (no samples: filtered brown-noise roar, sub rumble, crackle bursts, the hiss of entry, thuds); `AudioDriver` drives it from the sim (thrust fraction, air density, camera distance, heat flux); mute in the top bar, remembered; sound only after the Start click. NASA launch audio is not fetchable from the build container — a real recording could replace the roar later.
- [x] **Starship's Mars landing as a film scene.** Entry paced by altitude (8× high up, 3× through the heating, 5× on the glide, 1× for the flip and landing); the heat shield straining — tiles glowing on the windward side, a plasma sheath and ionised wake, sparks, camera shake, the hiss; scripted camera shots (glide, flip from the sunlit side, descent, landed) with frame-rate-independent smoothing; an environment map so the ship is lit from the butterscotch sky.
- [x] **After touchdown (Starship only): the first steps.** A 300 s `First steps` phase after a crewed landing: the hatch, the elevator, suited figures walking out, the flag, a habitat inflating, solar blankets unrolling, cargo crates — `scene/FirstSteps.tsx`, with its own camera shots.
- [x] **A wiki.** 14 chapters in plain language (`wiki/chapters.ts`), a reading overlay (`ui/Wiki.tsx`) opened from the Wiki pill, from the timeline's event marks, or `?wiki=<chapter>`.

## Muhammet's list, 14 Oct — in this order
- [x] **Sharing.** A link preview image (og:image, rendered from the site itself), a Share button on the verdict card that puts the mission's settings in the link (share sheet on phones, clipboard elsewhere), and a shared link that opens on the ship choice with that mission ready to launch.
- [x] **Scoreboard.** Every rocket × departure window × assumption set at a glance — 90 missions precomputed by `scripts/scoreboard.ts` — with what decided each one and when the crew was lost; a cell starts that mission. In the top bar, the verdict card (All rockets →) and the intro.
- [x] **Compressed textures (KTX2 / Basis Universal).** The ground and Earth maps stay compressed on the GPU (ETC1S → ETC2/BC1/BC7/ASTC in the browser): the pad scene's texture memory 300 → ~90 MB on high, 99 → ~38 MB on low, at about the same download; the JPEGs remain as the fallback.
- [x] **Languages — last, after everything else.** The whole site in Türkçe, Español, Français, Deutsch, हिन्दी and 中文 besides English — the interface, the intro, the verdicts and every event the simulation logs, the vehicles' texts, the scoreboard and the 14 wiki chapters — with a language picker (top bar, opening screen, Mission settings) and the browser's language on a first visit. The simulation speaks in message keys, so its English stayed byte-identical; numbers and dates follow each language.

## Muhammet's list, 14 Oct (second run)
- [x] **An address per language.** `/en/ /tr/ /es/ /fr/ /de/ /hi/ /zh/`, each with its own title, description, link-preview image and hreflang links; the bare `/` moves to the viewer's language.
- [x] **Give us feedback.** A link under the wordmark and on the opening screen; a panel with the address, an email (subject filled in, the mission's link and the device under the signature), copy.
- [x] **Phone performance.** Frames on demand (the clock and the scenes at the frame cap, 15 fps paused, 4 under a full-screen panel), static meshes merged (a third of the draw calls), coarser flames and no flame lights on low, no light switching (the liftoff stall), a pixel budget and a pixel step-down for weak devices, audio asleep when muted or hidden, Mars prepared after the climb. Fixed: on the low tier the sea covered the Cape a few km up.
- [x] **The Wiki button is "Anla!"** — Understand! · ¡Entiende! · Comprendre ! · Verstehen! · समझें! · 看懂！
- [x] **Graphics on the opening screen.** Auto / High / Medium / Low on the ship-choice step, next to the time speed.
- [x] Compile the next scene's shaders before the cut — done on 15 Oct (below).

## Muhammet's list, 14 Oct (third run) — realism
- [x] **The Earth during the dockings.** NASA's real cloud cover (edges broken up close), the city lights at night (sodium orange, broken into districts close up), the dusk band, airglow, lightning in night storms, point stars; the dockings and the departure burn flown over the Bahamas in daylight on the 0.5 km/px regional tile with its cumulus and their shadows; eclipse and orbital sunset; the tanker's thruster puffs.
- [x] **The departure burn up close.** The clock holds 1× for 17 s; the camera starts behind the glowing engines and swings out along the hull (up over them on a phone); faint vacuum plumes, no flame lights in orbit (they burned the hull white).
- [x] **Staging.** Starship hot-staging with flame from the vented ring, the booster's flip and boostback burn, a pitch that turns at a rocket's rate; condensation collars through Mach 1.
- [x] **The cruise as film.** Leaving Earth (the planet swinging round behind the ship and shrinking, the Moon beside it) and closing on Mars (growing ahead, veiled by the storm, its limb); the entry opens on the same black sky and glowing limb.
- [x] Seams: the Cape tiles fade over ~4 km; the regional tile's beaches no longer outline every island.
- [ ] Proposed next: the real star catalogue (constellations you can recognise, in orbit and the cruise); the sun where it really is for the launch date and hour; the booster caught by the tower's arms; a signal-delay readout through the cruise (light-minutes to Earth); a sound for hot staging and the boostback.

## Muhammet's list, 15 Oct (fourth run)
- [x] **No pause at the scene cuts.** The next shot is built a few seconds ahead in a scene that is never drawn, its shaders compiled a few a frame, its maps uploaded, then drawn once into a single pixel; at the cut the real view finds everything ready (`scene/Prewarm.tsx`, `scene/precompile.ts`). Long tasks after each cut, headless SwiftShader: orbit 12.6 s → 0.4 s, leaving Earth 17.8 → 0.3, the map 2.5 → 0, closing on Mars 4.2 → 0, the entry 7.7 → 0.4 (`scripts/stalls.mjs`; `?prewarm=0` compares). Mars's heightmaps were also decoded right at the orbit cut, through a GPU canvas: now a few seconds later, from memory.
- [x] **Give us feedback only in the wiki and in Mission settings** (at the foot of each).
- [x] **The info card no longer gives the ending away.** While the mission plays: the stage and the latest event, as it happens; the verdict (outcome, milestones, numbers, Share) once the ship is down — or lost.
- [x] **The wordmark in every language.** Mars'ı İşgal Et Simülasyonu, Simulación Ocupa Marte, Simulation Occupons Mars, Besetzt den Mars, मंगल पर बसो सिमुलेशन, 占领火星模拟 — the tab titles, link previews and share sheet too.
- [x] Performance besides: no light-count change half a minute after staging (it rebuilt every shader mid-climb), the hidden flames and dust built before they are needed, flames only on the stages that can fire in orbit and at Mars, Mars's site built once per session, fog and maps set before a view's first frame.
- [ ] Possible next: a shot-change still pays React's mount of the new view (tens of ms on a phone); the views could be mounted once, ahead, and promoted at the cut instead of built twice.

## Muhammet's list, 16 Oct (fifth run)
- [x] **Never leave the rocket.** The cruise is one continuous shot from the ship: Earth swinging round behind and shrinking to a point of light, the ship and camera turning together toward the course, months side-on in sunlight with Mars a red point ahead, then the roll to the entry attitude as Mars swells beneath — the planets where the transfer really has them, the stars turning with the sun. The bird's-eye map moved into the event card, small (with the transit day and the light time to Earth). The entry now opens from the cruise's last framing; the lower third's distances follow the hyperbolas near the planets (they stood still for two days at each end).
- [x] **Elon Musk's case for Mars** in the wiki, short, in all seven languages: his words with source and year, the dates as they moved up to October 2026, and what critics answer.
- [x] **"Not a video" on the opening screen.** A live badge, three facts (real physics, real rockets, rendered live) and the mission behind the button computed in the browser, with how long it took.
- [x] Besides: capsules cruise with their service module only (the spent upper stage dropped), framed by their width and seen three-quarters from behind on arrival; Mars's and Earth's names under their points of light; Earth's globe leaves the GPU once it is a point for good; the climb's and the entry's first frame after another view no longer come out rolled; the sources behind the Musk chapter in `docs/research/notes/musk_case.md`.
- [ ] Possible next: the orbit → cruise cut is still a cut (the TMI shot and the departure framing match in direction, not in distance); the real star catalogue would make the stars' turn through the cruise readable.

## Muhammet's list, 16 Oct (sixth run)
- [x] **Nothing to read on the opening.** Only "Start the physics, motors and engines" and the languages, over a clear view of the stack on its pad (the why, the facts and the computed line live in the wiki).
- [x] **No time speed on the pick step** (a mission starts at 10×; the lower third changes it in flight) **and no note under the graphics choice.**
- [x] **The whole rocket at first glance.** The launch (and the opening screens behind it) opens on the full stack, nose to foot, sized to the screen between the top bar and the lower third; Falcon Heavy from the north-north-east, its three cores side by side and the strongback behind them.
- [x] **The day counter as large as E+.** From the entry interface the mission day stands beside the E+ clock at its size (on a phone under it, where it used to be hidden).
- [x] **A commit for every change**, however small (CLAUDE.md).

## Parked (owner's call, 14 Oct)
- The return trip (Mars ascent, Earth return, the surface stay): the first crews are not expected to come back — not now.
- Deploy protection (CI before Vercel): not while traffic is small; revisit if the site takes off.
- Real landing-site terrain for Arcadia Planitia (Starship's lead candidate; the sim lands at Gusev because that DEM was at hand): not now.

## Model
- [x] Dust storms (drawn from the storm record by arrival season), storm-lifted entry density, surface wind and the blind-landing hazard.
