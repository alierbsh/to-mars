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
- [ ] **The Earth through the whole launch.** Still wrong at altitude (flat green ground with blocky lagoons at 24 km, a plain blue ball at 169 km, the ship unlit, the plume a flat triangle). Rebuild: a real globe under the Cape tiles (NASA day map + a 2000 km Florida/Gulf/Bahamas tile drawn from Natural Earth coastlines, lakes and the 200 m shelf), a physically based atmosphere (Rayleigh + Mie single scattering: blue sky at the pad, the pale horizon band, the thin blue limb and black sky at 100 km, aerial perspective over distant ground), clouds with shadows, sun lighting that stays on the vehicle, a camera that frames the limb as the rocket pitches over.
- [ ] **Starship's flame, like the real thing.** The Raptor plume as fire, not a cone: a volumetric flame shader (turbulent noise, white-hot core → yellow → orange, flicker at 20–30 Hz, shock diamonds), 33 plumes merging into one at liftoff with the orange glow on the steam and the OLM, the plume lengthening and going translucent blue-violet as the air thins, the ship's six vacuum Raptors as wide faint bells. Same system for the other engines (kerolox orange and sooty, hydrolox near-invisible, solids bright and smoky).
- [ ] **The Cape as if from satellite imagery.** Near-photoreal ground at every scale: real land cover for Merritt Island (scrub, pine flatwoods, marsh, the mosquito-control impoundments with their dikes, citrus rows, dunes and the beach), the lagoons in their true turbid teal with shallows and sandbars, surf, the SLF runway, the crawlerway, Kennedy Parkway and the NASA causeway, the industrial area, Port Canaveral and the Cocoa Beach grid, pad aprons with flame trenches; rendered offline at 4096² (6 m/px) and 2048² for the pad (0.5 m/px) from the geography in `capeSite.ts`, with a 2000 km regional tile from Natural Earth data for the view from altitude.
- [ ] **The lower third opens like a SpaceX webcast.** Speed and altitude in arc gauges that sweep round as the overlay opens, the mission timeline drawing itself with its event marks, the engine-status dot diagram (33 + 6 for Starship, 27 for Falcon Heavy…) lighting up at ignition, the T+ clock — all animated in when the countdown hits zero, in the same black-glass register.
- [ ] **Sound.** Ignition and the roar of the real thing: the countdown, engine start, the crackle of a sea-level plume, the silence of space, the Raptors relighting for the landing burn. Public-domain NASA launch audio where it can be fetched; otherwise a synthesised roar (Web Audio: filtered noise, low rumble, crackle) tuned to each vehicle's thrust; a mute control in the top bar; sound only after the user's Start click (browser autoplay rules).
- [ ] **Starship's Mars landing as a film scene.** Entry slower and heavier: the ship visibly decelerating as the air bites, the heat shield straining — plasma building from a glow to a roaring sheath with trailing ionised wake, tiles glowing on the windward side, camera shake and the hiss of it; the flip as the money shot — a smooth, close, cinematic camera move with the engines lighting mid-flip, dust and the legs coming out, played at a smooth frame rate and 1× for its duration.
- [ ] **After touchdown (Starship only): the first steps.** The crew disembarks — the hatch, the elevator/crane line down the side, suited figures on the regolith, the first cargo out, the start of base-building (a habitat module, solar panels unrolled, the flag) — a short closing sequence after the landing aftermath.
- [ ] **A wiki.** A reader-friendly explanation of every stage — what happens, how and why, in plain language — launch, max-Q, staging, orbit and refuelling, the transfer window, the cruise, entry, descent and landing, the verdicts. Research the right form (a `/wiki` route with chapters vs. a drawer; the robots-in-space precedent), then a "Wiki" button in a sensible place (the top bar next to Mission/Data, and chapter links from the timeline events). After the items above.

## Model
- [ ] Return trip (Mars ascent, Earth return) — the ascent integrator is planet-generic now; the Mars launch, the return transfer and Earth entry are not wired up yet.
- [x] Dust storms (drawn from the storm record by arrival season), storm-lifted entry density, surface wind and the blind-landing hazard.
