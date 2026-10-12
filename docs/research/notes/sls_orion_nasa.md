# NASA SLS, Orion, Artemis status and NASA crewed-Mars architecture — technical/programmatic dossier (state of play as of 2026-10-12)

Confidence legend used in every table: **H** = primary NASA/CRS/OIG document or NASA release; **M** = Wikipedia/secondary summary of primary data, or two sources agree; **L** = single secondary source, headline only, or derived by me; **UNVERIFIED** = could not be confirmed from any fetched source dated after June 2026 (or at all). All units SI unless the source only gives imperial (then both). "Accessed 2026-10-12" means the live Wikipedia article as fetched today.

Research note: searches for July–October 2026 developments (Artemis III hardware, Starship V3, Blue Moon, FY2027 appropriations outcome, Mars 2026-window flights) returned no sources dated after June 2026. Everything after June 2026 below is therefore marked UNVERIFIED; the latest confirmed programmatic snapshot is CRS IF11643 v22 (2026-06-25) and the NASA Artemis III crew announcement (2026-06-09).

## Key Question 1 — SLS Block 1 / 1B / 2 vehicle numbers (for the simulation)

### Takeaway
SLS Block 1 (the only configuration that has flown, Artemis I 2022-11-16 and Artemis II 2026-04-01) is a 98 m, ~2,610 t vehicle with ~39 MN liftoff thrust, 95 t to LEO and >27 t to TLI; Block 1B (42 t TLI) and Block 2 (>46 t TLI, 53 MN) were cancelled on 2026-02-26/27 along with the Exploration Upper Stage, so for any "real" simulation the Block 1 numbers plus a future ULA Centaur V upper stage (from Artemis V, NET late 2028) are what NASA actually plans; Block 1B/2 numbers remain valid only as paper designs. No public payload-vs-C3 curve data could be retrieved.

### Cited Findings

**Table 1.1 — Whole-vehicle figures by block**

