# Visual geometry & modelling sheets for 10 launch vehicles (Starship V1/V2/V3, SLS Block 1/1B, New Glenn, Falcon Heavy, Long March 10/10A, Neutron, Vulcan VC6, Saturn V)

Conventions used below: all lengths in metres unless quoted otherwise; "hex" colours are the researcher's own approximations for a three.js material (no official colour specs exist for any of these vehicles — treat every hex as an Inference, not a cited fact). Where a figure is from a secondary source (Wikipedia, launch databases) it is marked as such; primary sources (SpaceX, NASA, Blue Origin, Rocket Lab, ULA PDFs/pages) are preferred when they exist. Research date: 2026-10-12.

---

## Key Question 1 — Starship system (V1, V2, V3 + Super Heavy, tower)

### Takeaway
Confirmed heights: V1 121.3 m (71 m booster + 50.3 m ship), V2 123.1 m (71 m + 52.1 m), V3 124.4 m (72.3 m booster; ship height not separately published, ~52.1 m by subtraction). All versions 9 m diameter, built from 1.83 m-tall stainless rings (booster 33 main rings + 4 shorter aft rings; ship 21 rings). V3 booster has three ~1.5×-size grid fins at 90°/90°/180° placed lower, catch pins integrated into the fins, and a non-jettisoned hot-stage section integrated into the methane tank; V3 ship still has 3 sea-level + 3 vacuum Raptor 3 (6 RVac is Block 4). First V3 flight (Flight 12) flew 22 May 2026 from OLP-2 (B19/S39).

### Cited Findings

