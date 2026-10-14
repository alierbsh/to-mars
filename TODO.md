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
- [ ] **Sharing.** A link preview image (og:image), a Share button that puts the mission's settings in the link, and a shared link that opens on the ship choice with that mission ready to launch.
- [ ] **Scoreboard.** Every rocket × departure window × assumption set at a glance — 90 missions precomputed — with the number that decided each one; a cell starts that mission.
- [ ] **Compressed textures (KTX2 / Basis Universal).** The ground and Earth maps stay compressed on the GPU: 4–8× less video memory and bandwidth, the biggest lever left for phones.
- [ ] **Languages — last, after everything else.** The whole site in Turkish, Chinese, Hindi, Spanish, French and German besides English: the UI, the intro, the verdicts, the event texts, the scoreboard and the wiki, with a language picker.

## Parked (owner's call, 14 Oct)
- The return trip (Mars ascent, Earth return, the surface stay): the first crews are not expected to come back — not now.
- Deploy protection (CI before Vercel): not while traffic is small; revisit if the site takes off.
- Real landing-site terrain for Arcadia Planitia (Starship's lead candidate; the sim lands at Gusev because that DEM was at hand): not now.

## Model
- [x] Dust storms (drawn from the storm record by arrival season), storm-lifted entry density, surface wind and the blind-landing hazard.