| Parameter | Block 1 (ICPS) | Block 1B (EUS) | Block 2 (EUS + BOLE) | Source / confidence |
|---|---|---|---|---|
| Height | 98 m | n/s | n/s | [Wikipedia: Space Launch System](https://en.wikipedia.org/wiki/Space_Launch_System) (accessed 2026-10-12) — M |
| Core diameter | 8.4 m | 8.4 m | 8.4 m | same — M |
| Liftoff mass | 2,610,000 kg | n/s | n/s | same — M |
| Liftoff thrust (sea level) | 39 MN (8.8 Mlbf) | 39 MN (8.8 Mlbf) | 53 MN (11.9 Mlbf) | Wikipedia SLS — M; Block 1B/2 thrust confirmed by [Creech, NASA SLS payload presentation, 2019-10-25](https://ntrs.nasa.gov/api/citations/20190033324/downloads/20190033324.pdf) — H |
| Payload to LEO (200 km, 28.5°) | 95,000 kg | 105,000 kg | 130,000 kg | Wikipedia SLS — M; same values in Creech 2019 (95/105/130 t) — H |
| Payload to TLI (C3 ≈ −0.99 km²/s²) | >27,000 kg (Wikipedia); ">26 t" (Creech) | 42,000 kg (Wikipedia); 34–37 t crew / 37–40 t cargo (Creech) | >46,000 kg (Wikipedia); ">45 t" (Creech) | both as above — M/H; note the Block 1B spread reflects crew vs cargo variants and design maturity |
| Stages | 2.5 | 2.5 | 2.5 | Wikipedia SLS — M |
| Co-manifested payload with Orion (Block 1B, Universal Stage Adapter) | — | ≤10 t, 286 m³ | — | Creech 2019 — H |
| Cargo fairing volumes | 8.4 m × 19.1 m = 621 m³; 8.4 m × 27.4 m = 988 m³ | | | Creech 2019 — H |
| Status (2026-10) | Flown twice; "standardized near-Block 1" is the only future configuration | Cancelled 2026-02-26 | Cancelled 2026-02-26 | [Wikipedia: Exploration Upper Stage](https://en.wikipedia.org/wiki/Exploration_Upper_Stage) (accessed 2026-10-12) — M; [NASASpaceflight, March 2026](https://www.nasaspaceflight.com/2026/03/artemis-course-correction-moonward-details/) — M; [CRS IF11643 v22, 2026-06-25](https://www.everycrsreport.com/files/2026-06-25_IF11643_77a7769501c048e5b4c9174a1a5d583b9a725dcc.pdf) — H |

**Table 1.2 — Core stage (common to all blocks)**

| Parameter | Value | Source / confidence |
|---|---|---|
| Height | 64.6 m (≈65 m in body text) | Wikipedia SLS — M |
| Diameter | 8.4 m | Wikipedia SLS — M |
| Empty (dry) mass | 97,940 kg | Wikipedia SLS — M |
| Gross mass | 1,085,410 kg | Wikipedia SLS — M |
| LH2 load | 144,000 kg | Wikipedia SLS — M |
| LOX load | 840,000 kg | Wikipedia SLS — M |
| Engines | 4 × RS-25 (RS-25D refurbished Shuttle engines on first four flights; RS-25E thereafter) | Wikipedia SLS — M |
| RS-25D thrust per engine | 2,188 kN → 2,281 kN (492,000 → 513,000 lbf) after refurbishment/uprating | Wikipedia SLS — M |
| RS-25E thrust per engine | 2,321 kN (522,000 lbf) | Wikipedia SLS — M |
| Stage thrust (4 engines) | 7.4 MN sea level; 9.1 MN vacuum | Wikipedia SLS — M |
| Isp | 366 s (3.59 km/s) sea level; 452 s (4.43 km/s) vacuum | Wikipedia SLS — M |
| Burn time | 480 s (Artemis II: "about 8 minutes") | Wikipedia SLS — M; [Wikipedia: Artemis II](https://en.wikipedia.org/wiki/Artemis_II) (accessed 2026-10-12) — M |
| Artemis III core: RS-25 serials | E2048, E2052, E2054, E2057 (all refurbished flight engines); upper section delivered to KSC 2026-04-28 | [Wikipedia: Artemis 3](https://en.wikipedia.org/wiki/Artemis_3) (accessed 2026-10-12, citing NASA May/June 2026) — M |

**Table 1.3 — Five-segment solid rocket boosters (2 per vehicle)**

| Parameter | Value | Source / confidence |
|---|---|---|
| Height / diameter | 54 m / 3.7 m | Wikipedia SLS — M |
| Gross mass (each) | 730,000 kg | Wikipedia SLS — M |
| Propellant mass (each) | **not stated in any fetched source** | gap |
| Thrust (each) | 14.6 MN sea level (3.28 Mlbf); 16 MN vacuum (3.6 Mlbf) | Wikipedia SLS — M |
| Thrust (pair) | 29.2 MN sea level; 32 MN vacuum | Wikipedia SLS — M |
| Isp | 269 s (2.64 km/s) | Wikipedia SLS — M |
| Burn time | 126 s | Wikipedia SLS — M |
| Propellant | APCP: aluminium / ammonium perchlorate / PBAN binder | Wikipedia SLS — M |
| Separation (Artemis II actual) | ≈5,000 km/h at ≈48 km altitude; boosters not recovered | Wikipedia Artemis II — M |
| BOLE (Block 2 booster) | ≈17 MN (3.9 Mlbf) each, ≈19 % more than 5-segment; carbon-fibre composite cases; new propellant formulation; June 2025 ground test had nozzle failure ≈15 s before end of burn; "in development with no production funding"; effectively removed from Artemis path after Block 2 cancellation | Wikipedia SLS — M; NASASpaceflight March 2026 — M |

**Table 1.4 — Upper stages**

| Parameter | ICPS (Block 1) | EUS (Block 1B/2, cancelled) | Centaur V (planned from Artemis V) | Source / confidence |
|---|---|---|---|---|
| Dry mass | 3,490 kg | 14,110 kg | n/s | Wikipedia SLS — M; Wikipedia EUS — M |
| Gross mass | 32,066 kg | n/s | n/s | Wikipedia SLS — M |
| Propellant | ≈28,576 kg (gross − dry, derived by me, L); LH2/LOX | 129,000 kg LH2/LOX (Wikipedia EUS infobox); a 2013 trade study used 105 t usable (Wikipedia SLS) — design grew | n/s | M; discrepancy noted |
| Engines | 1 × RL10B-2 (Artemis I); 1 × RL10C-2 (Artemis II, Artemis IV) | 4 × RL10C-3 (RL10C-X planned later) | n/s (ULA Centaur V normally 2 × RL10C-1-1 — UNVERIFIED, not in fetched sources) | Wikipedia SLS/EUS — M |
| Thrust | 110.1 kN (24,800 lbf) | 433.1 kN total (97,360 lbf) → ≈108 kN per engine (derived) | n/s | Wikipedia SLS — M; Wikipedia EUS — M |
| Isp (vacuum) | 465.5 s | 460.1 s | n/s | Wikipedia SLS — M; Wikipedia EUS — M |
| Burn time | 1,125 s | 1,275 s | n/s | M |
| Dimensions | n/s | 17.3 m tall; LH2 tank 8.4 m dia; LOX tank 5.5 m dia | n/s | Wikipedia EUS — M |
| Status | Flies on Artemis I, II, IV; **Artemis III flies with no ICPS — a non-propulsive spacer of identical dimensions/interfaces (NASA, 2026-05-13)** | Cancelled 2026-02-26; NASA cited Boeing performance "unsatisfactory" | Selected March 2026; sole-source intent; "alternatives fail to meet the performance requirements"; first flight expected Artemis V NET late 2028 | Wikipedia Artemis 3 — M; Wikipedia EUS — M; CRS IF11643 2026-06-25 — H; [AIAA, 2026-03-09 headline](https://aiaa.org/2026/03/09/nasa-taps-ulas-centaur-v-to-power-future-sls-upper-stage/) — L (headline only); Wikipedia SLS — M |
| EUS cost | ≈$2.0 B spent at cancellation (OIG; up from $962 M original estimate); OIG projected final up to $3.7 B; FY2025 spend plan cumulative $1.93 B; FY2027 request estimates total Block 1B development $3,904.7 M | | | Wikipedia EUS — M (citing OIG and NASA budget docs) |

**Table 1.5 — Launch history and cadence**

| Item | Value | Source / confidence |
|---|---|---|
| Artemis I | 2022-11-16 06:47 UTC, uncrewed, lunar DRO, success | Wikipedia SLS — M |
| Artemis II | 2026-04-01 22:35:12 UTC, crewed circumlunar free-return, success | Wikipedia Artemis II — M; CRS IF11643 — H |
| Artemis III | LEO docking test, "late 2027" (Ars Technica 2026-04-28 via Wikipedia) vs "mid-2027" (CRS 2026-06-25) — sources differ | M / H |
| Artemis IV | first crewed landing, early 2028 / "by 2028" | Wikipedia Artemis 3 — M; CRS — H |
| Artemis V | second landing, late 2028; first Centaur V flight | NASASpaceflight March 2026 — M; Wikipedia SLS — M |
| Planned cadence | ≈ one SLS every 10 months; ≥1 crewed landing/yr after 2028 | NASASpaceflight March 2026 — M; Isaacman at Senate hearing per [Sen. Britt release, 2026-04-29](https://www.britt.senate.gov/?p=12220) — H |

**Table 1.6 — Cost and contracts**

| Item | Value | Source / confidence |
|---|---|---|
| OIG recurring production cost per SLS | ≥ $2.5 B per launch (excl. development/integration), OIG Oct 2023 | Wikipedia SLS citing OIG — M |
| OIG per-launch breakdown (Nov 2021, Artemis I–IV) | SLS $2.2 B + Exploration Ground Systems $568 M + Orion $1.0 B + ESM $300 M (sum = $4.07 B ≈ the widely quoted "$4.1 B per launch") | Wikipedia SLS citing OIG IG-22-003 — M; sum derived by me — L |
| Administration statements | "$4 billion a launch" (Sean Duffy, 2025; FY2026 budget proposal) | Wikipedia SLS — M |
| Total SLS programme cost | $31.5–31.6 B nominal 2011–2025 ($38.7 B in 2026 dollars), excl. Orion | Wikipedia SLS — M |
| Aerojet Rocketdyne RS-25 | $1.79 B extension (2020-05-01) for 18 engines; total RS-25 contract ≈ $3.5 B | Wikipedia SLS — M |
| Northrop Grumman boosters | $3.2 B (2021) for boosters Artemis IV–VIII + BOLE design/test | Wikipedia SLS — M |
| Boeing core stage | development ≈ $8.9 B by 2021 (2× original); separate $2.8 B core-stage contract mentioned | Wikipedia SLS — M; Wikipedia EUS — M |
| ULA ICPS | $412 M | Wikipedia SLS — M |
| Exploration Ground Systems | ≈ $910 M (FY2025); $923 M FY2026 enacted | Wikipedia SLS — M; [CRS R43419, 2026-06-22](https://www.everycrsreport.com/files/2026-06-22_R43419_182a8c9a47655c34b71f5934236c537d444ae47a.html) — H |
| Mobile Launcher 2 | ≈90 % complete, ≈377 ft (≈115 m) tall, cost "exceeding $1 billion"; NASA "no longer planning to use" it; ML-1 supports all future missions with minor umbilical changes | NASASpaceflight March 2026 — M |
| Deep Space Transport LLC (Boeing + Northrop) | planned transfer of SLS operations; no value given | Wikipedia SLS — M |

### Inferences
- For a physics simulation of a *real* NASA vehicle, use Block 1: core gross 1,085 t (984 t propellant), 2 × 730 t SRBs, ICPS 32 t, Orion stack ≈33.4 t + adapters; the liftoff-mass check 1,085 + 2×730 + 32 + 33 ≈ 2,610 t matches the stated 2,610,000 kg within rounding (my arithmetic, L).
- Block 1B/2 performance numbers (42–46 t TLI) are paper values; nothing with EUS will fly. Any direct trans-Mars-injection scenario based on SLS must now assume Block 1 + Centaur V, whose performance is unpublished ("comparable or better translunar performance" per NASASpaceflight's reading of NASA statements).
- The 7.4 MN SL core thrust ÷ 4 = 1.85 MN per RS-25 at sea level, consistent with the 109 % power level (derived, L).

### Gaps
- No payload-vs-C3 curve values were retrievable. The document that contains them is the SLS Mission Planner's Guide (ESD 30000 Rev A, Dec 2018); the Creech 2019 deck only states the TLI point (C3 = −0.99 km²/s²) and "Block 2: Mars-enabling capability >45 t to TLI". The 2022 SLS Reference Guide PDF on nasa.gov failed to fetch.
- Five-segment SRB propellant mass and dry mass: not in any fetched source.
- RS-25 per-engine vacuum/sea-level thrust at 109 % vs 111 % and Isp split by variant: only stage-level numbers were retrievable.
- Centaur V specifications as adapted for SLS (propellant load, engine count, Isp, dry mass) and the resulting Block 1 + Centaur V TLI/C3 performance: not published in fetched sources; contract value not stated (NASASpaceflight linked sam.gov without a figure).
- OIG estimate for Mobile Launcher 2 total cost (often quoted as $2.7 B) was not confirmed in fetched sources — UNVERIFIED.
- Any SLS hardware/launch news dated July–October 2026 — none found; UNVERIFIED.

## Key Question 2 — Orion crew module + European Service Module

### Takeaway
Orion as flown on Artemis II is a 4-crew, 21-day (undocked) spacecraft with a ≈26.5 t CM+ESM launch mass (≈33.4 t with the LAS), 8.9 m³ habitable volume, an ESM carrying ≈8.6 t of MON-3/MMH giving up to ≈1,050 m/s post-separation ΔV, and an Avcoat heat shield that performed acceptably on Artemis II at ≈11 km/s using a steepened direct (non-skip) entry chosen because of the Artemis I char-loss finding; Artemis III gets a permeability-modified Avcoat shield.

### Cited Findings

**Table 2.1 — Masses, dimensions, volumes**

| Parameter | Value | Source / confidence |
|---|---|---|
| Total launch mass (CM + ESM + LAS) | 33,446 kg (73,735 lb) | [Wikipedia: Orion (spacecraft)](https://en.wikipedia.org/wiki/Orion_(spacecraft)) (accessed 2026-10-12) — M |
| Launch mass CM + ESM | 26,520 kg | Wikipedia Orion — M |
| Artemis II stated launch mass | 35,000 kg (78,000 lb) — conflicts with 33,446 kg above (different accounting or fuelled-state assumptions) | Wikipedia Artemis II — M; conflict noted |
| CM launch mass / dry mass | 10,400 kg / 9,300 kg (Artemis II landing mass also given as 9,300 kg) | Wikipedia Orion; Wikipedia Artemis II — M |
| CM + ESM dry mass | 15,483 kg | Wikipedia Orion — M |
| CM diameter / length | 5.03 m / 3.3 m | Wikipedia Orion — M |
| Pressurized volume | 19.56 m³ | Wikipedia Orion — M |
| Habitable volume | 8.9 m³ (≈2.25 m³ per crew member) | Wikipedia Orion — M |
| Crew capacity | 4 | Wikipedia Orion — M |
| Payload beyond crew | 100 kg | Wikipedia Orion — M |
| Mission duration | up to 21 days undocked (design life 21.1 d); up to 6 months docked | Wikipedia Orion — M |
| Post-separation mass (HLS interface document) | 26,375 kg | Wikipedia Orion — M |
| Post-separation ΔV | up to 1,050 m/s | Wikipedia Orion — M |
| Power | 11 kW (Orion page); 11.2 kW (ESM page table) | M |

**Table 2.2 — European Service Module (Airbus)**

| Parameter | Value | Source / confidence |
|---|---|---|
| Dry mass | 6,185 kg | [Wikipedia: European Service Module](https://en.wikipedia.org/wiki/European_Service_Module) (accessed 2026-10-12) — M |
| Usable propellant / tank capacity | 8,600 kg / 9,000 kg; MON-3 / MMH | Wikipedia ESM — M |
| Wet mass | 15,461 kg (infobox) vs 13,500 kg ("Lunar Mission" spec table) — internal conflict | Wikipedia ESM — M, conflict noted |
| Length / diameter | 4 m / 4.1 m (5.2 m with arrays stowed) | Wikipedia ESM — M |
| Main engine | AJ10 (Shuttle OMS heritage), 26.6 kN; Isp not stated | Wikipedia ESM — M |
| Auxiliary engines | 8 × R-4D, 490 N each (3.92 kN total) | Wikipedia ESM — M |
| RCS | 24 × 220 N (5.28 kN total) | Wikipedia ESM — M |
| Solar arrays | 4 wings × 7.375 m, 19 m span, 11.2 kW | Wikipedia ESM — M |
| Consumables carried | water 240 kg (4 tanks); O2 90 kg (3 tanks); N2 30 kg (1 tank) | Wikipedia ESM — M |
| Contracts | €390 M fixed-price for ESM-1 (signed 2014-11-17); second module €200 M (Feb 2017; a cited title says €100 M — conflict); 6 built, 2 on order, ESM-7/8 under negotiation | Wikipedia ESM — M |
| Artemis II anomaly | helium leak across valves in the oxidizer-side pressurization circuit; rate higher than expected; no propellant loss; valve redesign "likely" | Wikipedia ESM — M; Wikipedia Artemis II (flight day 8) — M |
| Artemis II TLI burn | 5 min 49 s AJ10 burn on flight day 2 (the only main-engine burn); return corrections 15 s / 9 s / 8 s | Wikipedia Artemis II — M |

**Table 2.3 — Heat shield, entry, abort system**

| Item | Value | Source / confidence |
|---|---|---|
| Heat shield material | Avcoat (ablator) | Wikipedia Artemis II — M |
| Artemis I finding (Nov 2022 flight) | unexpected Avcoat char loss; cause: hot gases trapped inside the material causing spalling and cracking (NASA root-cause announcement Dec 2024 — the NASA release itself failed to fetch; summarized via Wikipedia) | Wikipedia Artemis II — M |
| Artemis II decision | kept the existing shield; replaced the planned skip re-entry with a steeper direct entry to limit time at heating; analysis showed structure intact even under more extensive damage; Administrator Isaacman endorsed flying it (Jan 2026) | Wikipedia Artemis II — M |
| Artemis II entry velocity | ≈39,693 km/h ≈ 11.0 km/s (below the ≈25,000 mph initially expected) | Wikipedia Artemis II — M |
| Artemis III | Avcoat permeability design changes / "upgraded heat shield" | Wikipedia Artemis II; Wikipedia Artemis 3 — M |
| Orion median shielding (radiation) | 32 g/cm² | [NASA OCHMO Technical Brief OCHMO-TB-020 Rev G, 2025-06-06](https://www.nasa.gov/sites/default/files/atoms/files/radiation_protection_technical_brief_ochmo.pdf) — H |
| DRA-era Orion Earth-return design entry speed (Mars return) | 12 km/s | [NASA JSC DRA 5.0 slides, 2009-01-15](https://ntrs.nasa.gov/api/citations/20090012109/downloads/20090012109.pdf) — H |
| Launch Abort System | abort motor 2,200 kN (500,000 lbf) per the 2008 test description on Wikipedia; abort-motor contract $62.5 M (2007) | Wikipedia Orion — M (the commonly quoted 400,000 lbf / LAS mass ≈7 t could not be confirmed — UNVERIFIED) |

**Table 2.4 — Orion cost**

| Item | Value | Source / confidence |
|---|---|---|
| NASA Orion development FY2006–2025 | $25.6 B nominal ($33.6 B in 2026 dollars) | Wikipedia Orion — M |
| Lockheed Martin OPOC (2019) | $900 M first three capsules; $633 M next three | Wikipedia Orion — M |
| Orion per flight (OIG Nov 2021) | $1.0 B + $300 M ESM | Wikipedia SLS citing OIG — M |
| FY2026 enacted / FY2027 request | $1,421 M / $1,222 M | CRS R43419 2026-06-22 — H |

### Inferences
- With ESM usable propellant 8,600 kg and CM+ESM 26,520 kg, a simple Tsiolkovsky check with a typical AJ10 Isp of ~316 s gives ≈1,200 m/s total ΔV from launch mass; the NASA-quoted 1,050 m/s "post-separation" is consistent after reserves and RCS allocations (my calculation with an assumed Isp — L; the Isp itself is not in fetched sources).
- The Artemis II helium leak and the Artemis I char loss are both "fly-as-is with mitigation" cases; the Artemis III heat shield is the first hardware change.

### Gaps
- AJ10 Isp, ESM total ΔV as designed, LAS total mass, attitude-control/jettison motor thrusts, Avcoat block count/thickness: not in fetched sources.
- Quantitative Artemis II heat-shield post-flight inspection results (char-loss depth, comparison with Artemis I): not found in fetched sources — UNVERIFIED (a 2026-04-13 blog claimed "post-mission vindication" but was not fetched).
- Orion ECLSS detail (amine swingbed capacity, CO2 removal rate) not retrieved.

## Key Question 3 — Artemis status, Block 1B/ML-2 schedule, contracts, cost, and what the FY2026 budget/Congress did

### Takeaway
Artemis II flew successfully (2026-04-01 → 2026-04-11, 4 crew, free-return flyby, 406,771 km from Earth record). The FY2026 President's request (May 2025) tried to end SLS/Orion after Artemis III and cancel Gateway; Congress refused in the July 2025 reconciliation law ($4.1 B SLS for Artemis IV–V, $2.6 B Gateway) and in the FY2026 appropriation (P.L. 119-74, Jan 2026), but NASA itself then re-planned in Feb–Mar 2026: Artemis III becomes a LEO docking test (late 2027), Artemis IV the first landing (2028), Block 1B/EUS/Block 2/ML-2 are cancelled, Centaur V replaces ICPS from Artemis V, and Gateway is effectively ended (HALO stop-work June 2026). The FY2027 request (Apr 2026) proposes commercial replacement of SLS after Artemis V, which the Administrator publicly declines to call a "transition".

### Cited Findings

**Table 3.1 — Artemis II (flown)**

| Item | Value | Source / confidence |
|---|---|---|
| Launch | 2026-04-01 22:35:12 UTC, LC-39B KSC, SLS Block 1 (ICPS with RL10C-2) | Wikipedia Artemis II; Wikipedia SLS — M |
| Crew | Reid Wiseman (CDR), Victor Glover (PLT), Christina Koch (MS), Jeremy Hansen (CSA, MS); backups Andre Douglas, Jenni Gibbons | Wikipedia Artemis II — M |
| Spacecraft | Orion CM-003 "Integrity" + ESM-2 | Wikipedia Artemis II — M |
| Duration | 9 d 1 h 32 min 15 s | Wikipedia Artemis II — M |
| Distance travelled | 1,126,922 km | Wikipedia Artemis II — M |
| Trajectory | 2 Earth orbits; TLI 2026-04-02 (5 min 49 s AJ10 burn) to free-return; 1 of 3 planned outbound corrections executed (17.5 s, FD5); lunar closest approach 6,545 km from far-side surface at 23:00 UTC 2026-04-06; max Earth distance 406,771 km at 23:02 UTC 2026-04-06 (beat Apollo 13's 400,171 km); ≈40 min comm blackout; 57 min solar eclipse | Wikipedia Artemis II — M |
| Entry / splashdown | direct steep entry at ≈39,693 km/h (11.0 km/s); splashdown 2026-04-11 00:07:27 UTC at 32.3° N 117.8° W, SW of San Diego; recovered by USS John P. Murtha | Wikipedia Artemis II — M |
| Anomalies | FD3 urine frozen in toilet vent lines (resolved by heaters/sun); minor toilet and water-dispenser issues; FD8 small ESM helium leak → manual-control test and radiation-shielding demo cancelled; post-splashdown comms issue delayed recovery approach; 3 of 4 CubeSats lost (only SHAMS raised orbit) | Wikipedia Artemis II — M |
| Pre-launch slips | Dec 2024: April 2026 target; 2025: worked toward Feb 2026 (window from 2026-02-05); Jan 2026 winter storm; 2026-02-02 WDR LH2 leak → March; 2026-02-19 WDR success; 2026-02-21 ICPS helium flow issue → rollback (from 2026-02-25) → April; FRR 2026-03-12; rollout 2026-03-20 | Wikipedia Artemis II — M; NASASpaceflight March 2026 — M |

**Table 3.2 — Artemis III / IV / V plan after the Feb 2026 re-plan**

| Item | Value | Source / confidence |
|---|---|---|
| Announcement | NASA revised flight sequence announced 2026-02-27 (Isaacman posts 2026-02-27 and 2026-03-03; EUS/Block 1B/Block 2 cancelled 2026-02-26); Isaacman called prior architecture "not a path to success" | Wikipedia Artemis 3 — M; NASASpaceflight March 2026 — M; Wikipedia EUS — M |
| Artemis III profile | crewed LEO demo (Apollo 9 analogue): Blue Origin test vehicle (Blue Moon "Mark 1.5" with Mark 2 crew module, storable propellants; up to 90 d in orbit) launches first; Orion (4 crew) launches on SLS from LC-39B, ESM circularizes at ≈430 km (230 nmi); dock ≈2 d with Blue Origin vehicle (AxEMU suit interface tests); third launch: SpaceX Starship v3 test article with docking mechanism, no crew cabin, no operational life support; dock ≈1 d; ≈2 weeks total; upgraded heat shield; splashdown off San Diego; LEO chosen over HEO to keep the ICPS for Artemis IV | Wikipedia Artemis 3 (citing NASA 2026-06-09, Ars Technica 2026-06-09/10) — M |
| Artemis III date | "late 2027" (Ars 2026-04-28) vs "mid-2027" (CRS 2026-06-25) | M / H — conflict noted |
| Artemis III crew (named 2026-06-09) | Randy Bresnik (CDR), Luca Parmitano (ESA, PLT), Frank Rubio, Andre Douglas (MS); backup Bob Hines | Wikipedia Artemis 3 — M |
| Artemis III hardware status (≤ June 2026) | core stage upper section delivered KSC 2026-04-28; engines due from Stennis NLT July 2026; booster segments arriving June 2026; Orion production internal readiness Jan 2028 (early-2026 assessment) with acceleration measures; ESM-3 delivered Aug/Sept 2024 | Wikipedia Artemis 3 — M |
| Artemis IV | first crewed lunar landing, early 2028 ("by 2028") | Wikipedia Artemis 3 — M; CRS IF11643 — H |
| Artemis V | second landing later 2028 + initial outpost; first Centaur V flight | NASASpaceflight March 2026 — M; Wikipedia SLS — M |
| HLS status | SpaceX Starship and Blue Origin Blue Moon both in development, neither human-rated; OIG March 2026 report: schedule delays/technical challenges threaten a 2028 landing; ASAP: complexity "casts doubt" on timeline; a Blue Origin rocket exploded in May 2026 raising concerns for Artemis III/CLPS | CRS IF11643 2026-06-25 — H |
| Gateway | omitted from Feb 2026 announcement; "effectively ended" March 2026 to focus on a lunar surface base (Wikipedia); CRS (June 2026): NASA intends to "pause" Gateway; Northrop Grumman HALO stop-work 2026-06-18; HALO spend ≈$1.9 B vs $1.3 B contract (OIG); corrosion found in HALO and I-HAB after April 2025 US delivery — OIG said delivery would slip from Oct 2026 to July 2031; PPE (Maxar) and HALO were in production late 2025; ESA/JAXA/CSA adaptation unresolved | [Wikipedia: HALO](https://en.wikipedia.org/wiki/Habitation_and_Logistics_Outpost) (accessed 2026-10-12) — M; CRS IF11643 — H; NASASpaceflight March 2026 — M |
| Block 1B / EUS / Block 2 / BOLE / ML-2 | all cancelled or abandoned Feb 2026 (see Tables 1.4, 1.6) | M/H |

**Table 3.3 — Budget: FY2026 request vs reconciliation vs FY2026 enacted vs FY2027 request ($ million)**

| Line | FY2025 enacted | FY2026 request (May 2025) | FY2026 enacted (P.L. 119-74) | FY2027 request (Apr 2026) | Source / confidence |
|---|---|---|---|---|---|
| NASA total | 24,838 (SPO) / 25,382 (CRS Table 1) | 18,809 (−24.3 %) | 24,438 (28,448 incl. reconciliation funds) | 18,829 | CRS R43419 2026-06-22 — H; [SpacePolicyOnline 2026-01-05](https://spacepolicyonline.com/?p=85928) — M |
| Science | 7,334 | 3,908 (−47 %) | 7,250 | 3,894 | CRS R43419 — H |
| Exploration | 15,086 (incl. reconciliation) | 8,313 | 7,783 | 8,514 (+731 vs FY2026) | CRS R43419 — H; CRS IF11643 — H |
| SLS | 2,502 | 2,001 | 1,308 | 1,495 | CRS R43419 — H |
| Orion | 1,431 | 1,371 | 1,421 | 1,222 | CRS R43419 — H |
| Exploration Ground Systems | 910 | 658 | 923 | 758 | CRS R43419 — H |
| Moon to Mars System Development (incl. Gateway; formerly Artemis Campaign Development) | n/s | 2,815 | n/s | 3,810 | CRS R43419 — H |
| Commercial Moon and Mars Infrastructure Development (new account; CLPS moved here) | n/a | 864 | n/s | 744 | CRS R43419 — H |
| Moon to Mars Transportation System | n/s | 4,895 | n/s | 4,219 | CRS R43419 — H |
| Space Technology | 1,100 | 569 | 921 | 624 | CRS R43419 — H |
| Space Operations | 5,795 | 3,132 | 4,175 | 3,047 | CRS R43419 — H |
| Fission Surface Power | — | — | 250 | — | SpacePolicyOnline 2026-01-05 — M |
| Nuclear thermal propulsion | — | 0 (DRACO/NTP/NEP zeroed) | "no less than $110 M" | — | Wikipedia DRACO — M; Sen. Britt release 2026-04-29 — H |
| Mars Future Missions | — | — | 110 | — | SpacePolicyOnline — M |
| Mars Sample Return | — | 0 | 0 (House's $300 M not included) | — | SpacePolicyOnline — M |
| Commercial Mars Payload Services | — | 200 | n/s | — | [The Space Review, Aug 2025](https://thespacereview.com/article/5045/1) — M |
| Commercial LEO Destinations | — | — | 273 | — | SpacePolicyOnline — M |
| ISS | — | — | 1,240 (1,490 incl. reconciliation) | — | SpacePolicyOnline — M |

**Table 3.4 — Policy content of each budget action**

| Action | Date | Content | Source / confidence |
|---|---|---|---|
| FY2026 "skinny" request | 2025-05-02 | proposed $531 M cut to Space Technology citing advanced propulsion; proposed ending SLS and Orion after Artemis III | Wikipedia DRACO — M; Wikipedia Artemis 3 — M |
| FY2026 full request | 2025-05-30 | confirmed DRACO cancellation, no NTP/NEP funding; Gateway cancellation proposed; "$4 billion per launch" rationale; $200 M CMPS; $1 B "private-sector-led Mars exploration" (Bloomberg headline) | Wikipedia DRACO — M; Wikipedia SLS — M; Space Review Aug 2025 — M; [Bloomberg 2025-05-30 headline](https://www.bloomberg.com/news/articles/2025-05-30/trump-wants-1-billion-for-private-sector-led-mars-exploration) — L (headline only) |
| Reconciliation law P.L. 119-21 (One Big Beautiful Bill Act; Isaacman calls it the "Working Families Tax Cuts Act") | signed 2025-07-04 | ≈$9,995 M for NASA available through FY2032 ($575 M FY2025 BA, ≈$4.01 B FY2026, $5.41 B later years); SLS $4.1 B total = $1.025 B/yr FY2026–FY2029 for Artemis IV & V rockets; Orion $20 M (FY2026); Gateway $2.6 B (SPO: $750 M/yr for three years from FY2026; CRS: $1.1 B Gateway within $1.8 B M2M System Development in FY2026 — figures differ, conflict noted); Mars Telecommunications Orbiter $700 M (competition, fixed-price); ISS $1.25 B (≥$250 M/yr FY2025–29); construction $915 M FY2026; CRS IF11643 summarizes as "$6.7 B for Orion, Gateway, and SLS" | CRS R43419 — H; CRS IF11643 — H; SpacePolicyOnline — M; Wikipedia SLS — M; Space Review — M |
| FY2026 appropriation P.L. 119-74 (CJS/Energy-Water/Interior minibus) | conference report released 2026-01-05; explanatory statement Cong. Record 2026-01-08; enactment Jan 2026 (exact signing date not captured) | NASA $24,438 M; rejects termination of SLS/Orion after Artemis III; directs that any future Artemis launch competition include an SLS-based option; Science kept ≈$7.25 B | SpacePolicyOnline 2026-01-05 — M; CRS R43419 — H; [The Register 2026-01-06 headline](https://www.theregister.com/2026/01/06/nasa_science_budget_boost/) — L |
| NASA re-plan | 2026-02-26/27 and March 2026 | see Table 3.2 | M/H |
| FY2027 request | ≈2026-04-03 (released); hearings April 2026 | NASA $18,829 M; Artemis systems $8.5 B (+$731 M); proposes replacing SLS with commercial transportation after Artemis V; SLS $1,495 M, Orion $1,222 M; Block 1B development total estimate $3,904.7 M | CRS IF11643 — H; CRS R43419 — H; Wikipedia EUS — M; [Payload headline "White House requests $18.8B FY27"](https://payloadspace.com/white-house-requests-18-8b-fy27-budget-for-nasa) — L |
| Senate CJS hearing | release dated 2026-04-29 | Isaacman: reconciliation funds keep NASA "committed to SLS through Artemis V"; most of the $10 B went to SLS-related exploration; "I'm not trying to make a transition. I expect SLS to be one of those two pathways"; "commercial" = less NASA oversight on suppliers; NTP: Congress's "no less than $110 M" will be implemented — "No question", "very, very much a fan" | Sen. Britt release 2026-04-29 — H |
| Oversight | 2025–2026 | GAO 2025: $6.8 B overruns across three major Artemis projects; OIG March 2026 HLS report; ASAP doubts on landing timeline | CRS IF11643 — H |

### Inferences
- "Is SLS still alive?" Yes, through at least Artemis V (late 2028) with money already appropriated by P.L. 119-21 (mandatory $1.025 B/yr FY2026–29), but in a frozen Block 1-class configuration; its post-Artemis-V future is contested between the FY2027 request (commercial replacement) and the FY2026 appropriations language (SLS-based option must be in any competition).
- The combination of the FY2026 enacted SLS line ($1,308 M) + reconciliation ($1,025 M) ≈ $2.33 B/yr is roughly the OIG's ≥$2.5 B recurring production cost, consistent with a ~1-per-10-month cadence only if costs fall as NASA claims (my inference, L).
- Gateway's status is semantically "paused" in NASA's words but operationally terminated (stop-work on HALO, no delivery flights); the 2024–25 ADD Rev C still lists Gateway elements because it was released 2025-12-12, before the re-plan.

### Gaps
- Whether FY2027 appropriations were enacted by 2026-10-12 and what they did to the "commercial after Artemis V" proposal — no source found; UNVERIFIED.
- Any Artemis III/IV schedule change announced July–October 2026 — none found; UNVERIFIED.
- Final disposition of ML-2, BOLE hardware, EUS hardware, and the built HALO/PPE — all described as "in limbo"/"mothballing" as of March–June 2026; no later source.
- The exact signing date of P.L. 119-74 and the per-program FY2026 appropriation for Gateway/HLS were not in fetched sources.
- Contract modifications to Boeing (core stage/EUS termination costs), Northrop (BOLE), Bechtel (ML-2): not found.

## Key Question 4 — NASA crewed-Mars architecture: DRA 5.0 numbers, Moon-to-Mars ADD, Transit Habitat, 2025–26 Mars planning, DRACO/NTP/NEP

### Takeaway
DRA 5.0 (2009) remains the only fully-numbered NASA Mars reference: 6 crew, conjunction class (~180 d transits, ~500–540 d surface, ~900 d total), three NTR vehicles (crew MTV 356.4 t + 2 cargo at 246.2 t ≈ 849 t IMLEO) on 7 Ares V launches, 3 × 111 kN NTR engines at Isp 875–950 s, ~40 t landed per 10 m × 30 m aeroshell. NASA's current Moon-to-Mars ADD Rev C (Dec 2025) deliberately gives no Mars numbers ("forward work"), DRACO was cancelled in mid-2025 with the FY2026 request zeroing NTP/NEP, and Congress then restored "no less than $110 M" for NTP in FY2026; no NASA crewed-Mars date or mass budget newer than DRA 5.0 was found.

### Cited Findings

**Table 4.1 — DRA 5.0 mission design (NASA-SP-2009-566, July 2009, and its 2009 summary products)**

| Parameter | Value | Source / confidence |
|---|---|---|
| Crew | 6 | [NASA-SP-2009-566, DRA 5.0, July 2009](https://www.nasa.gov/wp-content/uploads/2015/09/373665main_nasa-sp-2009-566.pdf) §2 — H |
| Campaign | 3 consecutive conjunction-class (long-stay) missions over ≈10 years | DRA 5.0 §2 — H |
| Outbound transit | 175–225 d (≈180 d typical) | DRA 5.0 §2 — H |
| Surface stay | ≈18 months (≈500 d; example 539 d) | DRA 5.0 §2, §4.1 — H |
| Example 2037 crew mission | 174 d out, 201 d back, 539 d at Mars, 914 d total | DRA 5.0 Fig 4-1/4-2 — H |
| Cargo transit | ≈350 d (Fig 2-2); 202 d (2035 opportunity) | DRA 5.0 — H |
| Launch opportunities | ≈2.1 yr spacing, 15-yr synodic cycle; departures 2030–2046 analysed | DRA 5.0 §4.1 — H |
| Departure orbit / Mars orbit | 407 km circular / 250 km × 33,793 km (1-sol) | DRA 5.0 §4.1 — H; DRA slides 2009-01-15 — H |
| Pre-deploy | DAV and SHAB launched one opportunity (~26 months) ahead; SHAB waits in Mars orbit | DRA 5.0 §2 — H |
| Launches | ≥7 Ares V cargo launches (Fig 2-2: 4 + 3) at 30-day centres + 1 Ares I crew launch; Borowski: 4 cargo HLV over 90 d + 3 crew HLV over 60 d | DRA 5.0 §2 — H; [Borowski et al., NTP growth technology, ~2011–12](https://ntrs.nasa.gov/api/citations/20120003776/downloads/20120003776.pdf) — H |
| Ares V | GLOW ≈3,323 t; 110.3 m tall; shroud 8.4–12 m dia × 12–35 m; dual-use shroud 10 m × 30 m (≈40 t structural aeroshell); payload to 407 km: 126.5 t (dual-use) / 120.0 t (standard) [Fig 4-4]; slides: 130.8 t (jettison shroud) / 83.6 t (dual-use incl. 50 t shroud); HLV ≈139–140 t for a 10 m NTR stage (Borowski) | DRA 5.0 §4.2 — H; DRA slides — H; Borowski — H (figures differ by study iteration) |
| Landed payload target | 30–50 t; descent stage sized for ≈40 t | DRA 5.0 §4 — H; DRA slides — H |
| Surface power | 30 kWe fission (derived from a 40 kWe lunar design) | DRA slides — H; [Drake/Hoffman/Beaty DRA 5.0 summary paper](https://ntrs.nasa.gov/api/citations/20090040343/downloads/20090040343.pdf) — H |
| ISRU | 24 t O2 for ascent; 2 t O2 + 3.5 t water for life support | DRA slides — H |
| Descent propulsion | 4 × LOX/LCH4 engines, Isp 369 s | Drake et al. summary — H |
| Comms | Earth–Mars max ≈4.0 × 10⁸ km; round-trip light time ≤44 min | DRA 5.0 §2.2 — H |
| Earth return entry speed (Orion) | 12 km/s; ≈300 m/s for retargeting/corridor | DRA slides — H |

**Table 4.2 — DRA 5.0 element masses (three NASA sources; values differ by iteration — all quoted)**

| Element | Jan 2009 slides | Drake/Hoffman/Beaty summary paper | Borowski (~2011–12, "Copernicus" DRA 5.0 design) | Source / confidence |
|---|---|---|---|---|
| Crew MTV total (IMLEO) | 283.4 t (TransHab 41.3 t + Orion 10.0 t) | 356.4 t, 96.7 m long: core stage 106.2 t; in-line tank 91.4 t; saddle truss + drop tank 96 t; payload 62.8 t | ≈336.5 t: propulsion module ≈138.1 t; saddle truss + drop tank 133.4 t; crew payload ≈65 t | slides — H; summary — H; Borowski §5 — H |
| Cargo NTR vehicle (each, ×2) | 238.1 t | 246.2 t, 72.6 m long: payload 103 t (aeroshell + EDL + descent stage + surface payload); NTR stage 96.6 t; short in-line tank 46.6 t (34.1 t LH2); RCS 5.2 t | — | slides — H; summary — H |
| Transit Habitat | 41.3 t | — | 22.7–27.5 t minus consumables (Table 1); ≈27.5 t with primary PVAs; consumables ≈5.37 t (~1 yr, 6 crew) | slides — H; Borowski — H |
| DAV lander / with aeroshell (entry mass) | 63.7 t / 106.6 t | — | — | slides — H |
| SHAB lander / with aeroshell | 64.2 t / 107.0 t; surface hab ("commuter") ≈21.5 t, 12.1 kWe | — | — | slides — H; summary — H |
| Orion CM / SM assumption | 10.0 t | 10 t + 4 t SM | CEV/SM 10.0 t | H |
| LH2 totals | — | 191.7 t round trip; ≈91 t for cargo TMI | PM tank capacity 87.2 t; drop tank 102.4 t | H |
| Burn times (crew NTR) | — | TMI 57.8 min; MOI 16 min; TEI 10.7 min (84.5 min total) | — | summary — H |

**Table 4.3 — NTR engine and stage characteristics (DRA 5.0 / Borowski)**

| Parameter | Value | Source / confidence |
|---|---|---|
| Engine | Pewee-class, 25 klbf = 111.2 kN each, 3 per stage | DRA 5.0 slides — H; Borowski §1–5 — H |
| Isp | 875–950 s (DRA 5.0); ≈906 s at Tex ≈2,790 K; up to ≈941 s at 2,940 K (Borowski Table 2); slides: ≈900 s | DRA 5.0 §4.3 — H; Borowski — H |
| Chamber pressure / area ratio | 6.9 MPa (1,000 psi) / 300:1 | Borowski Table 2 — H |
| Reactor thermal power | ≈503 MWt (Pewee full-power test) | Borowski §2 — H |
| Engine T/W | ≈3.50 (→ ≈3.2 t per engine, derived, L) | Borowski §2 — H |
| LH2 flow | ≈12.5 kg/s at 906 s | Borowski §2 — H |
| Engine length / nozzle exit dia | ≈7.01 m (incl. 2.16 m extension) / ≈1.87 m | Borowski §2 — H |
| Propulsion module LH2 tank | 10 m dia × 19.7 m, Al-Li, 87.2 t capacity; +7.3 t radiation shield (crew) | Borowski §5 — H |
| In-line drop tank | ≈22.7 m long, ≈22 t, 102.4 t LH2; saddle truss ≈27.7 m, ≈9 t | Borowski §5 — H |
| Insulation / ZBO | 1" SOFI (0.78 kg/m²) + 60-layer MLI (0.90 kg/m²); ZBO Brayton cryocooler 930 kg, 8.87 kWe; LEO heat leak ≈78 W; margins 3 % cooldown, 1 % ΔV reserve, 2 % residuals | Borowski Table 2, §5 — H |
| ΔV examples | 2031 ERV: C3 10.794 km²/s², TMI 3.662 km/s, Vinf 3.480 km/s, MOC 1.341 km/s, TEI 3.12 km/s (326 d) / 3.08 km/s (357 d); 2033 crewed opposition: TMI 3.83 km/s (159 d) or 3.56 km/s (183 d), MOC 1.53 / 1.47 km/s; DRA 5.0 (conjunction) TEI ≈1.56 km/s; auxiliary: LEO R&D 100 m/s, attitude 15 m/s, MCC 50 m/s, Mars orbit maint. 100 m/s | Borowski Table 1, §6 — H |

**Table 4.4 — Moon to Mars Architecture Definition Document and Mars Transit Habitat concepts**

| Item | Value | Source / confidence |
|---|---|---|
| ADD Revision C | NASA/TM-20250010956, release 2025-12-12 (file dated 2026-01-15); "not a budget request"; Humans to Mars segment "will establish a human presence on Mars" — element mapping "forward work", reference missions "future work"; Rev C added lunar utility rover and lunar fission system elements; still lists SLS and Gateway (NRHO outpost) in lunar segments | [NASA ADD Rev C](https://ntrs.nasa.gov/api/citations/20250010956/downloads/ADD%20Revision%20C%20-%2020260115.pdf) — H (first 100k characters only) |
| 2025 Architecture update | PDF exists (Dec 2025) — not fetched | [nasa.gov 2025 update](https://www.nasa.gov/wp-content/uploads/2025/12/2025-architecture-update-for-publication.pdf) — L |
| Modular Mars Transit Habitat (Smitherman & Schnell, MSFC, ~2019) | 4 crew; 1,200 d baseline (1,043–1,047 d variants); MIG baseline ≈55.5 t → ≈45 t target via 10 t reduction (hybrid SEP limit); Bigelow ≈58 t; Sierra Nevada LIFE ≈61 t (≈8 m inflated); Boeing/LM ≈76.7 t; Northrop ≈81.4 t; pressurized volumes 317–384 m³ (≈79 m³/crew for baseline); 300–500 d logistics aboard; radiation protection by logistics packaging around crew quarters; 30-day safe haven | [NTRS 20200002332](https://ntrs.nasa.gov/api/citations/20200002332/downloads/20200002332.pdf) — H |
| DRA-era TransHab | 22.7–27.5 t minus consumables; 41.3 t (2009 slides) | Borowski — H; DRA slides — H |

**Table 4.5 — DRACO / nuclear propulsion and 2025–26 Mars planning**

| Item | Value | Source / confidence |
|---|---|---|
| DRACO origin | Apr 2021 DARPA Phase 1 (General Atomics $22 M reactor; Blue Origin $2.5 M, Lockheed $2.9 M vehicles); Jan 2023 NASA–DARPA partnership, $499 M Phases 2–3; 2023-07-26 Lockheed Martin + BWXT award | [Wikipedia: DRACO](https://en.wikipedia.org/wiki/Demonstration_Rocket_for_Agile_Cislunar_Operations) (accessed 2026-10-12) — M |
| DRACO design | Isp goal >800 s (≈350 s above RL10); HALEU ≈20 % U-235 (DOE-supplied); LH2 heated 20 K → ≈2,700 K in <1 s; 700–2,000 km demo orbit; launch target 2027 on Falcon 9 or Vulcan; thrust not released | Wikipedia DRACO — M |
| DRACO end | Jan 2025: 2027 launch on indefinite hold (reactor-test and design issues); 2025-05-02 skinny budget −$531 M STMD; 2025-05-30 PBR: cancellation confirmed, zero NTP/NEP; late June 2025 DARPA (Rob McHenry): costs no longer match benefits given SpaceX/Starship launch-cost drop; DARPA transferred knowledge to NASA; DARPA FY2026 budget has no NTP/NEP | Wikipedia DRACO — M; [Breaking Defense, June 2025 headline](https://breakingdefense.com/2025/06/darpas-draco-nuclear-propulsion-project-roars-no-more/) — L |
| Congressional NTP restoration | FY2026 CJS act: "no less than $110 M for nuclear thermal propulsion" (largely Marshall); Isaacman commits to implement ("No question") | Sen. Britt release 2026-04-29 — H |
| Fission Surface Power | $250 M FY2026 | SpacePolicyOnline — M |
| "Space Reactor-1 Freedom" | described in 2026 as DRACO's spiritual successor | Wikipedia DRACO — L/UNVERIFIED |
| Commercial Mars Payload Services | $200 M in FY2026 request to mature commercial robotic Mars lander concepts; Mars windows ≈26 months apart vs CLPS 2 task orders/yr; NASA's Nicky Fox: no "huge commercial interest" in Mars near-term | Space Review, Aug 2025 — M |
| Mars Telecommunications Orbiter | $700 M via P.L. 119-21, competition + fixed-price | Space Review — M; CRS R43419 — H |
| Starship to Mars | SpaceX discussed late-2026 window; Musk: "slight chance", first uncrewed more likely end-2028 window; previous three flights ended in mission-ending malfunctions; upper stage lost June 2025 in static-fire prep; ASI–SpaceX payload agreement 2025-08-07 (radiation sensor, plant growth, weather station) | Space Review, Aug 2025 — M |
| "Mars mission in 2028" | Isaacman said NASA "could tackle a new Mars mission in 2028" (Science interview headline) | [EBSCO/Science abstract](https://www.ebsco.com/articles/business-and-management/85ae2604-3b52-582a-abc9-b8c99d3c549b/nasa-administrator-talks-to-science-about-studying-the-moon-mars-and-earth-jared-isaacman-says-agency-may-accelerate-lunar-science-program-and-could-tackle-a-new-mars-mission-in-2028) — L (abstract only) |

### Inferences
- Summing the Drake/Hoffman/Beaty per-vehicle masses (356.4 + 2 × 246.2 = 848.8 t) reproduces the commonly quoted ≈849 t DRA 5.0 NTR IMLEO; the 2009 slides' set (283.4 + 2 × 238.1 = 759.6 t) is an earlier iteration. The total IMLEO figure itself was not found stated in any fetched document (derived, L).
- 7 launches × ≈126–140 t ≈ 880–980 t of lift vs ≈849 t IMLEO leaves ~4–15 % margin — consistent with the "7-launch" sizing (L).
- The ~25 t "Transit Habitat target" in the task brief matches the DRA-era TransHab (22.7–27.5 t minus consumables, Borowski); the later MSFC/AES concepts are 45–80 t for 4 crew and 1,100–1,200 d, i.e. NASA's habitat mass estimates roughly doubled between 2009 and 2019.
- As of October 2026, NASA has no published, numbered crewed-Mars architecture newer than DRA 5.0; the Moon-to-Mars ADD explicitly defers it, and the FY2026/27 Mars money is robotic/commercial (telecom orbiter, CMPS) rather than human-transport hardware.

### Gaps
- DRA 5.0 chemical/aerocapture-option IMLEO (often quoted ≈1,250 t), DAV/MAV propellant masses and MAV dry mass, surface-element power/thermal detail: the nasa.gov PDF text ended at §4.3 (126k characters) and the Addendum was not reachable — UNVERIFIED beyond what the slides/summary give.
- DRA 5.0 explicit TMI/MOI/TEI ΔV for the conjunction reference (only Borowski's opposition/ERV examples and the ≈1.56 km/s TEI were retrievable).
- The AES "Mars Transit Habitat Refinement Point of Departure Design" (Simon et al., 2017) subsystem mass breakdown: not fetched.
- Any NASA "Mars 2030s" human-mission plan, date, or mass budget issued 2025–2026: none found; the Bloomberg "$1 billion for private-sector-led Mars exploration" item is a headline only.
- NEP (nuclear electric propulsion) plans after 2025: zero in FY2026 request; no FY2026 enacted line found other than the NTP $110 M and FSP $250 M.
- Whether any SpaceX Starship flew toward Mars in the Nov–Dec 2026 window: beyond cutoff of sources; UNVERIFIED.

## Key Question 5 — Life-support consumables, radiation limits/doses, countermeasures, Transit Habitat targets

### Takeaway
NASA's current per-crew-day mass balance (ICES-2019-126, used alongside the BVAD) is ≈0.89 kg O2 in, 1.08 kg CO2 out, ≈1.76 kg food consumed (2.39 kg delivered), ≈2.8–3.3 kg water drunk/rehydrated, ≈12.8 MJ metabolic heat; the career radiation limit is <600 mSv effective dose for all crew (NASA-STD-3001), against a measured GCR transit rate of 1.8 mSv/day (MSL RAD, 2011–12) — i.e. ≈0.32 Sv per 180-day leg, ≈0.65 Sv round trip before any surface stay — which is why the standard also sets a design GCR rate of <1.3 mSv/day in free space and requires ≥20 g/cm² shielding plus a water-equivalent storm shelter for >6-month missions.

### Cited Findings

**Table 5.1 — Consumables and metabolic rates per crew-member-day (82 kg reference astronaut, 90 min exercise/day)**

| Quantity | Value (kg/CM-d unless noted) | Source / confidence |
|---|---|---|
| O2 consumed | 0.89 | [Ewert & Stromgren, ICES-2019-126, July 2019](https://ntrs.nasa.gov/api/citations/20190027563/downloads/20190027563.pdf) Table 1 — H |
| CO2 produced | 1.08 | same — H |
| Food consumed / delivered | 1.76 consumed; 2.39 delivered (incl. 0.43 packaging, 0.20 unopened) + 0.2 prepared food wasted | same, BVAD Table 4-53 — H |
| Drinking water | 2.79 (raised from 2.0 in HIDH) | same §II.A — H |
| Food rehydration water | ≥0.5 | same — H |
| Urine water / solids | 1.40 / 0.06 | same — H |
| Respiration + perspiration vapour | 2.53; liquid sweat 0.51 | same Table 1 — H |
| Faeces water / solids | 0.09 / 0.03 | same (BVAD Table 3-33) — H |
| Metabolic energy | 12,778 kJ/d (≈148 W average) | same Table 1 — H |
| ISS recovery | ≈99 % of water vapour recyclable; urine distillation loses ≈15 %; Sabatier recovers 0.47 kg water/person/d at 90 % (H2-limited) | same §III.B — H |
| DRA-era consumables assumption | 2.45 kg/person/d; 5.37 t for 6 crew × ~1 yr | Borowski Table 1 — H |
| ESM consumables (Orion, 4 crew, ≤21 d) | water 240 kg, O2 90 kg, N2 30 kg | Wikipedia ESM — M |
| Mars surface ISRU for life support (DRA 5.0) | 2 t O2 + 3.5 t water | DRA slides 2009-01-15 — H |

**Table 5.2 — Radiation standards (NASA-STD-3001 Vol 1 Rev C / Vol 2 Rev D via OCHMO-TB-020 Rev G, 2025-06-06)**

| Requirement | Value | Source / confidence |
|---|---|---|
| Career limit (V1 4030) | <600 mSv NASA effective dose, universal for all ages/sexes; paired with 3 % mean cancer-mortality risk rationale | OCHMO-TB-020 Rev G — H |
| SPE limit (V1 4031) | <250 mSv per design reference event | same — H |
| Nuclear technologies (V1 4032) | <20 mSv per mission-year (ALARA) | same — H |
| GCR design dose rate (V1 4033), habitable systems >60 d | <1.3 mSv/d free space; <0.9 mSv/d planetary surface | same — H |
| ALARA (V1 4029) | all exposures minimized | same — H |
| Shielding guidance | missions >6 months: ≥20 g/cm² vehicle shielding; +≈10 cm water-equivalent storm shelter (1-in-100-yr SPE) or +≈20 cm (1-in-1000-yr); Al/polyethylene cut SPE dose ≈50 % but GCR only ≈7 % | same — H |
| Median shielding by vehicle (g/cm²) | Skylab 7; Shuttle 40; ISS 54 (1–4,800 by location); Orion 32; Apollo CM 11; Apollo LM 4; EVA suit 2; Mars atmosphere 42; Earth 1,000 | same — H |
| Surface-mission environment used in examples | ≈0.5 mSv/d | same — H |
| NTP example in standard | 1.5 mSv/d × 90 d saved = 135 mSv vs 150 mSv reactor source → net +15 mSv | same — H |

**Table 5.3 — Measured Mars-transit dose**

| Quantity | Value | Source / confidence |
|---|---|---|
| GCR dose-equivalent rate in cruise | 1.8 mSv/d (MSL RAD, Dec 2011–Jul 2012, "modest" shielding) | [NASA JPL release 2013-05-30; Zeitlin et al., Science 2013-05-31](https://www.jpl.nasa.gov/news/data-from-nasa-rovers-voyage-to-mars-aids-planning/) — H |
| SEP share | ≈3 % of dose | same — H |
| Risk coefficient quoted | 1 Sv ≈ +5 % fatal cancer risk | same — H |
| Derived one-way (180 d) / round-trip (360 d) transit dose | ≈324 mSv / ≈648 mSv (my multiplication; not stated in source) | L |

### Inferences
- With the 600 mSv career limit, a DRA-5.0-class mission (≈375 d transit at 1.8 mSv/d ≈ 0.68 Sv, plus ≈540 d surface at ~0.5–0.7 mSv/d ≈ 0.27–0.38 Sv) exceeds the limit (≈0.95–1.05 Sv total) unless shielding/transit time improve — hence NASA's <1.3 mSv/d design rate and NTP's shorter-transit rationale (derived, L).
- Open-loop water for 6 crew × 900 d at ≈3.3 kg/CM-d would be ≈18 t; the DRA-era 2.45 kg/CM-d planning figure already assumes substantial closure (derived, L).

### Gaps
- The BVAD's own nominal values (the ~0.82 kg O2 / 1.04 kg CO2 / 1.83 kg food set) were not directly fetched; the ICES-2019 paper quotes BVAD table numbers but gives updated metabolic values. Treat the two sets as 2015-vs-2019 NASA baselines.
- ECLSS system masses (open vs closed loop, kg per crew), equivalent-system-mass trades, O2-recovery-from-CO2 percentage, and spares fractions: not retrieved.
- Microgravity countermeasure specifics (exercise device masses, artificial-gravity trades): not researched beyond the 90 min/day exercise assumption in ICES-2019-126.
- Mars surface dose from RAD (often quoted ≈0.64–0.7 mSv/d) was not in the fetched JPL release — UNVERIFIED here.
- Dose-rate values for Orion/Artemis II crew (the planned radiation-shielding demonstration was cancelled in flight): not available.