**Overall heights, per version**
- Block 1 (V1): total 121.3 m (398 ft) = 71 m booster + 50.3 m ship; 9 m diameter — [Wikipedia: SpaceX Starship](https://en.wikipedia.org/wiki/SpaceX_Starship)
- Block 2 (V2): total 123.1 m (infobox; 123.3 m in the performance table — internal inconsistency), "3.1 m taller than Block 1"; booster 71 m; ship 52.1 m — [Wikipedia: SpaceX Starship](https://en.wikipedia.org/wiki/SpaceX_Starship)
- Block 3 (V3): total 124.4 m; booster 72.3 m; ship height not stated — [Wikipedia: SpaceX Starship](https://en.wikipedia.org/wiki/SpaceX_Starship); 124.4 m and "uniform diameter of 9 meters" also given by [OrbitCodex Starship V3](https://orbitcodex.com/launch-vehicles/starship-v3) (secondary)
- Block 4 (for context, not yet built): ~142 m total, 81 m booster, 61 m ship, three extra RVacs (six total) — [Wikipedia: SpaceX Starship](https://en.wikipedia.org/wiki/SpaceX_Starship)
- A May 2026 Japanese tech article still describes Starship as "9 meters in diameter and 121 meters in length" — this is the old V1 figure, not V3 — [Gigazine, 13 May 2026](https://gigazine.net/gsc_news/en/20260513-spacexs-starship-v3/)

**Super Heavy booster — structure**
- Height 71 m (Blocks 1/2), or 69 m without the vented interstage; Block 3: 72.3 m; diameter 9 m; dry mass 275 t; propellant 3,400 t (2,700 t LOX + 700 t CH4); Block 3 propellant 3,650 t — [Wikipedia: SpaceX Super Heavy](https://en.wikipedia.org/wiki/SpaceX_Super_Heavy)
- Main rings: 9 m diameter × 1.83 m (6.00 ft) tall, thirty-three used; four aft rings are 1.4 m tall and used only in the aft section; the LOX header tank uses a 1 m and a 1.7 m ring of smaller diameter; forward dome has a "dome knuckle" and "dome frustum" sitting on a three-ring forward stack; tanks share a common bulkhead — [Wikipedia: SpaceX Super Heavy](https://en.wikipedia.org/wiki/SpaceX_Super_Heavy)
- Engines: 33 Raptors (Raptor 2 on Blocks 1/2, Raptor 3 on Block 3); outer 20 in a fixed ring, cannot reignite; inner 13 on the thrust puck with gimbals, reignite for boostback/landing; all but the three centre engines shut down before the final landing/catch — [Wikipedia: SpaceX Super Heavy](https://en.wikipedia.org/wiki/SpaceX_Super_Heavy). (The 3 + 10 + 20 breakdown requested is consistent with 13 inner gimballing engines of which 3 are the centre cluster, but no fetched source states "10 inner ring" explicitly.)
- Block 1 engines sit in a dedicated shielded "aft bay"; before engine installation the booster is ~3 m shorter — [Wikipedia: SpaceX Super Heavy](https://en.wikipedia.org/wiki/SpaceX_Super_Heavy); on V3 the engine shielding was "mostly removed, saving over a ton per engine" — [Wikipedia: SpaceX Starship](https://en.wikipedia.org/wiki/SpaceX_Starship)
- Chines: four, on the outside of the LOX tank (from Booster 7 onward); provide lift during descent and house batteries, COPVs and CO2 tanks; no length given — [Wikipedia: SpaceX Super Heavy](https://en.wikipedia.org/wiki/SpaceX_Super_Heavy)
- Grid fins, Blocks 1/2: four electrically actuated stainless-steel fins on the interstage, ~3 t each, remain extended during ascent — [Wikipedia: SpaceX Super Heavy](https://en.wikipedia.org/wiki/SpaceX_Super_Heavy)
- Grid fins, Block 3: three fins, roughly 1.5× the Block 1/2 size, positioned lower, arranged 90/90/180 degrees, integrated with the catch pins (fins serve as tower catch points) — [Wikipedia: SpaceX Starship](https://en.wikipedia.org/wiki/SpaceX_Starship); "reduced from four to three, each about 50% larger ... positioned lower to reduce engine heat effects; actuators and mounting structures moved into the booster's main fuel tank" — [Gigazine](https://gigazine.net/gsc_news/en/20260513-spacexs-starship-v3/)
- Hot-stage ring (Blocks 1/2): 1.8 m tall vented interstage added after the first flight; includes a dome shielding the booster top; four perpendicular vents plus vents below the common dome; from Booster 11 it is jettisoned after boostback — [Wikipedia: SpaceX Super Heavy](https://en.wikipedia.org/wiki/SpaceX_Super_Heavy)
- Hot-stage, Block 3: "integrated directly into the methane tank and forward dome, rather than being jettisoned" — [Wikipedia: SpaceX Starship](https://en.wikipedia.org/wiki/SpaceX_Starship); contradicted in wording by [Gigazine](https://gigazine.net/gsc_news/en/20260513-spacexs-starship-v3/), which says the hot stage "is now integrated into the spacecraft" (likely a translation slip; the booster-integration reading is consistent with the fin/catch-pin changes)
- Catch hardpoints (Blocks 1/2): protrude from the interstage between the grid fins and are caught by the tower's hydraulic arms — [Wikipedia: SpaceX Super Heavy](https://en.wikipedia.org/wiki/SpaceX_Super_Heavy)
- Booster thrust: V1 73.5 MN; V3 80.8 MN — [Wikipedia: SpaceX Starship](https://en.wikipedia.org/wiki/SpaceX_Starship); ~80,806 kN / ~18 million lbf, liftoff mass 5,250,000 kg — [OrbitCodex](https://orbitcodex.com/launch-vehicles/starship-v3)

**Starship ship — structure**
- Height: Block 1 50.3 m; Block 2 52.1 m; diameter 9 m; infobox "wingspan" 17 m (flap tip to tip); pressurised/payload volume 614 m³ — [Wikipedia: SpaceX Starship (spacecraft)](https://en.wikipedia.org/wiki/SpaceX_Starship_(spacecraft))
- 21 stainless rings × 9 m × 1.83 m, 3.97 mm thick, ~1,600 kg each; four sections bottom-up: engine bay, oxygen tank, fuel (methane) tank, payload bay — [Wikipedia: Starship (spacecraft)](https://en.wikipedia.org/wiki/SpaceX_Starship_(spacecraft))
- Nosecone built from two segments; houses header tanks, forward-flap mechanisms, COPVs and the "PEZ dispenser" Starlink slot (door folds into the payload bay); LOX header tank forms the very top of the nosecone, methane header tank directly below it; four Starlink antennas inside — [Wikipedia: Starship (spacecraft)](https://en.wikipedia.org/wiki/SpaceX_Starship_(spacecraft))
- Flaps: two forward flaps on the payload-bay section; two aft flaps mounted on the sides of the engine bay and LOX tank. Block 1 forward flaps at ~180° apart (same as aft). Block 2 forward flaps "moved leeward, became thinner and angled", sit at ~140° — [Wikipedia: Starship (spacecraft)](https://en.wikipedia.org/wiki/SpaceX_Starship_(spacecraft)) and [Wikipedia: SpaceX Starship](https://en.wikipedia.org/wiki/SpaceX_Starship). Flap dimensions are not given in any fetched source.
- Tanks: Block 2 has a "more elliptical common dome" vs Block 1's conical dome; Block 2 added stringers to the methane tank; Block 2 propellant 1,500 t (1,170 t LOX + 330 t CH4); Block 3 1,600 t — [Wikipedia: SpaceX Starship](https://en.wikipedia.org/wiki/SpaceX_Starship)
- Engines: six Raptors in a shielded engine bay — three gimballing sea-level on the thrust puck + three RVacs mounted to the aft dome; Block 1 had 14–16 engine-bay vents, more added after Flight 7 — [Wikipedia: Starship (spacecraft)](https://en.wikipedia.org/wiki/SpaceX_Starship_(spacecraft)); V3 ship = 6 Raptor 3 (3 sea-level + 3 vacuum) — [OrbitCodex](https://orbitcodex.com/launch-vehicles/starship-v3); Flight 12 ship had "six Raptors" (one shut down at T+36 s) — [Wikipedia: Starship flight test 12](https://en.wikipedia.org/wiki/Starship_flight_test_12)
- Ship thrust: 12.25 MN (B1), 15.69 MN (B2), 26.48 MN (B3); dry mass ~100 t (B1, Musk 2021) / 85 t (B2 infobox) — [Wikipedia: SpaceX Starship](https://en.wikipedia.org/wiki/SpaceX_Starship)
- Heat shield: ~18,000 hexagonal black silica tiles on the windward side, rated 1,400 °C, pinned on with expansion gaps; secondary ablative layer added after Flight 4; felt "crunch wrap" between tiles after Flight 10; TPS + ablative = 10.5 t on a Block 1 ship — [Wikipedia: Starship (spacecraft)](https://en.wikipedia.org/wiki/SpaceX_Starship_(spacecraft)). Individual tile size is not given in any fetched source.
- Variants: HLS (landing legs, body-mounted solar array, mid-body thrusters, two airlocks, elevator); tanker and depot; crewed Starship replaces the cargo bay with a pressurised crew section; the Mars concept mentions a "viewing gallery" — [Wikipedia: Starship (spacecraft)](https://en.wikipedia.org/wiki/SpaceX_Starship_(spacecraft)). For non-Starlink cargo SpaceX plans a large Shuttle-like cargo door rather than a jettisonable fairing — same source.

**Raptor engine dimensions (for bell modelling)**
- Engine length 3.1 m, diameter 1.3 m; sea-level nozzle exit 1.3 m (4.3 ft); RVac nozzle exit 2.4 m (7.9 ft) (both from a mid-2018 SpaceX statement); expansion ratios 34.34 (SL) / 80 (vac); Raptor 3 thrust 250 tf SL / 275 tf vac; masses R1 2,080 kg, R2 1,630 kg, R3 1,525 kg — [Wikipedia: SpaceX Raptor](https://en.wikipedia.org/wiki/SpaceX_Raptor). RVac bell height is not published.

**Launch tower / pad ("Mechazilla") for a pad scene**
- Tower 146 m (479 ft) (2021 FAA determination); built from nine large steel truss sections; "dark gray steel truss sections" with a lightning rod and small weather station on top — [Wikipedia: SpaceX Starbase](https://en.wikipedia.org/wiki/SpaceX_Starbase)
- Pad 1 OLM: twenty clamps hold the booster; 2021 mount had "six large steel circular launch supports"; launch table 370 t; steel-plate water deluge; Pad 2 has a steel-pipe "flame bucket" diverter and a water-cooled steel plate; OLP-2 arms (Jan 2025) use a shorter design — [Wikipedia: SpaceX Starbase](https://en.wikipedia.org/wiki/SpaceX_Starbase)
- Booster catches: Flight 5 (13 Oct 2024) first catch; Flight 6 catch aborted; Flights 7 and 8 caught — [Wikipedia: SpaceX Starbase](https://en.wikipedia.org/wiki/SpaceX_Starbase)
- Flight 12 (first V3): 22 May 2026 22:30 UTC, Booster 19 + Ship 39 from OLP-2; B18 (original V3 booster) was damaged in pressure testing Nov 2025 and scrapped; booster flipped abnormally after staging, hit the Gulf at 1,450 km/h; ship splashed down in the Indian Ocean as planned; payload ~37,500 kg of Starlink simulators — [Wikipedia: Starship flight test 12](https://en.wikipedia.org/wiki/Starship_flight_test_12)

### Inferences
- Segment-by-segment modelling sheet (V2 as baseline; adjust per version):
  - Booster, bottom-up: engine section/skirt ~1.4 m aft rings region with 33 Raptors (centre 3, inner ring 10, outer ring 20 — inferred from "13 inner gimballing" + "20 outer fixed"); 4 chines running up the lower LOX tank as half-cylindrical blisters; LOX tank; common dome; methane tank; forward dome + 3-ring forward stack; on V1/V2 a 1.8 m vented hot-stage ring on top with 4 grid fins just below it (paired ~ at ±~30° from each side, i.e., two per side); on V3 the ring is merged into the top of the booster and 3 larger grid fins sit a few rings lower, at 90°/90°/180° (two on one side 90° apart from a lone fin... i.e. fins at 0°, 90°, 270° — the 180° gap faces the tower side, which is also where the catch pins/fins engage the chopsticks).
  - Ship, bottom-up: skirt with 3 SL Raptors (centre triangle, 1.3 m bells) and 3 RVac (2.4 m bells) on the outer ring; aft flaps (two, large trapezoids hinged along the lower body, windward side); LOX tank; common dome; methane tank; payload bay; forward flaps (two, smaller, V2: thinner and rotated toward the leeward side, ~140° apart); nosecone (ogive-like, built as two segments) ending in the header-tank cap.
  - Approximate V2 ship proportions by ring count: 21 rings × 1.83 m = 38.4 m of cylinder; the remaining ~13.7 m is nosecone + skirt (inference from the cited ring count and 52.1 m height).
  - Booster V3 proportions: 72.3 m total with 33 × 1.83 m = 60.4 m main rings + 4 × 1.4 m = 5.6 m aft rings → ~66 m of cylinders; the rest is engine section depth + forward dome/integrated hot-stage (inference).
- Colour/finish (approximations for three.js): brushed 301 stainless base ~#c9ccd0 with roughness 0.35–0.5 and metalness ~0.9; weld seams every 1.83 m as slightly darker lines ~#9a9ea3; heat-tinted bands near the engine section ~#8f7a62 → #5a4a3f (booster aft after flight); heat-shield tiles near-black ~#1b1b1d matte (windward half of the ship from the nose tip down to the skirt, edge running along the leeward side of both flaps' hinge lines); hot-stage ring on V1/V2 appears as dark, vent-slotted band; grid fins bare stainless, slightly darker (#aeb2b6) due to roughness; SpaceX wordmark small, black or dark grey on the leeward (uncovered) side of the ship upper body and on the booster upper rings (placement not sourced). Tower: dark grey ~#3a3d42 lattice; chopstick arms same; OLM black/dark steel on 6 legs.
- Tile size: not published; the ~20 cm hex often quoted by observers could not be confirmed (see Gaps). For a model, the exact size is invisible at full-vehicle scale; a hex texture with ~45 tiles across the 9 m width (≈ 20 cm) is a reasonable placeholder.
- Mars crew variant renders (windows, large viewing gallery near the nose, cargo door) exist only as SpaceX concept art; the only textual confirmation found is the "viewing gallery" mention.

### Gaps
- V3 ship height not stated anywhere official; 124.4 − 72.3 = 52.1 m assumes no change — not confirmed.
- SpaceX's official starship page (spacex.com/vehicles/starship) is JavaScript-rendered and returned no body text, so the May 2025 "Road to making life multiplanetary" slide figures (123.1 m / 124.4 m) could only be confirmed via Wikipedia's secondary reporting.
- No source gives flap dimensions, nosecone profile equations, tile dimensions, chine length, grid-fin dimensions in metres, RVac bell height, or the exact angular position of the V3 fins relative to the tower.
- "3 + 10 + 20" engine arrangement is implied, not stated.
- Conflict: hot-stage integration into booster (Wikipedia) vs "into the spacecraft" (Gigazine translation).

---

## Key Question 2 — NASA SLS Block 1 (Orion + ICPS) and Block 1B (EUS + USA)

### Takeaway
Block 1 is 98.3 m tall: 64.6 m × 8.4 m orange-foam core with four RS-25 (2.4 m bells), two 54 m × 3.7 m five-segment white SRBs, an 8.4 m-tall LVSA frustum (8.4 → 5.0 m), 13.7 m × 5.1 m ICPS, a 1.5 m OSA, then Orion (5.03 m capsule). Block 1B (crew) would stand 111.6 m with the 17.3 m EUS (8.4 m LH2 tank, 5.5 m LOX tank, 4 RL10C-3) and a 10 m USA (8.4 → 5.5 m) — but NASA cancelled EUS/Block 1B on 26 Feb 2026 and plans to fly a standardised Block 1 (likely with ULA's Centaur V from Artemis V).

### Cited Findings
- Block 1 total height 322.4 ft (98.3 m); fuelled weight 5.74 million lb — [NASA SLS Reference Guide 2022 (PDF)](https://www.nasa.gov/wp-content/uploads/2022/03/sls-reference-guide-2022-v2-508-0.pdf)
- Core stage 212 ft (64.6 m) tall from forward skirt to engine exit plane; 27.6 ft (8.4 m) diameter; four RS-25 each 14 ft (4.3 m) tall × 8 ft (2.4 m) nozzle diameter — [NASA SLS Reference Guide 2022](https://www.nasa.gov/wp-content/uploads/2022/03/sls-reference-guide-2022-v2-508-0.pdf); core built from "ten barrel-shaped main sections, four domes, and seven rings"; 97,940 kg empty / 1,085,410 kg gross — [Wikipedia: Space Launch System](https://en.wikipedia.org/wiki/Space_Launch_System)
- Solid rocket boosters: two, 177 ft (54 m; 54.1 m in detailed section) × 12 ft (3.7 m); five segments (Shuttle casings + added centre segment); 730 t gross each — [NASA SLS Reference Guide 2022](https://www.nasa.gov/wp-content/uploads/2022/03/sls-reference-guide-2022-v2-508-0.pdf); [Wikipedia: SLS](https://en.wikipedia.org/wiki/Space_Launch_System)
- ICPS 45 ft (13.7 m) long × 16.7 ft (5.1 m) diameter — [NASA SLS Reference Guide 2022](https://www.nasa.gov/wp-content/uploads/2022/03/sls-reference-guide-2022-v2-508-0.pdf); LH2 tank 5 m dia, LOX tank 3.2 m dia, 1 × RL10, 32,066 kg gross — [Wikipedia: SLS](https://en.wikipedia.org/wiki/Space_Launch_System)
- Launch Vehicle Stage Adapter (LVSA): 27.5 ft (8.4 m) tall, 8.4 m bottom diameter tapering to 16.5 ft (5.0 m) at the top — [NASA SLS Reference Guide 2022](https://www.nasa.gov/wp-content/uploads/2022/03/sls-reference-guide-2022-v2-508-0.pdf); conical frustum of sixteen Al-Li panels — [Wikipedia: SLS](https://en.wikipedia.org/wiki/Space_Launch_System)
- Orion Stage Adapter (OSA): 5 ft (1.5 m) tall × 18 ft (5.5 m) diameter — [NASA SLS Reference Guide 2022](https://www.nasa.gov/wp-content/uploads/2022/03/sls-reference-guide-2022-v2-508-0.pdf)
- Core colour: orange spray-on foam insulation, "applied as light yellow and darkens to orange with sun exposure"; livery includes "USA", the U.S. flag, NASA meatball and worm marks, the ESA mark, plus black-and-white photogrammetric checkerboards/squares/circles on rocket, mobile launcher and Orion — [NASA SLS Reference Guide 2022](https://www.nasa.gov/wp-content/uploads/2022/03/sls-reference-guide-2022-v2-508-0.pdf); "rust-colored spray-on insulation" — [Wikipedia: SLS](https://en.wikipedia.org/wiki/Space_Launch_System)
- Block 1B crew configuration "will stand 366 feet (111.6 meters) tall"; EUS four RL10C-3, 97,360 lbf total, four times the ICPS propellant; USA internal volume 10,100 ft³ (286 m³), co-manifested payload up to 10 t; cargo 8.4 m fairings 319–989 m³; Block 1B TLI ~38 t crew / ~42 t cargo (Block 1: 27 t) — [NASA SLS Block 1B fact sheet, Dec 2025 (PDF)](https://www.nasa.gov/wp-content/uploads/2026/02/sls-5644-sls-block-1b-fact-sheet-dec2025-508.pdf)
- EUS: height 17.3 m (57 ft); LH2 tank 8.4 m diameter, LOX tank 5.5 m diameter; 4 × RL10C-3 (433.1 kN total); 129,000 kg propellant; 14,110 kg dry; NASA cancelled EUS and the Block 1B/Block 2 upgrades on 26 February 2026, continuing with a "standardized" Block 1 likely using an existing upper stage such as ULA's Centaur V — [Wikipedia: Exploration Upper Stage](https://en.wikipedia.org/wiki/Exploration_Upper_Stage)
- Universal Stage Adapter (USA): total height 10 m; base diameter 8.4 m (at EUS), top diameter 5.5 m (at spacecraft adapter); "one piece separable combination barrel and cone" with blended transition; separation plane 1.7 m above the EUS interface — [NASASpaceflight, Sept 2016](https://www.nasaspaceflight.com/2016/09/nasa-sls-block-1b-universal-stage-adapter/)
- Centaur V planned on SLS from Artemis V: CV-L 10.66 m / CV-HE 12.6 m tall, 5.4 m diameter, 2 × RL10C — [Wikipedia: SLS](https://en.wikipedia.org/wiki/Space_Launch_System)
- Orion crew module: diameter 5.03 m (16.5 ft), length 3.3 m; CM+ESM launch mass 26,520 kg; CM+ESM+LAS 33,446 kg; AVCOAT ablative heat shield; fiberglass Boost Protective Cover during ascent — [Wikipedia: Orion (spacecraft)](https://en.wikipedia.org/wiki/Orion_(spacecraft))
- Mobile Launcher 1: base 25 ft (7.6 m) high × 158 ft (48 m) × 133 ft (41 m); 355 ft (108 m) launch umbilical tower; crawler-transporter 131 × 114 ft, 20 ft high — [Wikipedia: Mobile Launcher Platform](https://en.wikipedia.org/wiki/Mobile_Launcher_Platform)
- Programme status: Artemis I launched 16 Nov 2022; Artemis II launched 1 April 2026 (crewed lunar flyby, success); Artemis III planned late 2027 as a LEO docking test with no upper stage; Artemis IV early 2028 (first landing); Artemis V late 2028, expected first Centaur V on SLS — [Wikipedia: SLS](https://en.wikipedia.org/wiki/Space_Launch_System)

### Inferences
- Block 1 stack bottom-up (from cited numbers): RS-25 bells (4, square pattern, 2.4 m exit) → engine section → core 64.6 m × 8.4 m → LVSA frustum 8.4 m tall (8.4 → 5.0 m) → ICPS 13.7 m × 5.1 m → OSA 1.5 m (5.5 m) → Orion (ESM + CM 5.03 m) → LAS/ogive fairing. Summing 64.6 + 8.4 + 13.7 + 1.5 = 88.2 m leaves ~10 m for Orion + LAS to reach 98.3 m (consistent with the Orion stack being ~10 m above the OSA; exact Orion/LAS lengths not sourced — see Gaps).
- Block 1B crew: 64.6 + 17.3 (EUS) + 10 (USA) = 91.9 m, leaving ~19.7 m for the Orion stack above the USA? That exceeds the ~10 m in Block 1, so part of the USA height must overlap Orion's spacecraft adapter or the EUS "17.3 m" includes an interstage — the modeller should treat 111.6 m as the governing figure and scale the EUS+USA block to ~29 m total.
- SRBs sit beside the core with nose tips well below the core's forward skirt (54 m vs 64.6 m); each has a forward frustum/nose cone and a flared aft skirt — dimensions not sourced.
- Colours (approximations): core foam #d9843a to #c9742f (fresh foam lighter/yellower #e0a060); darker "pre-cured" panel patches near the intertank and dome areas visible as slightly browner rectangles; SRBs white #f2f2f2 with black NASA worm and "USA"/flag; ICPS and LVSA white #f0f0f0 (LVSA is actually off-white/grey with large photogrammetry squares); Orion LAS fairing white with a black tip and a grey/dark ogive abort-motor section; EUS/USA would also be white-painted or foam-insulated — unknown.

### Gaps
- Fetch of the Wikipedia SLS booster article failed, so SRB nose-cone, frustum and forward/aft skirt lengths, nozzle diameter and the exact marking layout (black "NASA"/"USA", flag) are not sourced.
- Orion ESM length, LAS length and total Orion-stack height are not in the fetched sources (Wikipedia Orion page lacks them).
- No source describes the "darker foam panels" on the core (where the hand-applied vs. machine-applied foam differs in shade).
- EUS/USA colour scheme never published (programme cancelled before hardware was painted).
- Mobile Launcher 2 height not stated.

---

## Key Question 3 — Blue Origin New Glenn

### Takeaway
New Glenn is 98 m tall and 7 m in diameter throughout; GS1 is 57.5 m with seven BE-4s, four actuated forward fins near the top of the stage, two fixed strakes lower down (corrected from four in one source), and six hydraulic landing legs in the aft module; GS2 (23.4 m by infobox) has two BE-3Us; the carbon-composite fairing is 7 m × 21.9 m. Colours and the feather logo placement were not described in any fetched text (Inference only).

### Cited Findings
- Height 98 m (322 ft); diameter 7 m (23 ft) for both stages; GS1 length 57.5 m (189 ft); GS2 length 23.4 m (77 ft) in infobox but "roughly 88 feet (26.8 meters)" in body text (conflict); 7 × BE-4 (methalox), 2 × BE-3U (hydrolox); fairing 7 m (up from 5.4 m original design); planned 9×4 variant ~120 m tall with 8.7 m fairing — [Wikipedia: New Glenn](https://en.wikipedia.org/wiki/New_Glenn)
- Blue Origin official: "more than 320 ft (98 m) tall"; seven BE-4 engines, 640,000 lbf (2,846 kN) each at sea level; first stage "designed for a minimum of 25 flights"; "Fins: Four actuated aerodynamic control surfaces for attitude adjustment during descent and landing"; "Strakes: Wing-like surfaces that provide lift and cross-range during descent"; "Six hydraulically-actuated legs in the aft module" landing on a moving platform 620 mi (1,000 km) downrange; second stage two BE-3U at 200,000 lbf (890 kN) each; "Seven-Meter Fairing" with "Twice the volume of traditional five-meter class fairings"; 45 t LEO, >13 t GTO; LC-36 Cape Canaveral; site theme colour #0033DD (web value, not a paint spec) — [Blue Origin: New Glenn](https://www.blueorigin.com/new-glenn)
- Fairing: carbon composite, 7 m (23 ft) diameter, 21.9 m (72 ft) tall — [NASASpaceflight, Dec 2022](https://www.nasaspaceflight.com/2022/12/blue-origin-new-glenn/); 21.9 m also listed by [Next Spaceflight](https://www.nextspaceflight.com/rockets/67/) along with liftoff thrust 17,150 kN and a 121 m-tall 9×4 variant
- Fins vs strakes: "four movable, aerodynamic control surfaces referred to as fins"; "Below these fins" are two strakes (editor's note corrects an earlier claim of four); six extendable landing legs; landing ship Jacklyn 380 × 150 ft (115 × 45 m) — [Astronomy.com](https://www.astronomy.com/space-exploration/a-look-at-new-glenn-blue-origins-heavy-lift-booster-rocket/)
- Early (March 2017) Blue Origin graphics showed two large strakes at the bottom of the booster — [Wikipedia: New Glenn](https://en.wikipedia.org/wiki/New_Glenn)
- Missions: NG-1 16 Jan 2025 (Blue Ring Pathfinder; booster "So You're Telling Me There's a Chance" lost at ~Mach 5.5, 25.7 km); NG-2 13 Nov 2025 (NASA ESCAPADE, 1,070 kg; booster "Never Tell Me The Odds" landed on Jacklyn ~600 km offshore — first New Glenn landing); NG-3 19 Apr 2026 (reflown booster landed; upper-stage malfunction left BlueBird 7 in an unusable orbit); Blue Moon Mark 1 listed as a future mission with no date — [Wikipedia: New Glenn](https://en.wikipedia.org/wiki/New_Glenn)
- NG-1 flight profile: booster "landing on a barge named Jacklyn"; Blue Ring Pathfinder stayed attached to the second stage, MEO 2,400 × 19,300 km, 30° — [Blue Origin: NG-1](https://www.blueorigin.com/missions/ng-1)

### Inferences
- Modelling sheet bottom-up: aft module with 6 folding legs (stowed flush) and 7 BE-4 bells (likely 1 centre + 6 ring — arrangement not sourced); two fixed strakes rising from the aft module along the lower tank (opposite sides); 7 m cylinder to 57.5 m; four actuated fins near the top of GS1 ("below these fins" are the strakes, so fins are forward); interstage; GS2 cylinder 7 m × ~23.4 m; fairing 7 m × 21.9 m (cylinder + ogive) → total 98 m (57.5 + ~18.6 interstage/GS2 exposed + 21.9 ≈ 98, consistent if GS2 is partly enclosed).
- Colours (approximations, unverified): overall white #f4f4f4 with Blue Origin blue #0033dd accents (the brand blue cited from the website theme), feather logo and "NEW GLENN" wordmark in blue, dark/black engine section and bell throats; strakes and fins white; the NG-2 vehicle carried NASA/ESCAPADE mission marks. None of these livery details appear in the fetched text — verify against Blue Origin's gallery images at https://www.blueorigin.com/new-glenn and https://www.blueorigin.com/missions/ng-1.

### Gaps
- Blue Origin's payload user's guide with dimensioned drawings was not found in search results (only third-party reports of 21.9 m fairing).
- No source describes paint colours, stripe placement, logo placement or NG-1 vs NG-2 livery differences.
- BE-4 bell diameter and the 7-engine arrangement pattern are not stated; GS2 length is inconsistent (23.4 vs 26.8 m).
- Fin and strake dimensions not published.

---

## Key Question 4 — SpaceX Falcon Heavy

### Takeaway
70 m tall, 12.2 m wide, three 3.7 m cores each with 9 Merlin 1D in an Octaweb (27 total), 4 titanium grid fins and 4 carbon-fibre landing legs per core, side boosters with outboard nose cones, 4.5 m composite interstage, 12.6 m second stage and a 5.2 m × 13.2 m fairing. Block 5 cores carry a black thermal-protection layer on interstage, landing legs and raceway; Wikipedia says the FH centre-core interstage was later painted white.

### Cited Findings
- Height 70.0 m (229.6 ft); width 12.2 m (40 ft); core diameter 3.7 m (12 ft), same for second stage; mass 1,420 t fuelled; two Falcon 9 boosters attached to a strengthened centre core; 9 Merlin 1D per core, 27 total; liftoff thrust 22.82 MN; engines in SpaceX's "Octaweb" structural form — [Wikipedia: Falcon Heavy](https://en.wikipedia.org/wiki/Falcon_Heavy)
- Landing legs: four per core, carbon fibre with aluminium honeycomb, "stow along the sides of each core during liftoff and extend outward and down just before landing"; grid fins: four retractable fins at the top of each of the three boosters; side boosters carry "aerodynamic nose-cones mounted outboard" — [Wikipedia: Falcon Heavy](https://en.wikipedia.org/wiki/Falcon_Heavy)
- Interstage 4.5 m (15 ft), composite (aluminium honeycomb core, carbon-fibre face sheets); "the black thermal layer on Block 5 center-core interstages was later painted white" on Falcon Heavy flights — [Wikipedia: Falcon Heavy](https://en.wikipedia.org/wiki/Falcon_Heavy)
- Second stage 12.6 m (41 ft) × 3.7 m, 4 t dry / 111.5 t fuelled, one Merlin 1D Vacuum 934 kN; a grey band on the RP-1 tank (mission-extension kit) absorbs sunlight — [Wikipedia: Falcon Heavy](https://en.wikipedia.org/wiki/Falcon_Heavy)
- Fairing 13.2 m (43 ft) tall × 5.2 m (17 ft), 1.7 t, carbon-fibre monocoque halves — [Wikipedia: Falcon Heavy](https://en.wikipedia.org/wiki/Falcon_Heavy)
- Falcon 9 Block 5 appearance: "a black thermal protection layer on the landing legs, raceway, and interstage"; cast-and-machined titanium grid fins; first stage 41.2 m (or 42.6 m in the characteristics table — conflict); second stage 13.8 m; 69.8 m with fairing — [Wikipedia: Falcon 9 Block 5](https://en.wikipedia.org/wiki/Falcon_9_Block_5)
- Launch site KSC LC-39A (Vandenberg SLC-6 future) — [Wikipedia: Falcon Heavy](https://en.wikipedia.org/wiki/Falcon_Heavy)
- SpaceX's own Falcon Heavy page is JS-rendered and returned no specification text — [SpaceX Falcon Heavy page](https://www.spacex.com/vehicles/falcon-heavy/)

### Inferences
- Modelling sheet: three parallel 3.7 m cylinders at 3.7 m centre spacing... more precisely centres at ±4.25 m (12.2 m total width ÷ 2 − 1.85 m radius); side boosters ~41–42.6 m tall with white ogive nose cones (~5 m, inferred) replacing the interstage; centre core 41–42.6 m + 4.5 m interstage (black on Block 5 F9; white/grey on later FH per Wikipedia) + 12.6 m second stage + 13.2 m fairing ≈ 70 m. Octaweb: 8 Merlins in a ring around 1 centre (standard F9 layout — not explicitly stated in fetched text).
- Colours: white body #f2f2f2; black interstage/legs/raceway #141414 (Block 5 "sooty" look after reuse: #6b6b6b–#3a3a3a streaks); titanium grid fins dark grey-brown #4a4440; black Octaweb/heat shield at the base; SpaceX wordmark black on the body, US flag near the top of each core; nose cones white with black "chevron" pattern on some flights (unverified).

### Gaps
- Merlin 1D nozzle diameter, grid-fin dimensions, nose-cone profile, and the raceway positions are not in fetched sources.
- Whether FH centre-core interstages are black or white varies by mission; Wikipedia's "later painted white" statement is unreferenced in the fetched text and should be checked against photos of the specific mission being modelled.

---

## Key Question 5 — Long March 10 (three-core crewed lunar) and Long March 10A

### Takeaway
Long March 10 is 92.5 m tall with a 5 m core and two 5 m boosters each carrying seven YF-100K (21 at liftoff), a two-YF-100M second stage and a three-YF-75E third stage, lifting ~27 t to TLI; Long March 10A is the 67 m single-stick variant (7 YF-100K + 1 YF-100M, grid fins, hook-and-tensioned-wire/net recovery, no landing legs). Mengzhou is 4.5 m in diameter and 7.23 m (LEO) / 8.8 m (lunar) long. No fetched source describes the colour scheme (Inference only).

### Cited Findings
- Height 92.5 m (303 ft) (infobox; "approximately 90 metres" in text); liftoff mass 2,189 t; core diameter 5 m, two 5 m boosters; seven YF-100K on the core and on each booster = 21 engines; second stage two YF-100M; third stage three YF-75E; fairing-separation test Nov 2024; escape tower included — [Wikipedia: Long March 10](https://en.wikipedia.org/wiki/Long_March_10)
- "92.5 meters tall", "five meters wide", 2,189 t, 2,678 t thrust, ≥27 t to Earth-moon transfer; shorter variant (no side boosters, no third stage) 67 m tall, ~740 t, 14 t to Tiangong — [China Daily / chinaservicesinfo, 12 Feb 2026](https://www.chinaservicesinfo.com/s/202602/12/WS698d3fa5498e36855033a933/china-comes-a-step-closer-to-crewed-moon-mission.html)
- Long March 10A: length 67.4 m, diameter 5.0 m, 2 stages, 7 YF-100-series engines on stage 1 and 1 on stage 2, 8,750 kN thrust, 750 t launch mass, 18,000 kg LEO; first stage recovered downrange by a barge with an arrestor net and support frame, using grid fins to land on the net's cables — [Space Launch Now: Long March 10A](https://spacelaunchnow.app/vehicle/launch_vehicle/537/) (secondary)
- 10A: "tethered landing devices" — hooks on the stage caught by a tensioned wire system; no landing legs; grid fins — [Wikipedia: Long March 10](https://en.wikipedia.org/wiki/Long_March_10); "deployable hooks that engage a tensioned-wire catch system"; payload 14 t reusable / 18 t expendable — [KeepTrack deep dive](https://keeptrack.space/deep-dive/long-march-10)
- Mengzhou: 7.23 m (LEO) / 8.8 m (lunar) long; crew module 4.5 m across; 14,000 kg (LEO) / 21,600 kg (lunar); expendable service module — [Wikipedia: Mengzhou](https://en.wikipedia.org/wiki/Mengzhou_(spacecraft)); "nearly 9 meters" long, 4.5 m diameter, 22 t — [chinaservicesinfo](https://www.chinaservicesinfo.com/s/202602/12/WS698d3fa5498e36855033a933/china-comes-a-step-closer-to-crewed-moon-mission.html)
- Test history: 11 Feb 2026 03:00 UTC, Wenchang LC-301: low-altitude flight + Mengzhou max-q abort at ~65 s / ~11 km; capsule pulled away by its escape tower, parachuted into the South China Sea; booster coasted above the Kármán line, deployed grid fins, reignited engines twice, hovered and splashed down ~200 m from its recovery vessel — [Wikipedia: Mengzhou](https://en.wikipedia.org/wiki/Mengzhou_(spacecraft)); [chinaservicesinfo](https://www.chinaservicesinfo.com/s/202602/12/WS698d3fa5498e36855033a933/china-comes-a-step-closer-to-crewed-moon-mission.html)
- 10 Jul 2026: Long March 10B orbital debut from Hainan Commercial Space Launch Site LC-2, first stage recovered (sources differ: platform landing vs sea-based net) — [Wikipedia: Long March 10](https://en.wikipedia.org/wiki/Long_March_10); "caught by a net at sea" — [KeepTrack](https://keeptrack.space/deep-dive/long-march-10)
- Planned: Mengzhou-1 uncrewed on 10A late 2026 (slipping to early 2027 per KeepTrack); 10-Y1 uncrewed lunar Mengzhou 2027; 10-Y2/Y3 2028; crewed landing 10-Y4/Y5 2029; methalox Long March 10C (YF-219) announced July 2026 — [Wikipedia: Long March 10](https://en.wikipedia.org/wiki/Long_March_10); [KeepTrack](https://keeptrack.space/deep-dive/long-march-10)
- Launch pad: Wenchang LC-301 (under construction Aug 2025) — [Wikipedia: Long March 10](https://en.wikipedia.org/wiki/Long_March_10)

### Inferences
- Modelling sheet (three-core): centre core 5 m × ~67 m (same first/second stages as 10A per China Daily "basically identical") + third stage + Mengzhou (4.5 m, ~8.8 m) + escape tower → 92.5 m; two 5 m boosters strapped to the core, each ~7 engines (probably 1 centre + 6 ring; not sourced), with conical/ogive noses ending roughly at the core's first-stage top (first-stage length not published). 10A: 5 m × 67.4 m single stick with grid fins near the top of stage 1 and hook hardpoints, no legs.
- Colours (approximations, unverified by text): standard CASC scheme — white body #f3f3f3, blue "中国航天" and "CZ-10"/"长征十号" lettering plus the PRC flag (#de2910 red, #ffde00 gold stars), blue trim bands around booster noses/interstage (#1e4ea1); escape tower white with a dark grey conical cap; fairing/capsule adapter white. These are inferences from typical Long March livery; verify with CMSA/Xinhua photos of the Feb 2026 test vehicle.

### Gaps
- No fetched source gives stage lengths, fairing/escape-tower dimensions, engine arrangement pattern or livery details for CZ-10/10A; Chinese official pages (CMSA) were not reachable in this pass.
- Recovery method for 10A (net vs platform vs tethered hooks) is described inconsistently across sources.

---

## Key Question 6 — Rocket Lab Neutron

### Takeaway
Neutron is 43 m (PUG) / 42.8 m (Wikipedia) tall, 7 m maximum diameter with a tapered carbon-composite first stage, nine Archimedes engines (733 kN each), four forward canards, four landing legs (Wikipedia: folding, Falcon-9-like, not fixed), a 5.5 m (PUG; website says 5 m) captive "Hungry Hippo" clamshell fairing hinged to stage 1, and an 11.5 m × 4.9 m second stage hung inside; it had not flown as of the fetched pages (NET Q4 2026 / NET 2027). Its surface colour is not stated in any source.

### Cited Findings
- "stands 43-meters (141 feet) tall"; max diameter 7 m (22.9 ft); Stage 1 height 42.8 m, 7 m diameter, pressurised CFRP monocoque, "tapered profile with aerodynamic control surfaces"; Stage 2 11.5 m × 4.9 m CFRP monocoque, suspended inside the "extended interstage assembly" that returns with Stage 1; fairing 5.5 m (18 ft) carbon-composite split clamshell (aluminium honeycomb core) that remains attached to Stage 1; four canards located forward; "X and Z axes are aligned with the strakes and canards"; diagram labels "Landing Gear" (no count); nine sea-level Archimedes (6,600 kN total, up to 733 kN each); one vacuum Archimedes 900 kN; payload 13,000 kg DRL / 8,500 kg RTLS / 15,000 kg expendable to 500 km mid-inclination; LC-3 Wallops (37.8324, −75.4893) — [Rocket Lab Neutron Payload User's Guide v1.0 (PDF)](https://rocketlabusa.com/assets/Uploads/Rocket-Lab-Neutron-PUG-Reduced.pdf)
- Website: 43 m / 141 ft; 7 m diameter; fairing diameter 5 m (conflicts with PUG's 5.5 m); 480,000 kg liftoff; 9 Archimedes at 165,000 lbf each, 1,450,000 lbf total; Stage 2 Archimedes Vacuum with nozzle extension 2.5 m taller, 200,000 lbf; gallery item "13m carbon composite interstage"; "Hungry Hippo" captive fairing opens like a clamshell to deploy Stage 2 then closes for re-entry; landing platform "Return On Investment", a 400-ft platform; Stage 1 returns to LC-3 — [Rocket Lab: Neutron](https://www.rocketlabcorp.com/launch/neutron/)
- Wikipedia: overall height 42.8 m; first stage 42.8 m × 7 m with 9 Archimedes, "4 landing legs and canards"; legs are not fixed — redesigned to fold like Falcon 9's; second stage 11.5 m × 4.9 m, hung from the separation plane so its tank is in tension; two fairing segments hinged to the first stage; earlier 2021 design 40 m tall with 4.5 m fairing; "Return On Investment" is a refitted 120 m (400 ft) barge; LC-3 complete Q3 2025; first flight "2026 (planned)"/"NET last quarter of 2026"/milestone table "NET 2027" (conflicting) — [Wikipedia: Rocket Lab Neutron](https://en.wikipedia.org/wiki/Rocket_Lab_Neutron)

### Inferences
- Modelling sheet bottom-up: four legs splayed from the 7 m base; nine Archimedes bells (likely 3×3 or 1+8 — not sourced); gently tapering frustum from 7 m at the base to ~5–5.5 m at the top over ~43 m (the "tapered profile"); four small canards near the top; the top ~13 m is the interstage + two hinged fairing petals forming an ogive nose that splits into halves. The second stage is entirely enclosed — nothing of it is visible externally.
- Colour: Rocket Lab's renders and the composite test tanks show the raw/clear-coated carbon-fibre look — near-black with a woven sheen, approximately #1c1e22 with a slight gloss (roughness ~0.3), white "ROCKET LAB"/"NEUTRON" wordmarks and small white/grey panels. This is unverified by any fetched text (every source was silent on colour).

### Gaps
- No official statement of exterior colour or logo placement.
- Fairing diameter conflict (5 m website vs 5.5 m PUG); "fixed legs" premise in the question contradicts Wikipedia (folding legs).
- Engine arrangement pattern and canard/leg dimensions not published.

---

## Key Question 7 — ULA Vulcan Centaur (VC6)

### Takeaway
Vulcan stands 61.6 m (standard 15.5 m fairing) or 67.3 m (long 21.3 m fairing) with a constant 5.4 m diameter; the 33.3 m first stage has two BE-4s, up to six GEM-63XL SRBs (21.98 m × 1.62 m), the Centaur V upper stage is 5.4 m × 10.66 m (CV-L) / 12.6 m (CV-HE) with two RL10Cs. VC6L (six SRBs, long fairing) is the Amazon Leo configuration. No fetched text describes the livery.

### Cited Findings
- Total height 61.6 m (202 ft) standard, 67.3 m (221 ft) long configuration; core diameter 5.4 m; gross mass 546,700 kg; first stage 33.3 m × 5.4 m, 2 × BE-4, 382,000 kg gross; GEM-63XL 21.98 m (865.3 in) × 1.62 m (63.7 in), max six; Centaur V 5.4 m diameter, 10.66 m (CV-L) / 12.6 m (CV-HE), 2 × RL10C (RL10E planned); fairing standard 15.5 m / long 21.3 m, long fairing ~317 m³; configuration code VC + SRB count + S/L fairing (VC2S Cert-1/Cert-2, VC4S USSF-106/USSF-87, VC6L Amazon Leo, VC4L Dream Chaser, VC2L WGS-11); SLC-41 Cape Canaveral, Vandenberg SLC-3E planned — [Wikipedia: Vulcan Centaur](https://en.wikipedia.org/wiki/Vulcan_Centaur)
- ULA official: two BE-4 at 550,000 lb sea-level thrust (LNG/LO2); up to six Northrop Grumman GEM 63XL, 71.8 ft long, 459,600 lb peak vacuum thrust, 90 s burn; two RL10C (L3Harris), 24,000 lb nominal thrust; fairing 5.4 m (17.7 ft) diameter, 15.5 m (51 ft) standard / 21.3 m (70 ft) long; 6-SRB payload 27,200 kg LEO-ref, 14,500 kg GTO, 6,500 kg GEO, 11,500 kg TLI — [ULA: Vulcan Centaur](https://www.ulalaunch.com/rockets/vulcan-centaur)
- "The Vulcan rocket stands 61.6 meters (202 feet) tall with a consistent diameter of 5.4 meters (18 feet)"; aluminium orthogrid tanks holding >450 t propellant; each BE-4 2.45 MN sea-level; GEM 63XL "Standing 21.8 meters (71.8 feet) tall ... graphite-epoxy composite" — [NASASpaceflight, Jan 2024](https://www.nasaspaceflight.com/2024/01/vulcan-flight-one-preps/)
- Flights/anomalies: Cert-1 8 Jan 2024 (VC2S, Peregrine); Cert-2 4 Oct 2024 (VC2S) — SRB nozzle detached ~37 s, asymmetric thrust compensated, orbit reached; USSF-106 13 Aug 2025 (first VC4S, first NSSL); USSF-87 12 Feb 2026 — another GEM-63XL malfunction, nominal orbit, Space Force paused NSSL launches on Vulcan pending a fix — [Wikipedia: Vulcan Centaur](https://en.wikipedia.org/wiki/Vulcan_Centaur)

### Inferences
- VC6L modelling sheet bottom-up: aft transition structure with two BE-4 bells side by side; six GEM-63XL cylinders (1.62 m × 21.98 m) clustered around the base with ogive nose caps, tips reaching ~22 m up the 33.3 m first stage; first stage 5.4 m × 33.3 m; Centaur V 5.4 m × ~12.6 m (hidden inside the 5.4 m interstage/skirt so the vehicle is a constant cylinder); long fairing 5.4 m × 21.3 m with ogive nose → 67.3 m total (33.3 + 12.6 + 21.3 ≈ 67.2).
- Colours (approximations, UNVERIFIED — no fetched text describes the paint): white tanks #f2f2f2; ULA's Vulcan branding uses a dark red/burnt-orange "VULCAN" wordmark and chevron accents (~#b5342a) plus grey (#8c8f94) on the aft section and interstage; SRBs white with dark grey nose caps; Centaur V white (foam/MLI); BE-4 bells dark grey. The modeller should pull the colour from ULA's own photos at https://www.ulalaunch.com/rockets/vulcan-centaur (the page's gallery includes an expanded-view art image "Vulcan_ART_nowords").

### Gaps
- Livery/colour description absent from every fetched source (ULA page, Wikipedia, NSF, AmericaSpace search hits not fetched).
- GEM-63XL nose-cone shape and attachment positions, BE-4 bell diameter, interstage length not published in fetched sources.
- Minor conflict: GEM-63XL 21.98 m (Wikipedia, from 865.3 in) vs 21.8 m (NSF) vs 71.8 ft = 21.9 m (ULA).

---

## Key Question 8 — Saturn V (historical benchmark)

### Takeaway
Saturn V is 111 m tall: S-IC 42 m × 10 m (five F-1 in quincunx, four fins, four conical engine fairings), S-II 24.9 m × 10 m (five J-2), S-IVB 17.8 m × 6.6 m (one J-2, two APS pods, flared aft interstage 10 → 6.6 m), 0.91 m Instrument Unit, 8.5 m SLA (6.6 → 3.91 m), 7.49 m Service Module and 3.48 m × 3.91 m Command Module, 9.92 m LES (12.02 m with BPC). The S-IC thrust structure/fuel tank wore alternating black and white roll-pattern stripes; the exact band layout of the intertank, forward skirts and S-IVB interstage quadrants is only partially documented in the fetched sources (see Gaps) — the modeller should work from Apollo 11 photographs.

### Cited Findings
- Total height with Apollo spacecraft 111 m (363 ft); base diameter 10 m (33 ft) ignoring fins; fuelled mass 2,822–2,965 t; S-IC 42 m (138 ft) × 10 m, five F-1 in a quincunx (centre fixed, four outer gimbal); S-II 24.87 m (81 ft 7 in) × 10 m, five J-2 arranged similarly; S-IVB 17.86 m (58 ft 7 in) × 6.60 m, one J-2; Instrument Unit 0.91 m (36 in) tall × 6.6 m, ~2,000 kg — [Wikipedia: Saturn V](https://en.wikipedia.org/wiki/Saturn_V)
- S-IC details: 42 m × 10 m; 2,214 t gross, 137 t empty; four stabilising fins (withstood 1,100 °C); four conical engine fairings each holding two solid retrorockets (eight total), fairing sections forward of the fins blown off at separation; intertank holds LOX fill/drain and part of the five LOX feed lines; forward skirt of corrugated 7075 aluminium with external stringers; fuel (RP-1) tank 790 m³ built without external stringers; LOX tank 1,266 m³ with feed lines running through the fuel tank in insulated tunnels; "The thrust structure and fuel tank have alternating black and white paint" to monitor roll in flight — [Wikipedia: S-IC](https://en.wikipedia.org/wiki/S-IC)
- S-II details: 24.9 m × 10 m; 480 t gross, 36.2 t empty; five J-2 quincunx; ellipsoidal LOX tank 10 m dia × 6.7 m high; LH2 tank of six cylinders (five 2.4 m high + one 0.69 m); common bulkhead; insulation sprayed on by hand — [Wikipedia: S-II](https://en.wikipedia.org/wiki/S-II)
- S-IVB details: 17.81 m (58 ft 5 in) × 6.60 m; 123 t gross; two APS modules (each with roll/pitch/yaw thrusters and a 70 lbf ullage thruster); 500-series interstage "flares out to match the S-II's larger diameter" (no length given) — [Wikipedia: S-IVB](https://en.wikipedia.org/wiki/S-IVB)
- Apollo CSM: CM 3.48 m (11 ft 5 in) tall incl. probe and aft heat shield × 3.91 m (12 ft 10 in) base diameter; SM cylinder 4.52 m long × 3.91 m, 7.49 m including SPS nozzle and heat shield; SPS nozzle 3.882 m long × 2.501 m exit; CSM total 11.0 m; CM covered in "silver Mylar thermal coating that looks like aluminum foil" / aluminised PET with "a shiny mirrored appearance"; "The SM walls were left unpainted except for the EPS and ECS radiators, which were white" — [Wikipedia: Apollo command and service module](https://en.wikipedia.org/wiki/Apollo_command_and_service_module)
- LES: 9.92 m (32 ft 6 in) without BPC, 12.02 m (39 ft 5 in) with BPC, 0.66 m (2 ft 2 in) diameter, 4,200 kg; BPC is a hollow conical fibreglass structure; SLA height 8.5 m (28 ft), apex diameter 3.91 m (SM end), base diameter 6.60 m (S-IVB end), 1,840 kg — [Wikipedia: Apollo (spacecraft)](https://en.wikipedia.org/wiki/Apollo_(spacecraft))
- Paint-pattern evidence from a 1/96 modelling blog (secondary, modeller working from David Weeks drawings): the S-IC aft tank has "eight yellow drain labels, placed just below the intertank section, at the top of each black and white stripe" (implying eight alternating stripes — four black, four white); the engine fairings were finished in "white, black and metallic"; US flags are on the forward (LOX) tank; "UNITED STATES"/USA markings come as decals — [Oikofuge: Revell 1/96 S-IC Part 2](https://oikofuge.com/revell-1-96-saturn-v-s-ic-stage-part-2/)
- S-IVB aft interstage pattern is "strongly asymmetrical, with four quadrants each with their own black/white scheme", with "horizontal black/white separations around the curve of a ribbed cone" and small 2×2 checkerboard sway targets — [Oikofuge: S-IVB Aft Interstage](https://oikofuge.com/revell-1-96-saturn-v-s-ivb-aft-interstage/)
- S-IVB forward skirt carries "black paintwork" with "four white antenna fairings"; the "U S A" lettering printed in the Revell kit is wrong because "The only Saturn V S-IVB stage to be lettered in this way was the 500F Facilities Integration Vehicle, a dummy that never flew" — [Oikofuge: Revell 1/96 S-IVB](https://oikofuge.com/revell-1-96-saturn-v-s-ivb/)
- Why black and white, and how it changed: Saturn I/IB patterns were roll-tracking aids; the 1966 SA-500F Saturn V dummy was white with black stripes rising about a third of the way up the first stage, continuing onto the upper stage and aft interstage ending at a black ring, with a checkered upper interstage and a black Instrument Unit; the black paint overheated the tanks, so on "subsequent Saturn Vs the black stripes on the upper part of the stage and the first-stage band were painted over in white" — [Popular Science: Why was the Saturn V black and white?](https://www.popsci.com/why-was-saturn-v-black-and-white/)

### Inferences
- Stack bottom-up (cited lengths): F-1 bells (~5) → S-IC 42 m with 4 fins + 4 conical fairings at the base → S-IC/S-II interstage (length not sourced; included in the stage figures above by convention) → S-II 24.9 m → S-IVB aft interstage frustum 10 → 6.6 m (length not sourced) → S-IVB 17.8 m → IU 0.91 m → SLA 8.5 m (6.6 → 3.91 m) → SM 7.49 m → CM 3.48 m → LES 9.92 m (12.02 m incl. BPC). Check: 42 + 24.9 + 17.8 + 0.9 + 8.5 + 7.5 + 3.5 + ~9 ≈ 114 m, slightly over 111 m because stage figures overlap at interfaces (the CM sits inside the BPC, the SM nozzle recesses into the SLA).
- Roll-pattern layout to reproduce (partly cited, partly from well-known Apollo 11 photographs — verify before modelling): S-IC lower body (thrust structure + RP-1 tank) in eight alternating black/white vertical sectors, with the fins and fairings white; intertank corrugated band with black/white vertical segments; LOX tank white carrying the US flag high and "UNITED STATES" vertical black lettering below it; S-IC forward skirt and S-II aft interstage with black/white quadrant panels; S-II body white with flag and "UNITED STATES"; S-IVB aft interstage asymmetric four-quadrant black/white cone; S-IVB body white with flag/"UNITED STATES"; S-IVB forward skirt with black areas and four white antenna fairings; IU white on flown vehicles (black only on 500F); SLA white; SM bare metal (#b8b8b8) with white radiators; CM/BPC silver-white; LES white tower and motor.
- Hex approximations: white #f2f0ea (slightly warm, aged), black #0e0e0e, bare-metal SM #c0c0c0 metalness 0.8, F-1 bells dark gunmetal #3b3b3b (the F-1 nozzle extensions were uncoated Inconel; appear dark grey), fins and fairings white.

### Gaps
- No fetched source gives the exact widths/positions of the intertank stripes, the forward-skirt quadrant layout, the S-II interstage markings, the "UNITED STATES" lettering height/positions, or mission-to-mission differences (Apollo 4/6 vs 8–17). The NASA Saturn V Flight Manual SA-503 and David Weeks drawings (referenced by the Oikofuge posts) are the recommended primary references but were not fetched.
- F-1 nozzle exit diameter, fin span/chord, S-IC/S-II interstage length, S-IVB aft interstage length and Launch Umbilical Tower height are not in the fetched pages.
- The NASA Constellation blog "A Rocket's Coat of Many Colors" redirects to a dead page.

---

## Key Question 9 — Cross-vehicle scale table and reference image sources

### Takeaway
For a side-by-side three.js scene, the heights to use are: Saturn V 111 m; Starship V1 121.3 / V2 123.1 / V3 124.4 m; SLS Block 1 98.3 m / Block 1B 111.6 m (cancelled); New Glenn 98 m; Long March 10 92.5 m / 10A 67.4 m; Falcon Heavy 70 m; Vulcan 61.6 m (67.3 m long fairing); Neutron 43 m. Diameters: Saturn V 10.06 m, Starship 9 m, SLS core 8.4 m, New Glenn 7 m, Neutron 7 m, Vulcan 5.4 m, Long March 10 5 m, Falcon Heavy 3.7 m cores (12.2 m wide).

### Cited Findings
- Consolidated height/diameter table (all from the sources cited in Questions 1–8 above):
  - Starship V1 121.3 m / V2 123.1 m / V3 124.4 m, Ø 9 m — [Wikipedia: SpaceX Starship](https://en.wikipedia.org/wiki/SpaceX_Starship)
  - Saturn V 111 m, Ø 10 m — [Wikipedia: Saturn V](https://en.wikipedia.org/wiki/Saturn_V)
  - SLS Block 1 98.3 m, core Ø 8.4 m — [NASA SLS Reference Guide](https://www.nasa.gov/wp-content/uploads/2022/03/sls-reference-guide-2022-v2-508-0.pdf); Block 1B 111.6 m — [NASA Block 1B fact sheet](https://www.nasa.gov/wp-content/uploads/2026/02/sls-5644-sls-block-1b-fact-sheet-dec2025-508.pdf)
  - New Glenn 98 m, Ø 7 m — [Blue Origin](https://www.blueorigin.com/new-glenn); [Wikipedia: New Glenn](https://en.wikipedia.org/wiki/New_Glenn)
  - Long March 10 92.5 m, Ø 5 m — [Wikipedia: Long March 10](https://en.wikipedia.org/wiki/Long_March_10); 10A 67.4 m — [Space Launch Now](https://spacelaunchnow.app/vehicle/launch_vehicle/537/)
  - Falcon Heavy 70.0 m, Ø 3.7 m cores, 12.2 m wide — [Wikipedia: Falcon Heavy](https://en.wikipedia.org/wiki/Falcon_Heavy)
  - Vulcan 61.6 m / 67.3 m, Ø 5.4 m — [Wikipedia: Vulcan Centaur](https://en.wikipedia.org/wiki/Vulcan_Centaur)
  - Neutron 43 m, Ø 7 m — [Rocket Lab Neutron PUG](https://rocketlabusa.com/assets/Uploads/Rocket-Lab-Neutron-PUG-Reduced.pdf)
- Reference documents with dimensioned drawings/renders (all fetched and confirmed live in this pass):
  - NASA SLS Reference Guide 2022 (dimensioned expanded views, livery description): https://www.nasa.gov/wp-content/uploads/2022/03/sls-reference-guide-2022-v2-508-0.pdf
  - NASA SLS Block 1B fact sheet (Dec 2025, artist's concept of Block 1B): https://www.nasa.gov/wp-content/uploads/2026/02/sls-5644-sls-block-1b-fact-sheet-dec2025-508.pdf
  - Rocket Lab Neutron Payload User's Guide (vehicle diagram with canards/landing gear labels, Table 1 dimensions): https://rocketlabusa.com/assets/Uploads/Rocket-Lab-Neutron-PUG-Reduced.pdf
  - Rocket Lab Neutron page (renders, "13m carbon composite interstage" gallery): https://www.rocketlabcorp.com/launch/neutron/
  - Blue Origin New Glenn page (fins/strakes/legs descriptions, imagery): https://www.blueorigin.com/new-glenn ; NG-1 mission page with flight-profile diagram: https://www.blueorigin.com/missions/ng-1
  - ULA Vulcan Centaur page (expanded-view image "Vulcan_ART_nowords", fairing/SRB specs): https://www.ulalaunch.com/rockets/vulcan-centaur
  - Wikipedia articles used above (infobox images are the quickest colour references): SpaceX Starship, SpaceX Super Heavy, SpaceX Starship (spacecraft), SpaceX Raptor, SpaceX Starbase, Starship flight test 12, Space Launch System, Exploration Upper Stage, Orion (spacecraft), New Glenn, Falcon Heavy, Falcon 9 Block 5, Long March 10, Mengzhou (spacecraft), Rocket Lab Neutron, Vulcan Centaur, Saturn V, S-IC, S-II, S-IVB, Apollo command and service module, Apollo (spacecraft).

### Inferences
- For a pad scene: Starship's 146 m dark-grey lattice tower with chopsticks dwarfs the 124.4 m vehicle; SLS's ML-1 tower (108 m) is shorter than the 98.3 m rocket + lightning mast; both are cited above.
- Ryan Caton / "The Space Stuff" / Everyday Astronaut comparison graphics were not fetched; they can be used as secondary visual cross-checks but the figures above come from the primary/Wikipedia sources cited.

### Gaps
- SpaceX's official pages (starship, falcon-heavy) are JavaScript-rendered and could not be read; their published figures (e.g., Starship "123 m") are known only via secondary reporting.
- Direct image downloads from Wikipedia/Commons were blocked by the sandbox proxy (HTTP 403), so no colour sampling from photographs was possible; all hex values in this file are the researcher's approximations.
- Blue Origin's and CMSA's dimensioned user guides/drawings were not located.
